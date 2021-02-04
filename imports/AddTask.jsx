import React, { Component } from "react";

import Loader from "./Loader.jsx";
import AddTaskStage1 from "./AddTaskStage1.jsx";
import AddTaskStage2 from "./AddTaskStage2.jsx";
import Toast from "./Toast.jsx";

import moment from "moment";
import TrackerReact from "meteor/ultimatejs:tracker-react";
import { toast } from "react-toastify";

export default class AddTask extends Component {
  constructor(props) {
    super(props);

    /* Task creation is in two steps, so we keep track of which view should appear and afterwards revert to stage 1
     * User's custom tags will also appear here below the dialpad once created so we subscribe to the collection of tags
     * Also alow users to search for one of their tags
     */
    this.state = {
      stage1: true,
      showAlarmVisible: true,
      tagType: null,
      subscription: {
        tagTypes: Meteor.subscribe("tagTypes"),
      },
      search: "",
      bestTimes: [],
      bestTimeIndex: 0,
      alarm: "5min",
      showLoader: false,
      userList: [],
      userListIndex: 0,
      sharingWith: [],
      showStart: true,
      showEnd: false,
      hasBeenOptimized: false,
    };
  }
  toggleShowStart() {
    this.setState({
      showStart: !this.state.showStart,
    });
  }
  toggleShowEnd() {
    this.setState({
      showEnd: !this.state.showEnd,
    });
  }
  /* Update the parameter of our search for the perfect tag */
  updateSearch(event) {
    this.setState({ search: event.target.value });
  }
  changeUser(amt) {
    this.setState({
      userListIndex: this.state.userListIndex + amt,
    });
  }
  /* Given the search parameters, return an array of all user objects whose username contains 'search', store it in state and generate dropdown*/
  findUsers() {
    let search = document.getElementById("find-user-share-text").value.trim();
    if (search.length > 0) {
      Meteor.apply("findUsers", [search, Meteor.user()], (err, res) => {
        if (err) {
          swal(
            "Sorry!",
            "There was an error commucicatring with the server: " + err,
            "error"
          );
        } else if (res !== null) {
          /* Remove from this list all users we're already sharing with */
          res = res.filter((user) => {
            return (
              this.state.sharingWith.findIndex((existingUser) => {
                return existingUser._id === user._id;
              }) === -1
            );
          });
          this.setState({ userList: res });
        }
      });
    } else {
      this.setState({ userList: [] });
    }
  }
  addUser(e) {
    let addUser = {
      _id: e.target.getAttribute("data-userId"),
      username: e.target.getAttribute("data-username"),
    };
    let newSharingWith = this.state.sharingWith;
    if (
      newSharingWith.findIndex((existingUser) => {
        return existingUser._id === addUser._id;
      }) === -1
    ) {
      newSharingWith.push(addUser);
      this.setState(
        {
          sharingWith: newSharingWith,
          userList: [],
          userListIndex: 0,
        },
        () => {
          /* Clear search when done */
          document.getElementById("find-user-share-text").value = "";
          // console.log(addUser, this.state.sharingWith);
        }
      );
    }
  }
  addUserWithEnter(user) {
    let newSharingWith = this.state.sharingWith;
    newSharingWith.push(user);
    this.setState(
      {
        sharingWith: newSharingWith,
        userList: [],
        userListIndex: 0,
      },
      () => {
        /* Clear search when done */
        document.getElementById("find-user-share-text").value = "";
      }
    );
  }
  removeUser(e) {
    let removeUser = e.target.getAttribute("data-id");
    let sharArr = this.state.sharingWith;

    const index = sharArr.findIndex((user) => {
      return user._id === removeUser;
    });
    sharArr.splice(index, 1);
    this.setState({
      sharingWith: sharArr,
    });
  }

