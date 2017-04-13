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
		user.tags.push({"type" : tag, "uses" : 0});

		TagTypes.update(user._id, {
			$set: {tags: user.tags }
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
	}
});

let tags = ["Homework", "Study", "Doctor", "Exercise", "Meeting", "Groceries", "Errands", "Music Practice", "Cleaning"];

