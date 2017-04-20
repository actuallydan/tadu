/* Main Structure file for Tadu App 
*
* Manages Logged in state and holds 3 main views of app: Calendar, Tasks List, and Add Task.
* Also holds React Modal "Rodal" for viewing task details for editing 
*
*/
import React from 'react';
import TaskList from './TaskList.jsx';
import Calendar from './Calendar.jsx';
import AddTask from './AddTask.jsx';
import EntryPortal from './EntryPortal.jsx';
import TaskDetail from './TaskDetail.jsx';

/*  CSS split up for now but should be refactored later to minimize redundancies */
import './styles/main.normal.less';
import './styles/main.large.less';
import './styles/main.small.less';

/* 3rd party CSS libraries */
import 'animate.css';
import swal from 'sweetalert';
import 'sweetalert/dist/sweetalert.css';
/* Fix to change alerts to fit theme */
import './styles/swaloverride.css';
import TrackerReact from 'meteor/ultimatejs:tracker-react';
import moment from 'moment';
import Rodal from 'rodal';
import 'rodal/lib/rodal.css';

/* Instantiate MiniMongo local database collections */
Tasks = new Mongo.Collection('Tasks');
TagTypes = new Mongo.Collection("TagTypes");
Notifications = new Mongo.Collection("Notifications");
Schedules = new Mongo.Collection("Schedules");

export default class MainLayout extends TrackerReact(React.Component) {
	constructor(props) {
		super(props);
		this.state = {
			loggedIn: Meteor.userId() === null ? false : true,
			viewMode: "calendar",
			selectedDate: new Date(new Date().getTime() - (new Date().getTimezoneOffset() * 60000)).toJSON().substring(0, 10),
			width: window.innerWidth > 1399 ? (window.innerWidth - 700) : window.innerWidth > 992 ? (window.innerWidth - 300) : window.innerWidth,
			subscription: {
				tasks: Meteor.subscribe("userTasks"),
				tagTypes: Meteor.subscribe("tagTypes"),
				notifications: Meteor.subscribe("notifications"),
				schedules: Meteor.subscribe("schedules")
			},
			taskDetail : null
		};
	}