  /* Once we've found the ideal tag and added any additional details to our task we try to add it to the database */
  addTask(taskRefs) {
    /* Create the task object that will be sent to the server to be stored in the database
     * As of now we need the task title (text), the date and time of the task to start, the time as UTC for the server, the user's ID, and the description
     */
    // if(!moment(taskRefs.timeStart, "YYYY-MM-DD").isValid()){
    // 	swal("Hold up!", "Please enter a valid date (e.g. 03/05/2017)", "error");
    // 	return false;
    // }
    // if(!moment(taskRefs.timeStart, "HH:mm a").isValid()){
    // 	swal("Hold up!", "Please enter a valid time (e.g. 12:00 AM or 23:45)", "error");
    // 	return false;
    // }
    /* Get alarm if any */
    let alarm = null;
    if (taskRefs.hasAlarm.checked) {
      if (this.state.alarm === "5min") {
        alarm = 5;
      } else if (this.state.alarm === "30min") {
        alarm = 30;
      } else if (this.state.alarm === "1hour") {
        alarm = 60;
      } else if (this.state.alarm === "1day") {
        alarm = 1440;
      } else {
        alarm = 5;
      }
    }

    let task = {
      text: taskRefs.newTask.value.trim(),
      dateStart:
        taskRefs.dateStart.value.trim() !== ""
          ? taskRefs.dateStart.value.trim()
          : taskRefs.dateEnd.value.trim() !== null
          ? taskRefs.dateEnd.value.trim()
          : moment().format("YYYY-MM-DD"),
      timeStart:
        taskRefs.timeStart.value.trim() !== ""
          ? taskRefs.timeStart.value.trim()
          : taskRefs.timeEnd.value.trim() !== null
          ? moment(taskRefs.timeEnd.value.trim(), "HH:mm")
              .subtract(1, "hours")
              .format("HH:mm")
          : moment().format("HH:mm"),
      dateEnd:
        taskRefs.dateEnd.value.trim() !== ""
          ? taskRefs.dateEnd.value.trim()
          : taskRefs.dateStart.value.trim() !== null
          ? taskRefs.dateStart.value.trim()
          : moment().format("YYYY-MM-DD"),
      timeEnd:
        taskRefs.timeEnd.value.trim() !== ""
          ? taskRefs.timeEnd.value.trim()
          : taskRefs.timeStart.value.trim() !== null
          ? moment(taskRefs.timeStart.value.trim(), "HH:mm")
              .add(1, "hours")
              .format("HH:mm")
          : moment().add(1, "hours").format("HH:mm"),
      tagType: this.state.tagType,
      userId: Meteor.userId(),
      desc:
        taskRefs.desc.value.trim() !== null ? taskRefs.desc.value.trim() : null,
      completed: false,
      alarm: alarm,
      sharingWith: this.state.sharingWith,
    };
    task.timeUTC =
      alarm !== null
        ? moment(task.dateStart + "T" + task.timeStart)
            .utc()
            .subtract(alarm, "minutes")
            .format()
            .substring(0, 16)
        : null;
    task.timeUTCEnd = moment(task.dateEnd + "T" + task.timeEnd)
      .utc()
      .format()
      .substring(0, 16);

    /* Call Meteor to abscond with our earthly woes and store it in the database if possible */
    Meteor.apply("addTask", [task, Meteor.user()], (err, data) => {
      if (err) {
        /* There was some sort of error on the server
         * Because of MiniMongo this should be rare and ussually points to bad server code or poor life choices */
        swal("Oops...", err, "error");
      } else {
        /* Everything is great; Task is successfully submitted, clear the title for the next task, find some way to inform the user and close the window if necessary*/
        taskRefs.newTask.value = "";
        toast(
          <Toast
            onClick={toast.dismiss}
            iconClass={"mdi-check"}
            text={"Task Created"}
            secondary={""}
          />,
          { autoClose: 2000 }
        );
        this.clearTask();
        this.setState({
          showAlarmVisible: true,
          userList: [],
          sharingWith: [],
        });
      }
    });
  }
  /* Method to move to stage 2 of task creation which is additional and optional details */
  taskStage2(e) {
    /* grab the tag type and save it in state for task creation (see addTask() )*/
    let tag =
      e.target.getAttribute("data-tag") === null
        ? e.target.parentElement.getAttribute("data-tag").trim()
        : e.target.getAttribute("data-tag").trim();
    /* Setting the state to stage1 = false re-renders the component to show stage 2 */
    if (navigator.onLine) {
      this.showLoader();
      /* Get All of the best times to do this task */
      Meteor.apply(
        "scheduleBestTime",
        [
          { tag: tag, today: moment().format("YYYY-MM-DDTHH:mm:ss") },
          Meteor.user(),
        ],
        (err, res) => {
          if (err) {
            /* There was a server error */
            swal("Oops...", err, "error");
            this.setState({
              stage1: true,
              tagType: null,
              search: "",
              showLoader: false,
              userList: [],
              sharingWith: [],
            });
          } else {
            /* retrieved all the best times, but just in case, set the start date and time for whenever is selected */
            this.setState(
              {
                stage1: false,
                tagType: tag,
                bestTimes: res,
                hasBeenOptimized: true,
              },
              () => {
                let bestDate = moment(
                  this.props.selectedDate + "T" + moment().format("HH:mm"),
                  "YYYY-MM-DDTHH:mm"
                ).format("YYYY-MM-DDTHH:mm");
                document.getElementById(
                  "new-task-date"
                ).value = bestDate.substring(0, 10);
                document.getElementById("new-task-time").value = moment(
                  bestDate
                )
                  .add(1, "hour")
                  .format("HH:mm");
                document.getElementById(
                  "new-task-end-date"
                ).value = bestDate.substring(0, 10);
                document.getElementById("new-task-end-time").value = moment(
                  bestDate
                )
                  .add(2, "hour")
                  .format("HH:mm");
              }
            );
          }
        }
      );
    } else {
      /* when there are network issues we can skip the automation bits */
      let bestDate = moment().format();
      this.setState(
        {
          stage1: false,
          tagType: tag,
        },
        () => {
          document.getElementById("new-task-date").value = bestDate.substring(
            0,
            10
          );
          document.getElementById("new-task-time").value = bestDate.substring(
            11,
            16
          );
          document.getElementById(
            "new-task-end-date"
          ).value = bestDate.substring(0, 10);
          document.getElementById("new-task-end-time").value = moment(bestDate)
            .add(1, "hour")
            .format("HH:mm");
        }
      );
    }
  }
  showAlarm() {
    this.setState({
      showAlarmVisible: !this.state.showAlarmVisible,
    });
  }
  changeBestTime(amt) {
    /* If the user clicks forward or backward we want to update the suggested time to schedule */
    this.setState(
      {
        bestTimeIndex: (this.state.bestTimeIndex += amt),
      },
      () => {
        /* If the amt === 0, we want to set the exisitng fields to the shown best date and time */
        if (amt === 0) {
          let currBestTime = this.state.bestTimes[this.state.bestTimeIndex];
          let daysFromToday =
            currBestTime.day - parseInt(moment().format("e")) >= 0
              ? currBestTime.day - parseInt(moment().format("e"))
              : 7 + (currBestTime.day - parseInt(moment().format("e")));
          let bestDate = moment(
            this.props.selectedDate + "T" + currBestTime.time,
            "YYYY-MM-DDTHH:mm"
          )
            .add(daysFromToday, "days")
            .format("YYYY-MM-DDTHH:mm");
          document.getElementById("new-task-date").value = bestDate.substring(
            0,
            10
          );
          document.getElementById("new-task-time").value = bestDate.substring(
            11,
            16
          );
          document.getElementById(
            "new-task-end-date"
          ).value = bestDate.substring(0, 10);
          document.getElementById("new-task-end-time").value = moment(bestDate)
            .add(1, "hour")
            .format("HH:mm");
        }
      }
    );
  }
  /* Trigger method in parent to hide AddTask Component if necessary and clear state to reset form */
  clearTask() {
    this.props.hideAddTask("calendar");
    this.setState({
      stage1: true,
      tagType: null,
      search: "",
      showLoader: false,
      userList: [],
      userListIndex: 0,
      sharingWith: [],
      showStart: true,
      showEnd: false,
      bestTimes: [],
      bestTimeIndex: 0,
      hasBeenOptimized: false,
    });
  }
  /* Method to create a new tag for the user if not available*/
  createNewTag() {
    let context = this;
    swal(
      {
        title: "Create A New Tag",
        text: "Please enter a name for your new tag",
        type: "input",
        showCancelButton: true,
        closeOnConfirm: false,
        inputPlaceholder: "Netflix Marathon, Eat Ice, Reading",
        inputValue: document
          .getElementById("search")
          .value.trim()
          .substring(0, 20),
      },
      function (inputValue) {
        if (inputValue.length > 25) {
          swal.showInputError(
            "You have exceeded the 25 character limit for tags"
          );
          return false;
        }
        if (inputValue === false) {
          return false;
        }
        if (inputValue === "") {
          swal.showInputError("Please give your tag a name!");
          return false;
        }
        Meteor.apply(
          "addTag",
          [inputValue.trim(), Meteor.user()],
          (err, res) => {
            if (err) {
              swal("Uh Oh!", err, "error");
            } else if (res === "exists") {
              swal("Awkward...", "This tag already exists", "warning");
            } else if (res === "503") {
              swal(
                "This is embarassing",
                "Tags cannot contain a '.'",
                "warning"
              );
            } else {
              swal(
                "Tag Created!",
                "We'll pick up where you left off",
                "success"
              );
              context.setState({
                stage1: false,
                tagType: inputValue.trim(),
                hasBeenOptimized: false,
              });
            }
          }
        );
      }
    );
  }
  showLoader() {
    this.setState({
      showLoader: true,
    });
  }
  changeAlarm(e) {
    this.setState({
      alarm: e.target.value,
    });
  }
  /* Relevant parts of AddTask stage 1; this should probably be spun off into it's own component */
  renderStage1() {
    /* Get allthe tags by this user and sort by most often used for quicker selection */
    return (
      <AddTaskStage1
        search={this.state.search}
        updateSearch={this.updateSearch.bind(this)}
        showLoader={this.state.showLoader}
        taskStage2={this.taskStage2.bind(this)}
        createNewTag={this.createNewTag.bind(this)}
      />
    );
  }

