import { Meteor } from "meteor/meteor";
import moment from "moment";
import { Tasks, Notifications } from "./publish";
import "./methods.js";

Meteor.startup(() => {
  // console.log(Meteor.users.find({}).fetch());

  /* Not super funcitonal SyncedCron setup */
  SyncedCron.config({
    // Log job run details to console
    log: false,
    logger: null,
  });
  /* Cron job to check database for alerts that need to be triggered */
  SyncedCron.add({
    name: "Send Out Alerts",
    schedule: function (parser) {
      // parser is a later.parse object
      return parser.text("every 1 min");
    },
    job: function () {
      let nowUTC = moment().utc().format().substring(0, 16);
      /* send out alerts for task start times */
      let allAlerts = Tasks.find({
        timeUTC: { $eq: nowUTC },
        completed: false,
      }).fetch();
      allAlerts.map((task) => {
        Notifications.insert({
          userId: task.userId,
          type: "taskAlert",
          data: task,
          seen: false,
          timestamp: new Date().getTime(),
        });
      });
      /* Send out task completion alerts */
      let allCheckups = Tasks.find({
        timeUTCEnd: { $eq: nowUTC },
        completed: false,
      }).fetch();
      allCheckups.map((task) => {
        Notifications.insert({
          userId: task.userId,
          type: "taskCheckup",
          data: task,
          seen: false,
          timestamp: new Date().getTime(),
        });
      });
    },
  });
  /* Cron to remove old cron entries to save space on server */
  SyncedCron.add({
    name: "Clear Old Cron History",
    schedule: function (parser) {
      return parser.text("every 1 hour");
    },
    job: function () {
      let nowUTC = moment().subtract(1, "h").utc().format();
      SyncedCron._collection.remove({});
    },
  });
  SyncedCron.start();
});

const daysOfWeek = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

const hours = [
  "00:00",
  "01:00",
  "02:00",
  "03:00",
  "04:00",
  "05:00",
  "06:00",
  "07:00",
  "08:00",
  "09:00",
  "10:00",
  "11:00",
  "12:00",
  "13:00",
  "14:00",
  "15:00",
  "16:00",
  "17:00",
  "18:00",
  "19:00",
  "20:00",
  "21:00",
  "22:00",
  "23:00",
];
const tags = [
  "Homework",
  "Study",
  "Doctor",
  "Exercise",
  "Meeting",
  "Groceries",
  "Errands",
  "Music Practice",
  "Cleaning",
];

const bioCurve = [
  0.38,
  0.41,
  0.42,
  0.45,
  0.49,
  0.54,
  0.61,
  0.68,
  0.76,
  0.83,
  0.87,
  0.76,
  0.63,
  0.61,
  0.54,
  0.61,
  0.63,
  0.76,
  0.7,
  0.67,
  0.65,
  0.6,
  0.55,
  0.5,
];
