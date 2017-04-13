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
    let nowUTC = moment().utc().format().substring(0,16);

    let allAlerts = Tasks.find({timeUTC: {$eq : nowUTC}}).fetch();
    console.log(nowUTC);

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



