import moment from 'moment';
const twilioClient = new Twilio({
	from: Meteor.settings.TWILIO.FROM,
	sid: Meteor.settings.TWILIO.SID,
	token: Meteor.settings.TWILIO.TOKEN
});

/* Server methods to be called by client */
Meteor.methods({
	/* Find a single user by userId */
	findOneUser(id){
		return Meteor.users.findOne({_id : id}).username;
	},
	getUserByName(username){
		return Meteor.users.findOne({username: username});
	},
	sendSMS(to, message){
		try {
			var result = twilioClient.sendSMS({
				to: to,
				body: message
			});
		} catch (err) {
			throw new Meteor.Error(err);     
		}
		return result;
	},
	/* takes a task object and stores it in the Tasks Collection for this user as well as increments the tag to make it more visible */
	addTask(task, user){
		/* Make sure user exists */
		if(user._id === null || user._id === undefined){
			throw new Meteor.Error('Not authorized');
		} 
		let lastId = "";

		Tasks.insert({
			text: task.text,
			dateStart: task.dateStart,
			timeStart: task.timeStart,
			dateEnd: task.dateEnd,
			timeEnd: task.timeEnd,
			tag: task.tagType,
			completed: false,
			createdAt: new Date(new Date().getTime() - (new Date().getTimezoneOffset() * 60000)).getTime(),
			userId : user._id,
			desc : task.desc,
			alarm: task.alarm,
			timeUTC: task.timeUTC,
			timeUTCEnd: task.timeUTCEnd,
			sharingWith: task.sharingWith
		}, (err, result)=>{
			if(err){
				console.log(err);
			} else {
				/* Notify other users of shared task, if any */
				Meteor.defer(()=>{
					let lastTask = Tasks.findOne({_id : result});

					task.sharingWith.map((sharedUser)=>{
						Notifications.insert({
							userId: sharedUser._id,
							type: "taskShare",
							data : lastTask,
							seen: false,
							timestamp: new Date().getTime()
						});
					});
				});
			}
		});

		/* Get this user's tags */
		let userTags = TagTypes.findOne({"userId" : user._id});
		/* Find tag in array  */
		let index = userTags.tags.findIndex((tag)=>{return tag.type === task.tagType});
		/* Increment */
		userTags.tags[index].uses++;
		/* Update user's tags */
		TagTypes.update(userTags._id, {
			$set: {tags: userTags.tags }
		});

	},
	/* toggle the completion status of a task. This is reflected in the user's task list as being checked off or not */
	toggleTask(task, thisUser){
		/* Make sure user exists */
		if(thisUser._id !== task.userId){
			throw new Meteor.Error('not-authorized');
		}
		Tasks.update(task._id, {
			$set: {completed: !task.completed }
		})
		Meteor.apply("changeThreshold", [{date: task.dateStart, time: task.timeStart, amt: task.completed ? -0.15 : 0.15}, thisUser]);
	},
	/* Find Users to share tasks with */
	findUsers(search, thisUser){
		let users = Meteor.users.find({username: {$regex: search + ".*", $options : "i"}, _id: {$not: {$eq: thisUser._id}}}, {limit : 5}).fetch();
		return users.length > 0 ? users : null;
	},
	/* Update an exisitng task, accepts a task object and updates the fields except for the userId, completed, createdAt */
	updateTask(task, thisUser){
		/* Make sure user changing task is the owner */
		if(!thisUser._id){
			throw new Meteor.Error('not-authorized');
		}
		Tasks.update(task._id, {
			$set: {
				text : task.text,
				dateStart : task.dateStart,
				timeStart : task.timeStart,
				dateEnd: task.dateEnd,
				timeEnd: task.timeEnd,
				desc : task.desc,
				alarm: task.alarm,
				timeUTC : task.timeUTC,
				timeUTCEnd: task.timeUTCEnd,
				sharingWith: task.sharingWith
			}
		});
	},
	/* Takes a task object, but we only need to send the id, consider only sending the id over the wire */
	deleteTask(taskId, thisUser){
		/* Make sure user changing task is the owner */
		if(!thisUser._id){
			throw new Meteor.Error('Not authorized');
		}
		Tasks.remove(taskId);
	}, 
	/* Mostly used for remote DDP call, should later include filter for only tasks this month */
	getTasks(thisUser){
		return Tasks.find(thisUser._id).fetch();
	},
	/* Create a new tag for that user, takes a string for the tag  and adds it to the Tag types object and adds it to the thresholds object */
	addTag(tag, thisUser){
		/* Make sure user is the owner */
		if(!thisUser._id){
			throw new Meteor.Error('not-authorized');
		} 
		let user = TagTypes.findOne({"userId" : thisUser._id});
		if(tag.includes(".")){
			return "503";
		}
		/* Make sure tag isn't already in DB */
		if(user.tags.findIndex((thisTag)=>{ return thisTag.type.toLowerCase() === tag.toLowerCase()}) !== -1){
			return "exists";
		}
		/* Tag is new so we add it to the array of objects */
		user.tags.push({"type" : tag, "uses" : 0});

		/* save changes  to tag types object */
		TagTypes.update(user._id, {
			$set: {tags: user.tags }
		});

		/* Update Schedule Thresholds to include this tag 
		* For Each day of the week, for each hour we want to add the threshold of completing this tag
		*  Depending on the number of custom tags, this object could get huge(r) but as long as it's indexable it should be fine 
		*/
		let mySched = Schedules.findOne({"userId" : thisUser._id});
		daysOfWeek.map((day)=>{
			hours.map((hour)=>{
				mySched.thresholds[day][hour][tag] = bioCurve[hours.indexOf(hour)];
			});
		});
		/* Update the schedule object */
		Schedules.update(mySched._id, {
			$set: {thresholds: mySched.thresholds}
		});
	},
	/* On Setup add the nine initial tags to the user's tagTypes object */
	addDefaultTags(thisUser){
		/* Make sure user is the owner */
		if(!thisUser._id){
			throw new Meteor.Error('not-authorized');
		} 
		let myTags = {
			userId: thisUser._id,
			tags: []
		};
		tags.map((tag)=>{ myTags.tags.push({"type" : tag, "uses" : 0})  });

		TagTypes.insert(myTags);
	},
	registerRemote(user){
		try {
			let result = Accounts.createUser({
				username: user.username,
				password: user.password,
				profile: {
					pic: null,
					bedHour: user.bedHour,
					tut : {
						'login' : false,
						'schedule' : false,
						'addTasks': false,
					}
				}
			});
			if(result){
				console.log(result);

				Meteor.call("addDefaultTagsRemote", result);
				Meteor.call("addDefaultScheduleRemote", {id: result, hour: user.profile.bedHour});
				console.log("finishing", result)
				return result;
			} else {
				console.log(result, "something wrong")
			}
		} catch(err){
			console.log(err)
			return err;
		}
	},
	addDefaultTagsRemote(id){
		let myTags = {
			userId: id,
			tags: []
		};
		tags.map((tag)=>{ myTags.tags.push({"type" : tag, "uses" : 0})  });

		TagTypes.insert(myTags);
	},
	addDefaultScheduleRemote(data){
		/* From the user's profile, get their bedtime and use that as an offset for their actual bioCurve. Then pass their bioCurve into the Thresholds Object parameters */
		let myBioCurve = offsetBioCurve(parseInt(data.hour.substring(0,2)));
		let schedule = {
			userId : data.id,
			schedule : Schedule(),
			thresholds: Thresholds(myBioCurve)
		};
		Schedules.insert(schedule);
	},
	/* On Setup add initial schedule object for the user */
	addDefaultSchedule(thisUser){
		/* Make sure user is the owner */
		if(!thisUser._id){
			throw new Meteor.Error('not-authorized');
		} 
		/* From the user's profile, get their bedtime and use that as an offset for their actual bioCurve. Then pass their bioCurve into the Thresholds Object parameters */
		let myBioCurve = offsetBioCurve(parseInt(thisUser.profile.bedHour.substring(0,2)))
		let schedule = {
			userId : thisUser._id,
			schedule : Schedule(),
			thresholds: Thresholds(myBioCurve)
		};
		Schedules.insert(schedule);
	},
	/* After triggering a notification and clicking on the alert, change the notice object so that we don't see the same thing twice */
	seeNotification(notice){
		/* Make sure user is the owner */
		if(thisUser._id !== notice.userId){
			throw new Meteor.Error('not-authorized');
		}
		Notifications.update(notice._id, {
			$set: {seen: true }
		})
	},
	/* User is trying to make a change to one cell of their schedule, takes in a coordinate string (e.g. Sun-03:00 === Sunday @ 3AM) to tell us where on the schedule grid they're changing the data*/
	modifySchedule(coords, thisUser){
		/* Make sure user is the owner */
		if(!thisUser._id){
			throw new Meteor.Error('not-authorized');
		} 
		let mySchedule = Schedules.findOne({userId : thisUser._id});

		day = coords.substring(0, 3);
		hour = coords.substring(4, 9);

		/* If they were currently busy, allow them to be not busy and vice versa. Later this will support different types */
		mySchedule.schedule[day][hour] = mySchedule.schedule[day][hour] === null ? {"type" : "work"} : null;

		/* Save changes to the schedule */
		Schedules.update(mySchedule._id, {
			$set : {schedule : mySchedule.schedule}
		});
	},
	updateUsername(username, thisUser){
		if(!Meteor.users.findOne({username: username})){
			/* This username is available. Update this user and then return "200" success */
			Meteor.users.update(thisUser._id, {
				$set: {username: username}
			});
			return "200";
		} else {
			/* this username is not available return "403" forbidden */
			return "403";
		}
	},
	updateProfilePic(imgAsString, thisUser){
		if(!thisUser._id){
			throw new Meteor.Error('not-authorized');
		} 
		let userProfile = thisUser.profile;
		userProfile.pic = imgAsString;
		Meteor.users.update(thisUser._id, {
			$set : {
				profile : userProfile
			}
		});
	},
	/* Boy howdy you better sit down for this one
	*  Method to schedule the best possible time for an incoming task
	*  Gets the user's current date, time, and the tag they're using to find the best time for it in the coming week
	*  given their liklihood to complete it.
	*/
	scheduleBestTime(data, thisUser){
		// const t0 = new Date().getTime();
		// console.log("Attempting to find the best time");
		let mySched = Schedules.findOne({userId : thisUser._id});
		let possibleTimes = [];
		const offset = parseInt(moment(data.today, "YYYY-MM-DDTHH:mm:ss").format('e')) ;
		const thisHour = moment(data.today, "YYYY-MM-DDTHH:mm:ss").format('HH:00');
		const todayFormatted = moment(data.today, "YYYY-MM-DDTHH:mm:ss").format('YYYY-MM-DD');

		/* Make sure tag type exists in thresholds */
		if(!mySched.thresholds["Sun"]["00:00"].hasOwnProperty(data.tag)){
			daysOfWeek.map((day)=>{
				hours.map((hour)=>{
					mySched.thresholds[day][hour][data.tag] = bioCurve[hours.indexOf(hour)];
				});
			});
			/* update user's schedule */
			Schedules.update({userId: user._id}, {
				$set : {
					thresholds : mySched.thresholds
				}
			})
		}

		/* Get this upcoming week's tasks to match against */
		let tasks = Tasks.find({userId: thisUser._id, dateStart: {gte: todayFormatted, lte: moment(todayFormatted, "YYYY-MM-DD").add(7, 'days').format("YYYY-MM-DD")}}).fetch();
		/* Populate array of all possible times */
		for( let i = 0; i < daysOfWeek.length; i++) {
			let pointer = (i + offset) % daysOfWeek.length; 
			hours.map((hour)=>{
				if(mySched.schedule[daysOfWeek[pointer]][hour] === null){
					/* If we're looking at hours in today's block, make sure we're not looking at blocks that have already occured */
					if(i === 0 && hour > thisHour){ 
						possibleTimes.push({"day" : pointer, "time": hour});
					} else if(i > 0){
						possibleTimes.push({"day" : pointer, "time": hour});
					}
				} 
			})
		}

		/* Find the block of time with the highest probability as soon as possible
		* If there are no probable blocks, start over with a lower target
		*/
		let target = 0.6;
		let tempPossibilites = [];
		while(target > 0.1){
			tempPossibilites = possibleTimes;
			// console.log("Filtering with a target of " + (target * 100) + "%");
			/* Filter out all times to remove hours where user has less than target % probability of completing task 
			*	To prioritize blocks that are soonest, there is a 1% decay of action potential per day in the future to schedule a task
			*/
			tempPossibilites = tempPossibilites.filter((coord)=>{
				let daysFromToday = (coord.day - offsetBioCurve) < 0 ? 7 - Math.abs(coord.day - offset): (coord.day - offset)
				// console.log("At ", coord, " there is a " + mySched.thresholds[daysOfWeek[coord.day]][coord.time][data.tag] + " chance")	
				return (mySched.thresholds[daysOfWeek[coord.day]][coord.time][data.tag] - daysFromToday * 0.01) >= target;
			});
			// console.log("At " + (target * 100) + "%, there are " + tempPossibilites.length + " times available")
			/* Filter out all times to remove hours where task is already set */
			tempPossibilites = tempPossibilites.filter((coord)=>{
				let daysFromToday = coord.day - offset >= 0 ? coord.day - offset : 7 + (coord.day - offset);
				let bestDate = moment().add(daysFromToday, "days").format();	
					// console.log("There is " + (Tasks.findOne({userId: thisUser._id, dateStart : bestDate.substring(0,10) , timeStart: {$regex: coord.time.substring(0,2) + ".*"}}) !== undefined ? "something" : "nothing") + " on " + bestDate.substring(0,10) + " at " + coord.time)
					return tasks.findIndex((task)=>{ return task.dateStart === bestDate.substring(0,10) && task.timeStart === coord.time}) === - 1;
				});
			// console.log("At " + (target * 100) + "%, there are " + tempPossibilites.length + " times available with no other tasks scheduled")

			if(tempPossibilites.length > 0){
				break;
			} else {
				target -= 0.1;
				// console.log("Decreasing target to " + target);
			}
		}
		possibleTimes = tempPossibilites;

		// console.log(possibleTimes[0], possibleTimes.length)
		/* For now, return the first best time */
		// console.log(new Date().getTime() - t0)
		return possibleTimes;

	},
	/* I hope you're still sitting because this is gross */
	/* This method adjusts the probability that a user will complete an action on a given day at a given time after either failure or success 
	* Accepts a data object containing a date, time, and tag
	*/
	changeThreshold(data, thisUser){
		let mySched = Schedules.findOne({userId : thisUser._id});
		let weekDay = moment(data.date, "YYYY-MM-DD").format("E");
		let hour = data.time.substring(0,2) + ":00";
		// console.log("old threshold:" + mySched.thresholds[daysOfWeek[weekDay]][hour][data.tag] + " data amt to change by: " + data.amt);
		/* Update Action Potential at given weekday, at given time, for given tag */
		if(mySched.thresholds[daysOfWeek[weekDay]][hour][data.tag] + data.amt >= 1){
			/* User completed a task but it would push the probability over 100% so we cap it there */
			mySched.thresholds[daysOfWeek[weekDay]][hour][data.tag] = 1;
		} else if(mySched.thresholds[daysOfWeek[weekDay]][hour][data.tag] + data.amt <= 0){
			/* User didn't quite complete a task but it would push the probability below 0% so we cap it there */
			mySched.thresholds[daysOfWeek[weekDay]][hour][data.tag] = 0;
		} else {
			/* Change the user's threshold by incoming amount */
			mySched.thresholds[daysOfWeek[weekDay]][hour][data.tag] += data.amt;
		}
		// console.log("new threshold:" + mySched.thresholds[daysOfWeek[weekDay]][hour][data.tag] + " data amt to change by: " + data.amt);
		/* Save changes */
		Schedules.update(mySched._id, {
			$set: {thresholds : mySched.thresholds}
		});
	},
	/* Takes a string indicating which step of the 'tutorial' has been completed */
	toggleCompleteTour(step, thisUser){
		if(!thisUser._id){
			throw new Meteor.Error('not-authorized');
		} 
		let usertut = thisUser.profile.tut;
		usertut[step] = true;

		Meteor.users.update(thisUser._id, {
			$set: { 
				profile: { 
					tut: usertut
				}
			}
		});
	}
});

