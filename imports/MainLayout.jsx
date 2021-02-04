import React from "react";
Session.set("tasks_loaded", false);
Session.set("tagTypes_loaded", false);
Session.set("notifications_loaded", false);
Session.set("schedules_loaded", false);

import EntryPortal from "./EntryPortal.jsx";
import MobileLayout from "./MobileLayout.jsx";
import DesktopLayout from "./DesktopLayout.jsx";
import TaskSingle from "./TaskSingle.jsx";
import TaskDetail from "./TaskDetail.jsx";
import Loader from "./Loader.jsx";
import Menu from "./Menu.jsx";
import Toast from "./Toast.jsx";

/* 3rd party libraries */
import "animate.css";

import TrackerReact from "meteor/ultimatejs:tracker-react";
import moment from "moment";

import "loaders.css";
import { ToastContainer } from "react-toastify";
import { toast } from "react-toastify";

/* Instantiate MiniMongo local database collections */
Tasks = new Mongo.Collection("Tasks");
TagTypes = new Mongo.Collection("TagTypes");
Notifications = new Mongo.Collection("Notifications");
Schedules = new Mongo.Collection("Schedules");

let toggleTitle;

export default class MainLayout extends TrackerReact(React.Component) {
  constructor(props) {
    super(props);
    this.state = {
      viewMode: "calendar",
      selectedDate: new Date(
        new Date().getTime() - new Date().getTimezoneOffset() * 60000
      )
        .toJSON()
        .substring(0, 10),
      width: window.innerWidth,
      subscription: {
        tasks: Meteor.subscribe("userTasks", () => {
          Session.set("tasks_loaded", true);
        }),
        tagTypes: Meteor.subscribe("tagTypes", () => {
          Session.set("tagTypes_loaded", true);
        }),
        notifications: Meteor.subscribe("notifications", () => {
          Session.set("notifications_loaded", true);
        }),
        schedules: Meteor.subscribe("schedules", () => {
          Session.set("schedules_loaded", true);
        }),
        users: Meteor.subscribe("allUsers"),
      },
      taskDetail: null,
      scheduleVisible: false,
    };
  }
  toggleNotice = () => {
    this.setState({ showNotifications: !this.state.showNotifications });
  };
  toggleSchedule = () => {
    console.log("hideQuickTask", this.state.scheduleVisible);
    this.setState({ scheduleVisible: !this.state.scheduleVisible });
  };
  handleResize = () => {
    this.setState({ width: window.innerWidth });
  };
  loggedInChange = (flag) => {
    /* Tell out app that we're changing our logged in state and that Meteor knows we're logged in / out and need to change views
     * Methods tha log the user in should provide true as a parameter or false if they're logging out
     */
    this.setState({
      loggedIn: flag,
    });
  };
  componentWillUnmount() {
    /* Always remove window listeners when not in use, but this is not likely to be needed at the moment */
    window.removeEventListener("resize", this.handleResize);
  }
  componentDidMount() {
    /* Create event listener to update the state when the window resizes.
     * This way we can store window width in one place instead on constantly having to look it up with window.innerWidth
     * This gives responsiveness to larger organizational components */
    window.addEventListener("resize", this.handleResize);
  }
  componentDidUpdate() {
    Meteor.user()?.profile?.tut?.login === false &&
      swal({
        title: "Welcome!",
        text:
          "Thanks for using Tadu! Get Started by entering your weekly schedule or creating a new task using the icons at the top.",
        type: "success",
      }).then(() => {
        Meteor.call("toggleCompleteTour", ["login", Meteor.user()]);
      });
  }
  /* All purpose change view method
   * TODO: This should be used in place of show/hide addtask/tasklist/calendar
   * Use "calendar" | "addTask" | "tasksList" as parameter values
   */
  showView = (view) => {
    this.setState({
      viewMode: view,
    });
  };
  /* Should be replaced with showView("addTask") */
  showAddTask = () => {
    this.setState({
      viewMode: "addTask",
    });
  };
  /* Should be replaced with showView("tasksList") */
  showTasks = () => {
    this.setState({
      viewMode: "tasksList",
    });
  };
  /* Should be replaced with showView("calendar") */
  hideAddTask = () => {
    this.setState({
      viewMode: "calendar",
    });
  };
  /* Shows Task detail Modal (Rodal) at bottom of page
   * A valid Task Object must be passed to display it's full details to the user
   * Shold maybe be condensed into a toggleDetail view?
   */
  showDetail = (task) => {
    this.setState({ taskDetail: task });
  };
  /* Hides Task detail Modal (Rodal) at bottom of page
   * Removes task object from state to signal Rodal to close
   * See notes from showDetail()
   */
  hideDetail = () => {
    this.setState({ taskDetail: null });
  };
  /* Gets a date string in "YYYY-MM-DD" format from Calendar and updates the state so the whole app is aware of the date we're looking at as opposed to the current date */
  selectDate = (date) => {
    if (document.getElementById("new-task-date") !== null) {
      document.getElementById("new-task-date").value = date;
      document.getElementById("new-task-end-date").value = moment(
        date,
        "YYYY-MM-DD"
      )
        .add(1, "hour")
        .format("YYYY-MM-DD");
    }
    this.setState({
      selectedDate: date,
    });
  };
  /* Multipurpose method for handling notifications triggered in the MainLayout component or elsewhere
   * Takes in a valid Notifications object and may contain a task, message, or system alert
   * Should implement a switch statement for how notification is handled depending on type of alert (the data property)
   * Currently only implemented for Task Alarm notifications
   * Should also be spun into it's own functional component or imported method for brevity
   * Accomodates for both Notifcation users and otherwise
   */
  notify = (notice) => {
    /* if there is already a toast on screen don't rerun script as it'll get annoying */
    if (document.querySelectorAll(".toastify-content").length > 0) {
      return false;
    }
    let audio = new Audio("/img/job-done.mp3");
    audio.volume = 0.5;
    audio.play();
    switch (notice.type) {
      case "taskShare":
        this.displayTaskShare(notice);
        break;
      case "taskAlert":
        this.displayTaskAlert(notice);
        break;
      case "taskCheckup":
        this.displayTaskCheckup(notice);
        break;
    }
  };
  displayTaskCheckup = (notice) => {
    document.title = "Task Check!";
    toggleTitle = setInterval(() => {
      switch (document.title) {
        case notice.data.text:
          document.title = "Task Check!";
          break;
        case "Task Check!":
          document.title = notice.data.text;
          break;
      }
    }, 1500);
    toggleTitle;
    toast.dismiss();
    toast(
      <Toast
        onClick={(e) => {
          if (e.target.className !== "taskCheckupSecondary") {
            this.displayNotification(notice);
            toast.dismiss();
          }
        }}
        iconClass={"mdi-alert-circle"}
        text={notice.data.text}
        secondary={
          <div
            className="taskCheckupSecondary"
            onClick={() => {
              this.updateEndTime(notice);
            }}
          >
            SNOOZE
          </div>
        }
      />
    );
  };

