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
import TaskSingle from './TaskSingle.jsx';
import Notice from './Notice.jsx';

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

import SwipeableViews from 'react-swipeable-views';

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
			width: window.innerWidth,
			subscription: {
				tasks: Meteor.subscribe("userTasks"),
				tagTypes: Meteor.subscribe("tagTypes"),
				notifications: Meteor.subscribe("notifications"),
				schedules: Meteor.subscribe("schedules")
			},
			taskDetail : null,
			index: 1,
			showNotifications: false
		};
		this.handleResize = this.handleResize.bind(this);
		this.showDetail = this.showDetail.bind(this);
		this.showView = this.showView.bind(this);
		this.toggleNotice = this.toggleNotice.bind(this);
		this.showAddTask = this.showAddTask.bind(this);
		this.selectDate = this.selectDate.bind(this);
		this.hideAddTask = this.hideAddTask.bind(this);
		this.onChangeIndex = this.onChangeIndex.bind(this);
		this.changeIndex = this.changeIndex.bind(this);
		this.loggedInChange = this.loggedInChange.bind(this);
		this.changeIndex = this.changeIndex.bind(this);
		this.showTasks = this.showTasks.bind(this);
		this.hideDetail = this.hideDetail.bind(this)
	}
	toggleNotice(){
		this.setState({showNotifications : !this.state.showNotifications });
	}
	handleResize(){
		this.setState({width: window.innerWidth});
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
		window.addEventListener('resize', this.handleResize);

		/* Get the user's permission for notifications early on */
		if (Notification.permission !== "granted")
			Notification.requestPermission();
		if (!Notification) {
			/* Inform the user not to use a lame browser like Firefox, IE, or Safari that ruins JavaScript Dates and has full modern API support */
			swal('Desktop notifications not available in your browser. Please download a modern browser like Chrome or Opera'); 
			return;
		}
	}
	/*Triggered when swiping between views (mobile only) */
	onChangeIndex(index, type){
		// console.log(index, type);
		if(type === "end"){
			this.setState({
				index: index
			});
		}
		
	}
	/* Triggered when manually switching views (with button) */
	changeIndex(e){
		let switcher = {
			"calendar" : 1,
			"addTask" : 2,
			"taskList" : 0
		};
		this.setState({
			index: switcher[e]
		});
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
								alarm: notice.data.alarm,
								timeUTC : notice.data.alarm !== null ? bestDate.subtract(notice.data.alarm, minutes).utc().format().substring(0,16) : null,

							}
							Meteor.call("updateTask", newTask);
						}
					});
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
								alarm: notice.data.alarm,
								timeUTC : notice.data.alarm !== null ? bestDate.subtract(notice.data.alarm, "minutes").utc().format().substring(0,16) : null,

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
  	let viewTaskList =  this.state.viewMode === 'taskList' ? true : this.state.width >= 992 ? true : false;
  	let viewAddEvent = this.state.viewMode === 'addTask' ? true : this.state.width >= 1400 ? true : false;

  	/* Whether or not task detail modal should be visible right now  is based on whether there is a task currently in state */
  	let taskDetail = this.state.taskDetail !== null ? this.state.taskDetail : "" ;
  	/* Get notifications to see if the user has any that need resolved and to display old notifications in tray at top of Calendar */
  	let notices = Notifications.find({}, {limit: 20}).fetch();

  	let nextTask = null;
  	if(this.state.width <= 992){
  		nextTask = Tasks.find({dateStart: this.state.today, timeStart: {$gt : moment().format("HH:mm")}}).fetch().sort((a, b)=>{ return a.timeStart > b.timeStart})[0];

  		nextTask = nextTask === undefined 
  		? 
  		<div id="no-tasks-message"><p>You're free all day!</p><img src="../img/tadu_logo.png" className="no-tasks-icon"></img></div> 
  		: 
  		<TaskSingle key={nextTask._id} task={nextTask} showDetail={this.showDetail}/>;
  	}
  	return (
  		<div>

  		{this.state.loggedIn && this.state.width > 992
  			?
  			<div style={{width: "100%"}}>
  			<div id="left-wrapper" style={{zIndex: viewTaskList ? 5 : -1}}>
  			<TaskList show={viewTaskList} showDetail={this.showDetail} selectedDate={this.state.selectedDate} showCal={this.showView}/>
  			</div>
  			<div id="center-wrapper" style={{zIndex: 1}}>
  			<Calendar toggleNotice={this.toggleNotice} show={true} showAddTask={this.showAddTask} selectDate={this.selectDate} notifications={notices} showTasks={this.showTasks} showDetail={this.showDetail}/>
  			</div>
  			<div id="right-wrapper" style={{zIndex : viewAddEvent ? 5 : -1}}>
  			<AddTask show={viewAddEvent} hideAddTask={this.hideAddTask} selectedDate={this.state.selectedDate}/>
  			</div>
  			{notices.length !== 0 ? notices.filter((notice)=>{return notice.seen === false}).map((notice)=>{this.notify(notice)}) : ""}
  			</div>
  			:
  			this.state.loggedIn && this.state.width <= 992 
  			?
  			<SwipeableViews index={this.state.index}  style={{height: "100vh"}} onSwitching={this.onChangeIndex}>
  			<div id="left-wrapper" style={{zIndex: 1, position: "relative"}}>
  			<TaskList show={true} showDetail={this.showDetail} selectedDate={this.state.selectedDate} showCal={this.changeIndex}/>
  			</div>
  			<div id="center-wrapper" style={{zIndex: 1, position: "relative"}}>
  			<Calendar toggleNotice={this.toggleNotice} show={true} showAddTask={this.changeIndex} selectDate={this.selectDate} notifications={notices} showTasks={this.changeIndex.bind(this)} showDetail={this.showDetail.bind(this)}/>
  			{notices.length !== 0 ? notices.filter((notice)=>{return notice.seen === false}).map((notice)=>{this.notify(notice)}) : ""}
  			</div>
  			<div id="right-wrapper" style={{zIndex : 1, position: "relative"}}>
  			<AddTask show={true} hideAddTask={this.changeIndex} selectedDate={this.state.selectedDate}/>
  			</div>
  			</SwipeableViews>
  			:
  			<EntryPortal loggedInChange={this.loggedInChange}/>
  		}
  		{this.state.loggedIn && this.state.width <= 992 && nextTask !== null && this.state.index === 1 ?
  			<div id="quickTasks" className="animated bounceInUp">
  			{nextTask}
  			</div>
  			:
  			""

  		}
  		<Rodal visible={this.state.taskDetail !== null} onClose={this.hideDetail} className="modal task-detail glow" animation="door" customStyles={{width: '80%',
  		height: '80%', borderRadius: 0, borderColor: '#1de9b6', borderWidth: 1, borderStyle : 'solid', background: '#242424', color: '#fff'}}>
  		<TaskDetail taskDetail={taskDetail} closeDetail={this.hideDetail}/>
  		</Rodal>
  		{
			/* Crammed down here like the dirty after-thought it is, is the nofitications icon tray
			* (I bet you forgot about it too didnt' you?)
			* One of the gnarliest ternary opertators I've written to decide whether or not to rear it's ugly face
			* TODO: style should be passed in from parent that also has a Rodal style object
			*/
			this.state.showNotifications ? 
			<Rodal visible={this.state.showNotifications} onClose={this.toggleNotice} className="modal task-detail glow" animation="door" customStyles={{width: '80%',
			height: '80%', borderRadius: 0, borderColor: '#1de9b6', borderWidth: 1, borderStyle : 'solid', background: '#242424', color: '#fff'}}>
			<div id="notice-header">Notifications</div>	
			<div id="notice-wrapper">
			{notices.sort((a, b)=>{return a.timestamp < b.timestamp}).map((notice)=>{
				return (<Notice key={notice._id} data={notice} />)
			})}
			</div>
			</Rodal>
			:
			""
		}
		</div>
		);
  }
}
