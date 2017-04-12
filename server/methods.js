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
			desc : task.desc
		});
		let tag = TagTypes.findOne({type: task.tagType});
			TagTypes.update(tag._id, {
				$set: {uses: tag.uses + 1 }
			})
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
		TagTypes.insert(
		{
			"type" : tag.type,
			"uses" : 0
		}
		);
	},
	getTags(){
		return TagTypes.find().fetch();
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