	handleResize(){
		let newWidth = window.innerWidth > 1399 ? (window.innerWidth - 700) : window.innerWidth > 992 ? (window.innerWidth - 300) : window.innerWidth;
		this.setState({width: newWidth});
		console.log(this.state.width);
	}
	loggedInChange(flag){
		/* Tell out app that we're changing our logged in state and that Meteor knows we're logged in / out and need to change views 
		* Methods tha log the user in should provide true as a parameter or false if they're logging out
		*/
		this.setState({
			loggedIn: flag
		});
	}
	componentWillUnmount(){ 
		/* Always remove window listeners when not in use, but this is not likely to be needed at the moment */
		window.removeEventListener('resize');
	}
	componentDidMount() {
		/* Create event listener to update the state when the window resizes. 
		* This way we can store window width in one place instead on constantly having to look it up with window.innerWidth
		* This gives responsiveness to larger organizational components */
		window.addEventListener('resize', this.handleResize.bind(this));

		/* Get the user's permission for notifications early on */
		if (Notification.permission !== "granted")
			Notification.requestPermission();
		if (!Notification) {
			/* Inform the user not to use a lame browser like Firefox, IE, or Safari that ruins JavaScript Dates and has full modern API support */
			swal('Desktop notifications not available in your browser. Please download a modern browser like Chrome or Opera'); 
			return;
		}
	}
	/* All purpose change view method
	* TODO: This should be used in place of show/hide addtask/tasklist/calendar
	* Use "calendar" | "addTask" | "tasksList" as parameter values
	*/
	showView(view){
		this.setState({
			viewMode : view
		});
	}
	/* Should be replaced with showView("addTask") */
	showAddTask(){
		this.setState({
			viewMode : 'addTask'
		});
	}
	/* Should be replaced with showView("tasksList") */
	showTasks(){
		this.setState({
			viewMode : 'tasksList'
		});
	}
	/* Should be replaced with showView("calendar") */
	hideAddTask(){
		this.setState({
			viewMode : 'calendar'
		});
	}
	/* Shows Task detail Modal (Rodal) at bottom of page 
	* A valid Task Object must be passed to display it's full details to the user
	* Shold maybe be condensed into a toggleDetail view?
	*/
	showDetail(task) {
		this.setState({taskDetail : task });
	}
	/* Hides Task detail Modal (Rodal) at bottom of page 
	* Removes task object from state to signal Rodal to close
	* See notes from showDetail()
	*/
	hideDetail() {
		this.setState({taskDetail : null});
	}
	/* Gets a date string in "YYYY-MM-DD" format from Calendar and updates the state so the whole app is aware of the date we're looking at as opposed to the current date */
	selectDate(date){
		this.setState({
			selectedDate: date
		})
	}
	/* Multipurpose method for handling notifications triggered in the MainLayout component or elsewhere
	* Takes in a valid Notifications object and may contain a task, message, or system alert
	* Should implement a switch statement for how notification is handled depending on type of alert (the data property)
	* Currently only implemented for Task Alarm notifications
	* Should also be spun into it's own functional component or imported method for brevity
	* Accomodates for both Notifcation users and otherwise
	*/
	notify(notice){
  	// add switch(notice.type) for different types of notifications
  	if (Notification.permission !== "granted"){
  		// Tell the user their task is due
  		swal({
  			title: notice.data.tag,
  			text: notice.data.text + "<br/> Have you completed it?",
  			type: "warning",
  			showCancelButton: true,
  			confirmButtonText: "Yes, it's done!",
  			cancelButtonText: "No, I need to reschedule",
  			closeOnConfirm: false,
  			closeOnCancel: false,
  			html: true
  		},
  		function(isConfirm){
  			if (isConfirm) {
  				swal("Good job!", "I'm so proud of you", "success");
  				// Update task completion status to true
  				Meteor.call('toggleTask', notice.data);
  			} else {
  				swal("Rescheduling...", "Don't worry. I'll set up a different time", "success");
  				// TODO: update task startTime
  			}
  			// Mark this notification as seen and do not re-show it
  			Meteor.call("seeNotification", notice);

  		});

  	} else {
  		/* the only difference being that the notification will get the user's attention better */
  		const notification = new Notification(notice.data.tag, {
  			icon: '../img/tadu_logo.png',
  			body: notice.data.tag + " @ " + moment(notice.data.timeStart, "HH:mm").format("h:mm a"),
  		});

  		notification.onclick = ()=>{
  			/* Switch to Tadu tab if need be */
  			window.focus();
  			swal({
  				title: notice.data.tag,
  				text: notice.data.text + "<br/> Have you completed it?",
  				type: "warning",
  				showCancelButton: true,
  				confirmButtonText: "Yes, it's done!",
  				cancelButtonText: "No, I need to reschedule",
  				closeOnConfirm: false,
  				closeOnCancel: false,
  				html: true
  			},
  			function(isConfirm){
  				if (isConfirm) {
  					swal("Good job!", "I'm so proud of you", "success");
	  				// Update task completion status to true
	  				Meteor.call('toggleTask', notice.data);
					Meteor.call("changeThreshold", {tag: notice.data.tag, date: notice.data.dateStart, time: notice.data.timeStart, amt: 0.1})
	  			} else {
	  				swal("Rescheduling...", "Don't worry. I'll set up a different time", "success");
	  				/* update task startTime */
	  				Meteor.call("scheduleBestTime", {tag: notice.data.tag, today: new Date()}, (err, res)=>{
	  					if(err){
	  						swal("So..", "There was an issue rescheduling..." + "<br/>" + err, "error");
	  					} else {
	  						let daysFromToday = res.date - new Date().getDay();
							let bestDate = moment(res.time, "HH:mm").add(daysFromToday, "days");
							// Change threshold
							/* Provide tag (notice.data.tag), date and time (notice.data.dateStart, notice.data.timeStart) and signed amount to change */
							Meteor.call("changeThreshold", {tag: notice.data.tag, date: notice.data.dateStart, time: notice.data.timeStart, amt: -0.1})
							// Update task
							let newTask = {
								_id: notice.data._id,
								text : notice.data.text,
								dateStart : bestDate.format("YYYY-MM-DD"),
								timeStart : bestDate.format("HH:mm"),
								desc : notice.data.desc,
								timeUTC : bestDate.utc().format().substring(0,16),
	
							}
							Meteor.call("updateTask", newTask);
	  					}
	  				});
	  			}
	  		});
  			// Mark this notification as seen and do not re-show it
  			Meteor.call("seeNotification", notice);
  			notification.close();
  		};

  	}
  }
  render() {
  	/* Based on screen size and current state, determine which windows should be open */
  	let viewTaskList =  this.state.viewMode === 'tasksList' ? true : window.innerWidth >= 992 ? true : false;
  	let viewAddEvent = this.state.viewMode === 'addTask' ? true : window.innerWidth >= 1400 ? true : false;

  	/* Whether or not task detail modal should be visible right now  is based on whether there is a task currently in state */
  	let taskDetail = this.state.taskDetail !== null ? this.state.taskDetail : "" ;
  	/* Get notifications to see if the user has any that need resolved and to display old notifications in tray at top of Calendar */
  	let notices = Notifications.find({}, {limit: 20}).fetch();
  	return (
  		<div>

  		{this.state.loggedIn 
  			?
  			<div>
  			<div id="left-wrapper" style={{zIndex: viewTaskList ? 5 : -1}}>
  			<TaskList show={viewTaskList} showDetail={this.showDetail.bind(this)} selectedDate={this.state.selectedDate} showCal={this.showView.bind(this)}/>
  			</div>
  			<div id="center-wrapper" style={{zIndex: 1}}>
  			<Calendar show={true} showAddTask={this.showAddTask.bind(this)} selectDate={this.selectDate.bind(this)} notifications={notices} showTasks={this.showTasks.bind(this)}/>
  			</div>
  			<div id="right-wrapper" style={{zIndex : viewAddEvent ? 5 : -1}}>
  			<AddTask show={viewAddEvent} hideAddTask={this.hideAddTask.bind(this)} selectedDate={this.state.selectedDate}/>
  			</div>
  			{notices.length !== 0 ? notices.filter((notice)=>{return notice.seen === false}).map((notice)=>{this.notify(notice)}) : ""}
  			</div>
  			:
  			<EntryPortal loggedInChange={this.loggedInChange.bind(this)}/>
  		}

  		<Rodal visible={this.state.taskDetail !== null} onClose={this.hideDetail.bind(this)} className="modal task-detail glow" animation="door" customStyles={{width: '80%',
  		height: '80%', borderRadius: 0, borderColor: '#1de9b6', borderWidth: 1, borderStyle : 'solid', background: '#242424', color: '#fff'}}>
  			<TaskDetail taskDetail={taskDetail} closeDetail={this.hideDetail}/>
  		</Rodal>
  		</div>
  		);
  }
}
