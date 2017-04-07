Tasks = new Mongo.Collection('Tasks');
TagTypes = new Mongo.Collection("TagTypes");
/* to get a user's userId use this.userId  */
Meteor.publish("userTasks", function(){
	return Tasks.find({userId: this.userId});
});
Meteor.publish("tagTypes", function(){
	return TagTypes.find();
});