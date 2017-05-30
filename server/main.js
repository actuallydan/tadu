import { Meteor } from 'meteor/meteor';
import moment from 'moment';

Meteor.startup(() => {
  // code to run on server at startup

  /* Prevent cordova images from being saved to app cache */
  Meteor.AppCache.config({
  onlineOnly: [
    '/img/Android/',
    '/img/iOS/',
    '/img/untitled.png',
    '/img/untitled.svg',
    '/img/readme.txt',
    '/img/TaduLaunch.png',
    '/img/Underground-Traffic.mp4',
    '/packages/',
    '/docs/',
    '/fonts/licenses'
  ]
});
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
  SyncedCron.add({
    name: 'Clear Old Cron History',
    schedule: function(parser) {
    // parser is a later.parse object
    return parser.text('every 1 hour');
  },
  job: function() {
    let nowUTC = moment().subtract(1, "h").utc().format();
    SyncedCron._collection.remove({});
  }
});
  SyncedCron.start();


});