/* Schedule Object constructor - creates a 7*24 grid of Block objects to simulate the user's hourly schedule */
const Schedule = ()=>{
	const self = {};
	daysOfWeek.map((day)=>{self[day] = Block() })
	return self;
};
/* Thresholds Object Constructor - contains action potential (P(complete a task at assigned time) for each tag type for each hour of each day 
* Takes a biocurve array of floats that represents a discrete productivity curve over the day
* For each hour get an object that represents the AP of each task at that hour and day
*/
const Thresholds = (myBioCurve) => {
	const self = {};
	daysOfWeek.map((day)=>{ self[day] = {} }); 
	daysOfWeek.map((day)=>{ hours.map((hour)=>{ self[day][hour] = HourThresholdObj(hour, myBioCurve)  })   });
	return self;
};
/* HourThresholdObj Constructor - an object that lists the AP for completing a task in that hour 
* Takes an hour string and finds the AP for that hour given a specific bioCurve
*/
const HourThresholdObj = (hour, myBioCurve)=>{
	let self = {}; 
	tags.map((tag)=>{ self[tag] = myBioCurve[hours.indexOf(hour)]});
	return self;
};
/* Block Constructor - an object to store user activity for each hour of the day */
const Block = ()=>{ 
	const self = {};
	hours.map((hour)=>{
		self[hour] = null
	})
	return self;
};
/* A discrete-stepped array representing the AP of a human during each over of the day assuming the first hour is 12 AM, 
* this method takes an offset in hours and shifts the curve to match when the user goes to sleep (the default is 12AM) */
const offsetBioCurve = (offset)=>{
	offset = 24 - offset;
	let newCurve = [];
	for( var i = 0; i < bioCurve.length; ++i) {
		var pointer = (i + offset) % bioCurve.length;
		newCurve.push(bioCurve[pointer]);
	}
	return newCurve;
};

const daysOfWeek = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

const hours = ["00:00", "01:00", "02:00", "03:00", "04:00", "05:00", "06:00", "07:00", "08:00", "09:00", "10:00", "11:00", "12:00", "13:00", "14:00", "15:00", "16:00", "17:00", "18:00", "19:00", "20:00", "21:00", "22:00", "23:00"];

let tags = ["Homework", "Study", "Doctor", "Exercise", "Meeting", "Groceries", "Errands", "Music Practice", "Cleaning"];

const bioCurve = [0.38, 0.41, 0.42, 0.45, 0.49, 0.54, 0.61, 0.68, 0.76, 0.83, 0.87, 0.76, 0.63, 0.61, 0.54, 0.61, 0.63, 0.76, 0.7, 0.67, 0.65, 0.6, 0.55, 0.5];

