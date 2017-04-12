import { Meteor } from 'meteor/meteor';
import moment from 'moment';

Meteor.startup(() => {
  // code to run on server at startup
  if(TagTypes.find().fetch().length === 0){
  	console.log("TAG STATUS: 404 -- Default Tags Missing", "Attempting to populate tags");
  	defaultTags.map((tag)=>{
  		TagTypes.insert({
  			type: tag,
  			uses: 0
  		});
  	});
  } else {
  	console.log("TAG STATUS: 200 -- Default Tags Set");
  }

  SyncedCron.add({
  name: 'Send Out Alerts',
  schedule: function(parser) {
    // parser is a later.parse object
    return parser.text('every 1 min');
  },
  job: function() {
    
    let allAlerts = Tasks.find({dateStart: {$eq : new Date().toJSON().substring(0,10)}, timeStart: {$eq : moment().format("HH:mm")}}).fetch();
    console.log("Date: " + new Date().toJSON().substring(0,10), "Time: " + moment().format("HH:mm"))
    allAlerts.map((task)=>{
      Notifications.insert({
        userId: task.userId,
        type: "taskAlert",
        data : task,
        seen: false
      });
    })


  }
});
SyncedCron.start();


});


let defaultTags = ["Take a Nap","Take Out Trash","Work on Paper","Homework","Group Study","Tutoring","Dinner","Lunch","Breakfast","Weight Training","Study","Work Meeting","Go Running","Do dishes","Go Out to Eat","Get a Haircut","Doctor Appointment","Conference","Groceries","Pet Supplies","Office Party","School Meeting","Work on Poster","Work on Project","Group Project","Fill Up Tank"];