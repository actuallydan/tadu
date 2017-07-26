/* Instantiate server database/collections */
Tasks = new Mongo.Collection('Tasks');
TagTypes = new Mongo.Collection("TagTypes");
Notifications = new Mongo.Collection("Notifications");
Schedules = new Mongo.Collection("Schedules");

/* Publish data as cursors (don't use .fetch() after) to client */
/* to get a user's userId use this.userId  */
Meteor.publish("userTasks", function(){
	/* Find all tasks create by the user OR where the user has been allowed to share the task */
	const user = Meteor.users.findOne({_id : this.userId});
	return Tasks.find({$or : [{userId: this.userId}, {sharingWith : {$elemMatch : {username: user.username, _id : this.userId }}}]})
});
Meteor.publish("tagTypes", function(){
	return TagTypes.find({userId: this.userId});
});
Meteor.publish("notifications", function(){
	return Notifications.find({userId: this.userId});
});
Meteor.publish("schedules", function(){
	return Schedules.find({userId: this.userId}, {fields: {"thresholds" : 0}} );
});
Meteor.publish("allUsers", function () {
	return Meteor.users.find({_id: this.userId},
	{fields: {
     // specific fields to return
     'services' : 0
     	}})
});
//, {fields: {'everythingButThisField':0}}
	// return Schedules.find({userId: this.userId}, {fields: {"thresholds" : 0}} );
