import { Meteor } from 'meteor/meteor';
import moment from 'moment';

Meteor.startup(() => {
  /* Prevent cordova images from being saved to app cache */
//   Meteor.AppCache.config({
//   onlineOnly: [
//     '/img/Android/',
//     '/img/iOS/',
//     '/img/untitled.png',
//     '/img/untitled.svg',
//     '/img/readme.txt',
//     '/img/TaduLaunch.png',
//     '/img/Underground-Traffic.mp4',
//     '/packages/',
//     '/docs/',
//     '/fonts/licenses',
//     '/img/call-to-action.jpg',
//     '/fonts/Licenses/',
//     '/img/tadu_logo_bg.png',
//     '/node_modules/',
//     '/fonts/'
//   ]
// });
//   Meteor.AppCache.config({
//      onlineOnly: [
//      '*'
//      ]
// });
  /* Not super funcitonal SyncedCron setup */
  SyncedCron.config({
    // Log job run details to console
    log: false,
    logger: null
  });
  /* Cron job to check database for alerts that need to be triggered */
  SyncedCron.add({
    name: 'Send Out Alerts',
    schedule: function(parser) {
    // parser is a later.parse object
    return parser.text('every 1 min');
  },
  job: function() {
    let nowUTC = moment().utc().format().substring(0,16);

    let allAlerts = Tasks.find({timeUTC: {$eq : nowUTC}, "completed" : false}).fetch();
      allAlerts.map((task)=>{
        Notifications.insert({
          userId: task.userId,
          type: "taskAlert",
          data : task,
          seen: false,
          timestamp: new Date().getTime()
        });
      });
  }
});
  /* Cron to remove old cron entries to save space on server */
  SyncedCron.add({
    name: 'Clear Old Cron History',
    schedule: function(parser) {
    return parser.text('every 1 hour');
  },
  job: function() {
    let nowUTC = moment().subtract(1, "h").utc().format();
    SyncedCron._collection.remove({});
  }
});
  SyncedCron.start();


});