  updateEndTime = (notice) => {
    toast.dismiss();
    clearInterval(toggleTitle);
    document.title = "Tadu | The Sensible Scheduler";

    notice.data.timeUTCEnd = moment(notice.data.timeUTCEnd, "YYYY-MM-DDTHH:mm")
      .add(30, "minutes")
      .format("YYYY-MM-DDTHH:mm");
    Meteor.apply("updateTask", [notice.data, Meteor.user()], (err, res) => {
      toast(
        <Toast
          onClick={() => {
            toast.dismiss();
          }}
          autoClose={2500}
          iconClass={"mdi-check"}
          text={"Keep it up!"}
          secondary={""}
        />
      );
    });
    Meteor.apply("seeNotification", [notice, Meteor.user()]);
  };
  displayTaskShare = (notice) => {
    Meteor.apply(
      "findOneUser",
      [notice.data.userId, Meteor.user()],
      (err, res) => {
        toast.dismiss();
        toast(
          <Toast
            onClick={() => {
              toast.dismiss();
            }}
            autoClose={2500}
            iconClass={"mdi-account-multiple"}
            text={res + " shared a task"}
            secondary={""}
          />
        );
        Meteor.apply("seeNotification", [notice, Meteor.user()]);
      }
    );
  };
  displayTaskAlert = (notice) => {
    document.title = "Task Alert!";
    toggleTitle = setInterval(() => {
      switch (document.title) {
        case notice.data.text:
          document.title = "Task Alert!";
          break;
        case "Task Alert!":
          document.title = notice.data.text;
          break;
      }
    }, 1500);
    toggleTitle;
    toast.dismiss();
    toast(
      <Toast
        onClick={() => {
          clearInterval(toggleTitle);
          document.title = "Tadu | The Sensible Scheduler";
          toast.dismiss();
          Meteor.apply("seeNotification", [notice, Meteor.user()]);
        }}
        iconClass={"mdi-alarm-check"}
        text={notice.data.text}
        secondary={moment(notice.data.timeStart, "HH:mm").format("h:mm a")}
      />
    );
  };
  displayNotification = (notice) => {
    clearInterval(toggleTitle);
    document.title = "Tadu | The Sensible Scheduler";
    swal({
      title: notice.data.tag,
      text: notice.data.text + "<br/> Have you completed it?",
      type: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, it's done!",
      cancelButtonText: "No, I need to reschedule",
      closeOnConfirm: false,
      closeOnCancel: false,
      html: true,
    }).then(function (isConfirm) {
      if (isConfirm) {
        swal("Good job!", "I'm so proud of you", "success");
        // Update task completion status to true
        Meteor.apply("toggleTask", [notice.data, Meteor.user()]);
        Meteor.apply("changeThreshold", [
          {
            tag: notice.data.tag,
            date: notice.data.dateStart,
            time: notice.data.timeStart,
            amt: 0.15,
          },
          Meteor.user(),
        ]);
      } else {
        swal(
          "Rescheduling...",
          "Don't worry. I'll set up a different time",
          "success"
        );
        /* update task startTime */
        Meteor.apply(
          "scheduleBestTime",
          [
            {
              tag: notice.data.tag,
              today: moment().format("YYYY-MM-DDTHH:mm:ss"),
            },
            Meteor.user(),
          ],
          (err, res) => {
            if (err) {
              swal(
                "So..",
                "There was an issue rescheduling..." + "<br/>" + err,
                "error"
              );
            } else {
              /* Only get the first time */
              res = res[0];
              console.log(res);
              let daysFromToday =
                res.day - parseInt(moment().format("e")) >= 0
                  ? res.day - parseInt(moment().format("e"))
                  : 7 + (res.day - parseInt(moment().format("e")));
              let bestDate = moment(res.time, "HH:mm")
                .add(daysFromToday, "days")
                .format("YYYY-MM-DDTHH:mm");
              console.log(bestDate);
              /* Change threshold */
              /* Provide tag (notice.data.tag), date and time (notice.data.dateStart, notice.data.timeStart) and signed amount to change */
              Meteor.apply("changeThreshold", [
                {
                  tag: notice.data.tag,
                  date: notice.data.dateStart,
                  time: notice.data.timeStart,
                  amt: -0.15,
                },
                Meteor.user(),
              ]);
              /* Update task */
              let newTask = {
                _id: notice.data._id,
                text: notice.data.text,
                dateStart: moment(bestDate, "YYYY-MM-DDTHH:mm").format(
                  "YYYY-MM-DD"
                ),
                timeStart: moment(bestDate, "YYYY-MM-DDTHH:mm").format("HH:mm"),
                dateEnd: moment(bestDate, "YYYY-MM-DDTHH:mm")
                  .add(1, "hours")
                  .format("YYYY-MM-DD"),
                timeEnd: moment(bestDate, "YYYY-MM-DDTHH:mm")
                  .add(1, "hours")
                  .format("HH:mm"),
                desc: notice.data.desc,
                alarm: notice.data.alarm,
                sharingWith:
                  notice.data.sharingWith !== undefined
                    ? notice.data.sharingWith
                    : [],
              };
              let endFull = moment(newTask.dateEnd + "T" + newTask.timeEnd)
                .utc()
                .format()
                .substring(0, 16);
              (newTask.timeUTC =
                notice.data.alarm !== null
                  ? moment(bestDate, "YYYY-MM-DDTHH:mm")
                      .subtract(notice.data.alarm, "minutes")
                      .utc()
                      .format("YYYY-MM-DDTHH:mm")
                  : null),
                (newTask.timeUTCEnd = endFull);
              Meteor.apply("updateTask", [newTask, Meteor.user()]);
            }
          }
        );
      }
    });
    /* Mark this notification as seen and do not re-show it */
    Meteor.apply("seeNotification", [notice, Meteor.user()]);
  };
  render() {
    /* Based on screen size and current state, determine which windows should be open */
    let viewTaskList =
      this.state.viewMode === "taskList"
        ? true
        : this.state.width >= 992
        ? true
        : false;
    let viewAddTask =
      this.state.viewMode === "addTask"
        ? true
        : this.state.width >= 1400
        ? true
        : false;

    /* Whether or not task detail modal should be visible right now  is based on whether there is a task currently in state */
    let taskDetail =
      this.state.taskDetail !== null ? this.state.taskDetail : "";
    /* Get notifications to see if the user has any that need resolved and to display old notifications in tray at top of Calendar */
    let newNotice = Notifications.findOne({ seen: false });
    let filteredTasks = Tasks.find()
      .fetch()
      .filter((task) => {
        return task.dateStart === this.state.selectedDate;
      })
      .sort((a, b) => {
        return (
          a.dateStart + "T" + a.timeStart > b.dateStart + "T" + b.timeStart
        );
      });
    filteredTasks =
      filteredTasks.length === 0 ? (
        <div id="no-tasks-message" className="animated pulse">
          <p>You're free all day!</p>
          <img src="../img/tadu_logo.png" className="no-tasks-icon"></img>
        </div>
      ) : (
        filteredTasks.map((task) => {
          return (
            <TaskSingle
              key={task._id}
              task={task}
              showDetail={this.showDetail.bind(this)}
            />
          );
        })
      );
    return (
      <div className="wrapper" id="top-wrapper">
        {Session.get("tasks_loaded") === false ||
        Session.get("tagTypes_loaded") === false ||
        Session.get("notifications_loaded") === false ||
        Session.get("schedules_loaded") === false ? (
          <Loader />
        ) : this.state.width > 992 ? (
          <div
            className={
              this.state.viewMode === "addTask"
                ? "wrapper push-left"
                : "wrapper push-right"
            }
          >
            <DesktopLayout
              filteredTasks={filteredTasks}
              width={this.state.width}
              selectDate={this.selectDate}
              showTasks={this.showTasks}
              showDetail={this.showDetail}
              viewAddTask={viewAddTask}
              hideAddTask={this.hideAddTask}
              selectedDate={this.selectedDate}
              viewTaskList={viewTaskList}
              selectedDate={this.state.selectedDate}
              showView={this.showView}
              viewMode={this.state.viewMode}
              loggedInChange={this.props.loggedInChange.bind(this)}
            />
          </div>
        ) : (
          <div className="wrapper">
            <MobileLayout
              filteredTasks={filteredTasks}
              width={this.state.width}
              changeIndex={this.changeIndex}
              selectDate={this.selectDate}
              showDetail={this.showDetail}
              hideAddTask={this.hideAddTask}
              selectedDate={this.state.selectedDate}
              loggedInChange={this.props.loggedInChange.bind(this)}
            />
          </div>
        )}
        {newNotice && this.notify(newNotice)}

        <Menu
          show={this.state.taskDetail !== null}
          className="task-detail"
          toggleMenu={this.hideDetail.bind(this)}
        >
          <div
            id="close-task-detail"
            onClick={this.hideDetail.bind(this)}
            className="mdi mdi-close"
          ></div>
          <TaskDetail taskDetail={taskDetail} closeDetail={this.hideDetail} />
        </Menu>
        <ToastContainer
          autoClose={false}
          position={this.state.width > 992 ? "bottom-right" : "bottom-center"}
          hideProgressBar={true}
        />
      </div>
    );
  }
}
