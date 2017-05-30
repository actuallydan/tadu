import moment from 'moment';

Meteor.methods({
	addTask(task){
		if(!Meteor.userId()){
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
	toggleTask(task){
		if(Meteor.userId() !== task.userId){
			throw new Meteor.Error('not-authorized');
		}
		Tasks.update(task._id, {
			$set: {completed: !task.completed }
		})
	},
	updateTask(task){
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
	deleteTask(task){
		if(Meteor.userId() !== task.userId){
			throw new Meteor.Error('not-authorized');
		}
		Tasks.remove(task._id);
	}, 
	getTasks(){
		return Tasks.find().fetch();
	},
	addTag(tag){
		if(!Meteor.userId()){
			throw new Meteor.Error('not-authorized');
		} 
		let user = TagTypes.findOne({"userId" : Meteor.userId()});
		/* Make sure tag isn't already in DB */
		if(user.tags.findIndex((thisTag)=>{ return thisTag.type.toLowerCase() === tag.toLowerCase()}) !== -1){
			return "exists";
		}
		user.tags.push({"type" : tag, "uses" : 0});

		TagTypes.update(user._id, {
			$set: {tags: user.tags }
		});

		let mySched = Schedules.findOne({"userId" : Meteor.userId()});
		daysOfWeek.map((day)=>{
			hours.map((hour)=>{
				mySched.thresholds[day][hour][tag] = bioCurve[hours.indexOf(hour)];
			});
		});
		Schedules.update(mySched._id, {
			$set: {thresholds: mySched.thresholds}
		});
	},
	addDefaultTags(){
		console.log('Attempting to create default tags');
		let myTags = {
			userId: Meteor.userId(),
			tags: []
		};
		tags.map((tag)=>{ myTags.tags.push({"type" : tag, "uses" : 0})  });

		TagTypes.insert(myTags);
		console.log("successfully created default tags");
	},
	seeNotification(notice){
		if(Meteor.userId() !== notice.userId){
			throw new Meteor.Error('not-authorized');
		}
		Notifications.update(notice._id, {
			$set: {seen: true }
		})
	},
	addDefaultSchedule(){
		console.log('Attempting to create default schedule');
		/* From the user's profile, get their bedtime and use that as an offset for their actual bioCurve. Then pass their bioCurve into the Thresholds Object parameters */
		let myBioCurve = offsetBioCurve(parseInt(Meteor.user().profile.bedHour.substring(0,2)))
		let schedule = {
			userId : Meteor.userId(),
			schedule : Schedule(),
			thresholds: Thresholds(myBioCurve)
		};
		Schedules.insert(schedule);
		console.log("Successfully created default schedule");
	},
	modifySchedule(coords){
		if(!Meteor.userId()){
			throw new Meteor.Error('not-authorized');
		} 
		let mySchedule = Schedules.findOne({userId : Meteor.userId()});

		day = coords.substring(0, 3);
		hour = coords.substring(4, 9);

		mySchedule.schedule[day][hour] = mySchedule.schedule[day][hour] === null ? {"type" : "work"} : null;

		Schedules.update(mySchedule._id, {
			$set : {schedule : mySchedule.schedule}
		});
	},
	scheduleBestTime(data){
		// const t0 = new Date().getTime();
		// console.log("Attempting to find the best time");
		let mySched = Schedules.findOne({userId : Meteor.userId()});
		let possibleTimes = [];
		const offset = data.today.getDay();
		const thisHour = data.today.toJSON().substring(11,13) - new Date().getTimezoneOffset() / 60 + ":00";
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
		let target = 0.5;
		let tempPossibilites = [];
		while(target > 0.1){
			tempPossibilites = possibleTimes;
			// console.log("Filtering with a target of " + (target * 100) + "%");
			/* Filter out all times to remove hours where user has less than target % probability of completing task 
			*	To prioritize blocks that are soonest, there is a 1% decay of action potential per day in the future to schedule a task
			*/
			tempPossibilites = tempPossibilites.filter((coord)=>{
				let daysFromToday = (coord.day - new Date().getDay()) < 0 ? 7 - Math.abs(coord.day - new Date().getDay()): (coord.day - new Date().getDay())
				return (mySched.thresholds[daysOfWeek[coord.day]][coord.time][data.tag] - daysFromToday * 0.01) >= target;
			});
			// console.log("At " + (target * 100) + "%, there are " + tempPossibilites.length + " times available")
			/* Filter out all times to remove hours where task is already set */
			tempPossibilites = tempPossibilites.filter((coord)=>{
				let daysFromToday = coord.day - data.today.getDay();
				let bestDate = moment().add(daysFromToday, "days").format();	
				// console.log("There is " + (Tasks.findOne({userId: Meteor.userId(), dateStart : bestDate.substring(0,10) , timeStart: {$regex: coord.time.substring(0,2) + ".*"}}) !== undefined ? "something" : "nothing") + " on " + bestDate.substring(0,10) + " at " + coord.time)
				return tasks.findIndex((task)=>{ task.dateStart === bestDate !== - 1})
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

		console.log(possibleTimes[0], possibleTimes.length)
		/* For now, return the first best time */
		// console.log(new Date().getTime() - t0)
		return possibleTimes[0];

	},
	changeThreshold(data){
		let mySched = Schedules.findOne({userId : Meteor.userId()});
		let weekDay = moment(data.date, "YYYY-MM-DD").format("E");
		let hour = data.time.substring(0,2) + ":00";
		// console.log("old threshold:" + mySched.thresholds[daysOfWeek[weekDay]][hour][data.tag] + " data amt to change by: " + data.amt);
		/* Update Action Potential at given weekday, at given time, for given tag */
		if(mySched.thresholds[daysOfWeek[weekDay]][hour][data.tag] + data.amt >= 1){
			mySched.thresholds[daysOfWeek[weekDay]][hour][data.tag] = 1;
		} else if(mySched.thresholds[daysOfWeek[weekDay]][hour][data.tag] + data.amt <= 0){
			mySched.thresholds[daysOfWeek[weekDay]][hour][data.tag] = 0;
		} else {
			mySched.thresholds[daysOfWeek[weekDay]][hour][data.tag] += data.amt;
		}
		// console.log("new threshold:" + mySched.thresholds[daysOfWeek[weekDay]][hour][data.tag] + " data amt to change by: " + data.amt);

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

const Schedule = ()=>{
	const self = {};
	daysOfWeek.map((day)=>{self[day] = Block() })
	return self;
};
const Thresholds = (myBioCurve) => {
	const self = {};

	daysOfWeek.map((day)=>{ self[day] = {} }); 
	daysOfWeek.map((day)=>{ hours.map((hour)=>{ self[day][hour] = HourThresholdObj(hour, myBioCurve)  })   });
	return self;
};
const HourThresholdObj = (hour, myBioCurve)=>{
	let self = {}; 
	tags.map((tag)=>{ self[tag] = myBioCurve[hours.indexOf(hour)]});
	return self;
};
const Block = ()=>{ 
	const self = {};

	hours.map((hour)=>{
		self[hour] = null
	})
	return self;
};
const offsetBioCurve = (offset)=>{
	offset = 24 - offset;
	let newCurve = [];
	for( var i=0; i < bioCurve.length; i++) {
		var pointer = (i + offset) % bioCurve.length;
		newCurve.push(bioCurve[pointer]);
	}
	return newCurve;
};

const daysOfWeek = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

const hours = ["00:00", "01:00", "02:00", "03:00", "04:00", "05:00", "06:00", "07:00", "08:00", "09:00", "10:00", "11:00", "12:00", "13:00", "14:00", "15:00", "16:00", "17:00", "18:00", "19:00", "20:00", "21:00", "22:00", "23:00"];

let tags = ["Homework", "Study", "Doctor", "Exercise", "Meeting", "Groceries", "Errands", "Music Practice", "Cleaning"];

const bioCurve = [0.38, 0.41, 0.42, 0.45, 0.49, 0.54, 0.61, 0.68, 0.76, 0.83, 0.87, 0.76, 0.63, 0.61, 0.54, 0.61, 0.63, 0.76, 0.63, 0.54, 0.45, 0.42, 0.41, 0.38];

