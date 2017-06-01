import moment from 'moment';

/* Server methods to be called by client */
Meteor.methods({
	/* taskes a task object and stores it in the Tasks Collection for this user as well as increments the tag to make it more visible */
	addTask(task){
		/* Make sure user exists */
		if(!Meteor.userId() !== task.userId){
			throw new Meteor.Error('not-authorized');
		} 
		Tasks.insert({
			text: task.text,
			dateStart: task.dateStart,
			timeStart: task.timeStart,
			tag: task.tagType,
			completed: false,
			createdAt: new Date(new Date().getTime() - (new Date().getTimezoneOffset() * 60000)).getTime(),
			userId : Meteor.userId(),
			desc : task.desc,
			alarm: task.alarm,
			timeUTC: task.timeUTC
		});
		/* Get this user's tags */
		let user = TagTypes.findOne({"userId" : Meteor.userId()});
		/* Find tag in array  */
		let index = user.tags.findIndex((tag)=>{return tag.type === task.tagType});
		/* Increment */
		user.tags[index].uses++;
		/* Update user's tags */
		TagTypes.update(user._id, {
			$set: {tags: user.tags }
		});

	},
	/* toggle the completion status of a task. This is reflected in the user's task list as being checked off or not */
	toggleTask(task){
		/* Make sure user exists */
		if(Meteor.userId() !== task.userId){
			throw new Meteor.Error('not-authorized');
		}
		Tasks.update(task._id, {
			$set: {completed: !task.completed }
		})
	},
	/* Update an exisitng task, accepts a task object and updates the fields except for the userId, completed, createdAt */
	updateTask(task){
		/* Make sure user changing task is the owner */
		if(!Meteor.userId() !== task.userId){
			throw new Meteor.Error('not-authorized');
		}
		Tasks.update(task._id, {
			$set: {
				text : task.text,
				dateStart : task.dateStart,
				timeStart : task.timeStart,
				desc : task.desc,
				alarm: task.alarm,
				timeUTC : task.timeUTC
			}
		});
	},
	/* Takes a task object, but we only need to send the id, consider only sending the id over the wire */
	deleteTask(taskId){
		/* Make sure user changing task is the owner */
		if(Meteor.userId()){
			throw new Meteor.Error('not-authorized');
		}
		Tasks.remove(taskId);
	}, 
	/* Not used in production but useful for tests; Much slower than client implementation */
	getTasks(){
		return Tasks.find().fetch();
	},
	/* Create a new tag for that user, takes a string for the tag  and adds it to the Tag types object and adds it to the thresholds object */
	addTag(tag){
		/* Make sure user is the owner */
		if(!Meteor.userId()){
			throw new Meteor.Error('not-authorized');
		} 
		let user = TagTypes.findOne({"userId" : Meteor.userId()});

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
		let mySched = Schedules.findOne({"userId" : Meteor.userId()});
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
	addDefaultTags(){
		/* Make sure user is the owner */
		if(!Meteor.userId()){
			throw new Meteor.Error('not-authorized');
		} 
		let myTags = {
			userId: Meteor.userId(),
			tags: []
		};
		tags.map((tag)=>{ myTags.tags.push({"type" : tag, "uses" : 0})  });

		TagTypes.insert(myTags);
	},
	/* After triggering a notification and clicking on the alert, change the notice object so that we don't see the same thing twice */
	seeNotification(notice){
		/* Make sure user is the owner */
		if(Meteor.userId() !== notice.userId){
			throw new Meteor.Error('not-authorized');
		}
		Notifications.update(notice._id, {
			$set: {seen: true }
		})
	},
	/* On Setup add initial schedule object for the user */
	addDefaultSchedule(){
		/* Make sure user is the owner */
		if(!Meteor.userId()){
			throw new Meteor.Error('not-authorized');
		} 
		/* From the user's profile, get their bedtime and use that as an offset for their actual bioCurve. Then pass their bioCurve into the Thresholds Object parameters */
		let myBioCurve = offsetBioCurve(parseInt(Meteor.user().profile.bedHour.substring(0,2)))
		let schedule = {
			userId : Meteor.userId(),
			schedule : Schedule(),
			thresholds: Thresholds(myBioCurve)
		};
		Schedules.insert(schedule);
	},
	/* User is trying to make a change to one cell of their schedule, takes in a coordinate string (e.g. Sun-03:00 === Sunday @ 3AM) to tell us where on the schedule grid they're changing the data*/
	modifySchedule(coords){
		/* Make sure user is the owner */
		if(!Meteor.userId()){
			throw new Meteor.Error('not-authorized');
		} 
		let mySchedule = Schedules.findOne({userId : Meteor.userId()});

		day = coords.substring(0, 3);
		hour = coords.substring(4, 9);

		/* If they were currently busy, allow them to be not busy and vice versa. Later this will support different types */
		mySchedule.schedule[day][hour] = mySchedule.schedule[day][hour] === null ? {"type" : "work"} : null;

		/* Save changes to the schedule */
		Schedules.update(mySchedule._id, {
			$set : {schedule : mySchedule.schedule}
		});
	},
	/* Boy howdy you better sit down for this one
	*  Method to schedule the best possible time for an incoming task
	*  Gets the user's current date, time, and the tag they're using to find the best time for it in the coming week
	*  given their liklihood to complete it.
	*/
	scheduleBestTime(data){
		// const t0 = new Date().getTime();
		// console.log("Attempting to find the best time");
		let mySched = Schedules.findOne({userId : Meteor.userId()});
		let possibleTimes = [];
		const offset = data.today.getDay();
		const thisHour = data.today.toJSON().substring(11,13) - data.today.getTimezoneOffset() / 60 < 10 ? "0" + (data.today.toJSON().substring(11,13) - data.today.getTimezoneOffset() / 60) + ":00" : (data.today.toJSON().substring(11,13) - data.today.getTimezoneOffset() / 60) + ":00";
		const todayFormatted = data.today.toJSON().substring(0,10);

		/* Get this upcoming week's tasks to match against */
		let tasks = Tasks.find({userId: Meteor.userId()}, {gte: todayFormatted, lte: moment(todayFormatted, "YYYY-MM-DD").add(7, 'days').format("YYYY-MM-DD")}).fetch();
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
				let daysFromToday = (coord.day - new Date().getDay()) < 0 ? 7 - Math.abs(coord.day - new Date().getDay()): (coord.day - new Date().getDay())
				// console.log("At ", coord, " there is a " + mySched.thresholds[daysOfWeek[coord.day]][coord.time][data.tag] + " chance")	
				return (mySched.thresholds[daysOfWeek[coord.day]][coord.time][data.tag] - daysFromToday * 0.01) >= target;
			});
			// console.log("At " + (target * 100) + "%, there are " + tempPossibilites.length + " times available")
			/* Filter out all times to remove hours where task is already set */
			tempPossibilites = tempPossibilites.filter((coord)=>{
				let daysFromToday = coord.day - data.today.getDay() >= 0 ? coord.day - data.today.getDay() : 7 + (coord.day - data.today.getDay());
				let bestDate = moment().add(daysFromToday, "days").format();	
				// console.log("There is " + (Tasks.findOne({userId: Meteor.userId(), dateStart : bestDate.substring(0,10) , timeStart: {$regex: coord.time.substring(0,2) + ".*"}}) !== undefined ? "something" : "nothing") + " on " + bestDate.substring(0,10) + " at " + coord.time)
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
		return possibleTimes[0];

	},
	/* I hope you're still sitting because this is gross */
	/* This method adjusts the probability that a user will complete an action on a given day at a given time after either failure or success 
	* Accepts a data object containing a date, time, and tag
	*/
	changeThreshold(data){
		let mySched = Schedules.findOne({userId : Meteor.userId()});
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
	toggleCompleteTour(step){
		if(!Meteor.userId()){
			throw new Meteor.Error('not-authorized');
		} 
		let usertut = Meteor.user().profile.tut;
		usertut[step] = true;

		Meteor.users.update(Meteor.userId(), {
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

