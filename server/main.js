import { Meteor } from 'meteor/meteor';
import moment from 'moment';

Meteor.startup(() => {
  // code to run on server at startup
  
 SyncedCron.config({
    // Log job run details to console
    log: false,
    logger: null
  });

  SyncedCron.add({
  name: 'Send Out Alerts',
  schedule: function(parser) {
    // parser is a later.parse object
    return parser.text('every 1 min');
  },
  job: function() {
    let nowUTC = moment().utc().format().substring(0,16);

    let allAlerts = Tasks.find({timeUTC: {$eq : nowUTC}, "completed" : false}).fetch();
    console.log(nowUTC);

    allAlerts.map((task)=>{
      Notifications.insert({
        userId: task.userId,
        type: "taskAlert",
        data : task,
        seen: false,
        timestamp: new Date().getTime()
      });
    })


  }
});
  SyncedCron.add({
  name: 'Clear Old Cron History',
  schedule: function(parser) {
    // parser is a later.parse object
    return parser.text('every 5 minutes');
  },
  job: function() {
    let nowUTC = moment().subtract(3, "h").utc().format();
    SyncedCron._collection.remove({"finishedAt": {"date" : {$lt: nowUTC}} });
  }
});
SyncedCron.start();


});



