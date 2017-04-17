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
			timeUTC: task.timeUTC
		});

		// Get this user's tags
		let user = TagTypes.findOne({"userId" : Meteor.userId()});
		console.log(user.tags[0].uses);
		// Find tag in array 
		let index = user.tags.findIndex((tag)=>{return tag.type === task.tagType});
		console.log("Index: " + index);
		// Increment
		user.tags[index].uses++;
		console.log("Tag to increment:" + user.tags[index], "Uses after incrementing: " + user.tags[index].uses);
		// Update user's tags
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
		if(user.tags.findIndex((tag)=>{ return tag.type.toLowerCase() === "homework".toLowerCase()}) !== -1){
			return "exists";
		}
		user.tags.push({"type" : tag, "uses" : 0});

		TagTypes.update(user._id, {
			$set: {tags: user.tags }
		});

		let mySched = Schedules.findOne({"userId" : Meteor.userId()});
		daysOfWeek.map((day)=>{
			hours.map((hour)=>{
				mySched.thresholds[day][hour][tag] = 1;
			});
		});
		Schedules.update(mySched._id, {
			$set: {thresholds: mySched.thresholds}
		});
	},
	addDefaultTags(){
		let myTags = {
			userId: Meteor.userId(),
			tags: []
		};
		tags.map((tag)=>{ myTags.tags.push({"type" : tag, "uses" : 0})  });

		TagTypes.insert(myTags);
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
		let schedule = {
			userId : Meteor.userId(),
			schedule : Schedule(),
			thresholds: Thresholds()
		};
		console.log("imma create da default schedule");
		Schedules.insert(schedule);
		console.log("i created a default schedule");
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
		let mySched = Schedules.findOne({userId : Meteor.userId()});
		let possibleTimes = [];
		const offset = data.today.getDay();

		/* Populate array of all possible times */
		for( let i = 0; i < daysOfWeek.length; i++) {
			let pointer = (i + offset) % daysOfWeek.length; 

			hours.map((hour)=>{
				if(mySched.schedule[daysOfWeek[pointer]][hour] === null){
				 	possibleTimes.push({"day" : pointer, "time": hour});
				 } 
			})
		}


		/* Filter out all times to remove hours where user has less than 50% of completing task */
		possibleTimes = possibleTimes.filter((coord)=>{
			return mySched.thresholds[daysOfWeek[coord.day]][coord.time][data.tag] >= 0.5
		});

		/* Filter out all times to remove hours where task is already set */
		possibleTimes = possibleTimes.filter((coord)=>{
			let daysFromToday = coord.day - new Date().getDay();
			let bestDate = moment().add(daysFromToday, "days").format();	
		
			return Tasks.findOne({dateStart : bestDate.substring(0,10) , timeStart: {$regex: coord.time.substring(0,2) + ".*"}}) === undefined ? true : false;
		});
		console.log(possibleTimes[0], possibleTimes.length)
		return possibleTimes[0];

	}
});

const Schedule = ()=>{
	const self = {};
	daysOfWeek.map((day)=>{self[day] = Block() })
	return self;
};
const Thresholds = () => {
	const self = {};
	let thresholdObj = {}; 
	tags.map((tag)=>{ thresholdObj[tag] = 1});

	daysOfWeek.map((day)=>{ self[day] = {} }); 
	daysOfWeek.map((day)=>{ hours.map((hour)=>{ self[day][hour] = thresholdObj  })   });
	return self;
};
const Block = ()=>{ 
	const self = {};

	hours.map((hour)=>{
		self[hour] = null
	})
	return self;
};

const daysOfWeek = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

const hours = ["00:00", "01:00", "02:00", "03:00", "04:00", "05:00", "06:00", "07:00", "08:00", "09:00", "10:00", "11:00", "12:00", "13:00", "14:00", "15:00", "16:00", "17:00", "18:00", "19:00", "20:00", "21:00", "22:00", "23:00"];

let tags = ["Homework", "Study", "Doctor", "Exercise", "Meeting", "Groceries", "Errands", "Music Practice", "Cleaning"];



