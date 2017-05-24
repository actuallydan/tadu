import React from 'react';
Session.set('tasks_loaded', false);
Session.set('tagTypes_loaded', false);
Session.set('notifications_loaded', false);
Session.set('schedules_loaded', false);

import EntryPortal from './EntryPortal.jsx';
import MobileLayout from'./MobileLayout.jsx';
import DesktopLayout from './DesktopLayout.jsx';
import TaskSingle from './TaskSingle.jsx';
import TaskDetail from './TaskDetail.jsx';
import Loader from './Loader.jsx';
import Menu from './Menu.jsx';

/* 3rd party libraries */
import 'animate.css';

import TrackerReact from 'meteor/ultimatejs:tracker-react';
import moment from 'moment';
import Joyride from 'react-joyride';
import	'react-joyride/lib/react-joyride-compiled.css';

import 'loaders.css';

/* Instantiate MiniMongo local database collections */
Tasks = new Mongo.Collection('Tasks');
TagTypes = new Mongo.Collection("TagTypes");
Notifications = new Mongo.Collection("Notifications");
Schedules = new Mongo.Collection("Schedules");

let toggleTitle;

export default class MainLayout extends TrackerReact(React.Component) {
	constructor(props) {
		super(props);
		this.state = {
			viewMode: "calendar",
			selectedDate: new Date(new Date().getTime() - (new Date().getTimezoneOffset() * 60000)).toJSON().substring(0, 10),
			width: window.innerWidth,
			subscription: {
				tasks: Meteor.subscribe("userTasks", ()=>{
					Session.set("tasks_loaded", true);
				}),
				tagTypes: Meteor.subscribe("tagTypes", ()=>{
					Session.set("tagTypes_loaded", true);
				}),
				notifications: Meteor.subscribe("notifications", ()=>{
					Session.set("notifications_loaded", true);
				}),
				schedules: Meteor.subscribe("schedules", ()=>{
					Session.set("schedules_loaded", true);
				}),
				users: Meteor.subscribe("allUsers"),
			},
			taskDetail : null,
			scheduleVisible: false,
		};
		this.handleResize = this.handleResize.bind(this);
		this.showDetail = this.showDetail.bind(this);
		this.showView = this.showView.bind(this);
		this.toggleNotice = this.toggleNotice.bind(this);
		this.showAddTask = this.showAddTask.bind(this);
		this.selectDate = this.selectDate.bind(this);
		this.hideAddTask = this.hideAddTask.bind(this);
		this.loggedInChange = this.loggedInChange.bind(this);
		this.showTasks = this.showTasks.bind(this);
		this.hideDetail = this.hideDetail.bind(this);
	}
	toggleNotice(){
		this.setState({showNotifications : !this.state.showNotifications });
	}
	toggleSchedule(){
		console.log("hideQuickTask", this.state.scheduleVisible);
		this.setState({scheduleVisible: !this.state.scheduleVisible});
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
		window.removeEventListener('resize', this.handleResize);
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
			swal('Desktop notifications not available in your browser. Please download a modern browser.'); 
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
		});
	}
	/* Multipurpose method for handling notifications triggered in the MainLayout component or elsewhere
	* Takes in a valid Notifications object and may contain a task, message, or system alert
	* Should implement a switch statement for how notification is handled depending on type of alert (the data property)
	* Currently only implemented for Task Alarm notifications
	* Should also be spun into it's own functional component or imported method for brevity
	* Accomodates for both Notifcation users and otherwise
	*/
	notify(notice){
	// let audio = new Audio('audio_file.mp3');
	// audio.play();
	document.title = "Task Alert!";
	toggleTitle = setInterval(()=>{
		switch(document.title){
			case notice.data.text:
			document.title = "Task Alert!";
			break;
			case "Task Alert!":
			document.title = notice.data.text;
			break;
		}
	}, 1500);
	toggleTitle;
	if (Notification.permission !== "granted"){
		/* Tell the user their task is due */
		if(!document.hasFocus()){
			window.addEventListener('focus', ()=>{
				this.displayNotification(notice);
			});
			window.removeEventListener('focus');
		}
	} else {
		/* The only difference being that the notification will get the user's attention better */
		const notification = new Notification(notice.data.tag, {
			icon: '../img/tadu_logo.png',
			body: notice.data.tag + " @ " + moment(notice.data.timeStart, "HH:mm").format("h:mm a"),
		});
		notification.onclick = ()=>{
			/* Switch to Tadu tab if need be */
			window.focus();
			this.displayNotification(notice);
			notification.close();
		};

	}
}
displayNotification(notice) {
	clearInterval(toggleTitle);
	document.title = "Tadu";
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
	/* Mark this notification as seen and do not re-show it */
	Meteor.call("seeNotification", notice);
}
callback(){
	console.log(this);
	// if(this.index === 2){
	// 	this.setState({viewMode : 'addTask'})
	// }
}
render(){
	/* Based on screen size and current state, determine which windows should be open */
	let viewTaskList =  this.state.viewMode === 'taskList' ? true : this.state.width >= 992 ? true : false;
	let viewAddTask = this.state.viewMode === 'addTask' ? true : this.state.width >= 1400 ? true : false;

	/* Whether or not task detail modal should be visible right now  is based on whether there is a task currently in state */
	let taskDetail = this.state.taskDetail !== null ? this.state.taskDetail : "" ;
	/* Get notifications to see if the user has any that need resolved and to display old notifications in tray at top of Calendar */
	let newNotice = Notifications.findOne({seen: false});
	let filteredTasks = Tasks.find().fetch().filter(
		(task) => {
			return task.dateStart === this.state.selectedDate;
		}
		).sort(
		(a, b) => {
			return a.dateStart + "T" + a.timeStart > b.dateStart + "T" +b.timeStart;
		}
		);
		filteredTasks = filteredTasks.length === 0 ? <div id="no-tasks-message" className='animated pulse' ><p>You're free all day!</p><img src="../img/tadu_logo.png" className="no-tasks-icon"></img></div> : filteredTasks.map( (task) => {
			return <TaskSingle key={task._id} task={task} showDetail={this.showDetail.bind(this)}/>
		});
		return(
			<div className="wrapper" id="top-wrapper">
			{	Session.get('tasks_loaded') === false ||  Session.get('tagTypes_loaded') === false || Session.get('notifications_loaded') === false || Session.get('schedules_loaded') === false
			?
			<Loader />
			:
			this.state.width > 992 
			? 
			<div className="wrapper">
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
			<Joyride
			ref="joyride"
			steps={stepsDesktop}
			run={!Meteor.user().profile.hasCompletedTutorial}
			autoStart={!Meteor.user().profile.hasCompletedTutorial}
			debug={true}
			callback={this.callback.bind(this)}
			holePadding={0}
			showBackButton={true}
			type={"continuous"}
			disableOverlay={true}
			showSkipButton={true}
			/>
			</div>
			: 
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
		} 
		{newNotice !== undefined ? this.notify(newNotice) : ""}

		<Menu show={this.state.taskDetail !== null} className="task-detail" toggleMenu={this.hideDetail.bind(this)}> 
		<TaskDetail taskDetail={taskDetail} closeDetail={this.hideDetail}/>
		</Menu>

		</div>
		)
	}
}

const stepsDesktop = [
{title: "Welcome!",
text: "Thanks for using Tadu! Before you get going would you like to take a tour? It will only take a minute and should help you understand how to make Tadu work best for you.",
selector: '#calendar',
position: "top-left"
},
{title: "The Calendar",
text: "To no surprise, this is your calendar, it's pretty blank at the moment, but once you start creating tasks you'll see an indicator of how many tasks you have that day. Speaking of tasks let's make a new one now!",
selector: '.month-wrapper',
position: "top-left"
},
{title: "Create a Task!",
text: "This is where you create new Tasks. Anything you do once in a while can be created here. Tadu uses tags to figure out when you're most likely to be productive. This way, we're not telling you when to do something, but rather helping you build productive habits to get as much done with as much success. We'll try setting up a meeting!",
selector: '#add-tasks',
position: "left"
},
{title: "What just happened?",
text: "When you want to create a new Task, Tadu analyzes your natural biorhythm and schedule to determine the best time for this meeting. If you want to change anything you can, but otherwise we're done!",
selector: '#add-tasks',
position: "left"
}
];