  /* Relevant parts of AddTask stage 2; this should probably be spun off into it's own component */
  renderStage2() {
    let nowTime = moment().add(1, "hour").format("HH:mm");
    return (
      <AddTaskStage2
        selectedDate={this.props.selectedDate}
        now={nowTime}
        addTask={this.addTask.bind(this)}
        stage1={this.state.stage1}
        tagType={this.state.tagType}
        hasBeenOptimized={this.state.hasBeenOptimized}
        showAlarmVisible={this.state.showAlarmVisible}
        changeAlarm={this.changeAlarm.bind(this)}
        showAlarm={this.showAlarm.bind(this)}
        userList={this.state.userList}
        userListIndex={this.state.userListIndex}
        sharingWith={this.state.sharingWith}
        findUsers={this.findUsers.bind(this)}
        changeUser={this.changeUser.bind(this)}
        addUser={this.addUser.bind(this)}
        addUserWithEnter={this.addUserWithEnter.bind(this)}
        removeUser={this.removeUser.bind(this)}
        toggleShowStart={this.toggleShowStart.bind(this)}
        toggleShowEnd={this.toggleShowEnd.bind(this)}
        showStart={this.state.showStart}
        showEnd={this.state.showEnd}
        changeBestTime={this.changeBestTime.bind(this)}
        bestTimeIndex={this.state.bestTimeIndex}
        bestTimes={this.state.bestTimes}
      />
    );
  }
  shouldComponentUpdate(nextProps, nextState) {
    return (
      nextProps.show !== this.props.show ||
      nextProps.hideAddTask !== this.props.hideAddTask ||
      this.state !== nextState
    );
  }
  render() {
    /* Display tut if user hasn't signed in before */

    let display =
      window.innerWidth >= 1400
        ? !this.state.stage1
          ? "visible"
          : "hidden"
        : "visible";
    let icon = this.state.stage1 ? "mdi mdi-close" : "mdi mdi-refresh";

    return (
      <div
        id="add-tasks"
        className={
          this.props.show
            ? "animate__animated animate__slideInRight"
            : "animate__animated animate__slideOutRight"
        }
      >
        <div className="form-item" id="add-task-form-nav">
          <i
            className={icon}
            onClick={this.clearTask.bind(this)}
            style={{ visibility: display }}
          ></i>
          <div>New Task</div>
        </div>
        {this.state.stage1 ? this.renderStage1() : this.renderStage2()}
      </div>
    );
  }
}
