Tasks = new Mongo.Collection('Tasks');
TagTypes = new Mongo.Collection("TagTypes");
Notifications = new Mongo.Collection("Notifications");

/* to get a user's userId use this.userId  */
Meteor.publish("userTasks", function(){
	return Tasks.find({userId: this.userId});
});
Meteor.publish("tagTypes", function(){
	return TagTypes.find({userId: this.userId});
});
Meteor.publish("notifications", function(){
	return Notifications.find({userId: this.userId});
});