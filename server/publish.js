Tasks = new Mongo.Collection('Tasks');
TagTypes = new Mongo.Collection("TagTypes");
Notifications = new Mongo.Collection("Notifications");
Schedules = new Mongo.Collection("Schedules");

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
Meteor.publish("schedules", function(){
	return Schedules.find({userId: this.userId}, {fields: {"thresholds" : 0}} );
});
Meteor.publish("allUsers", function () {
	return Meteor.users.find({},
	{fields: {
     // specific fields to return
     '_id' : 1,
     'username': 1,
     'createdAt': 1,
     'profile': 1
	}})
}
 );
//, {fields: {'everythingButThisField':0}}
	// return Schedules.find({userId: this.userId}, {fields: {"thresholds" : 0}} );
