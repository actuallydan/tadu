import React, {Component} from 'react';
import moment from 'moment';
import TrackerReact from 'meteor/ultimatejs:tracker-react';
import Loader from './Loader.jsx';
import AddTaskStage1 from './AddTaskStage1.jsx';
import AddTaskStage2 from './AddTaskStage2.jsx';

export default class AddTask extends Component {
	constructor(props) {
		super(props);

		/* Task creation is in two steps, so we keep track of which view should appear and afterwards revert to stage 1
		* User's custom tags will also appear here below the dialpad once created so we subscribe to the collection of tags 
		* Also alow users to search for one of their tags 
		*/ 
		this.state = {
			stage1 : true,
			showAlarmVisible: true,
			tagType : null,
			subscription: {
				tagTypes: Meteor.subscribe("tagTypes")
			},
			search: "",
			hasBeenOptimized: false,
			alarm : "5min",
			showLoader: false
		};
	}
	/* Update the parameter of our search for the perfect tag */
	updateSearch(event){
		this.setState({search: event.target.value});
	}
	clearTutStage(){
		swal({
			title:"Creating New Tasks",
			text: "Tadu uses a tags to determine the best time for Tasks. Choose a tag, or create your own and let Tadu find the best time for it.",
			type: "success", 
			closeOnConfirm: true, 
		},
		()=>{
			Meteor.call("toggleCompleteTour", "addTasks");
		});
	}
	/* Once we've found the ideal tag and added any additional details to our task we try to add it to the database */
	addTask(taskRefs){
		/* Create the task object that will be sent to the server to be stored in the database
		* As of now we need the task title (text), the date and time of the task to start, the time as UTC for the server, the user's ID, and the description
		*/ 

		/* Get alarm if any */
		let alarm = null;
		if(taskRefs.hasAlarm.checked){
			if(this.state.alarm === "5min"){
				alarm = 5;
			} else if(this.state.alarm === "30min"){
				alarm = 30;
			} else if(this.state.alarm === "1hour"){
				alarm = 60;
			} else if(this.state.alarm === "1day"){
				alarm = 1440;
			}
		}
		let task = {
			text : taskRefs.newTask.value.trim(),
			dateStart : taskRefs.dateStart.value.trim(),
			timeStart : taskRefs.timeStart.value.trim(),
			tagType : this.state.tagType,
			userId: Meteor.userId(),
			desc: taskRefs.desc.value.trim(),
			completed: false,
			alarm: alarm,
			timeUTC: alarm !== null ? moment(taskRefs.dateStart.value.trim() + "T" + taskRefs.timeStart.value.trim(), "YYYY-MM-DDTHH:mm").subtract(alarm, "minutes").utc().format().substring(0,16) : null
		};

		/* Call Meteor to abscond with our earthly woes and store it in the database if possible */
		Meteor.call("addTask", task, (err, data)=>{
			if(err){
					/* There was some sort of error on the server 
					* Because of MiniMongo this should be rare and ussually points to bad server code or poor life choices */
					swal("Oops...", err, "error");
				} else {
					/* Everything is great; Task is successfully submitted, clear the title for the next task, find some way to inform the user and close the window if necessary*/
					taskRefs.newTask.value = "";
					swal("Success", "Task Created", "success");
					this.clearTask();
					this.setState({
						showAlarmVisible : true
					})
				};
			});
	}
	/* Method to move to stage 2 of task creation which is additional and optional details */
	taskStage2(e) {
		/* grab the tag type and save it in state for task creation (see addTask() )*/
		let tag = e.target.getAttribute("data-tag") === null ? e.target.parentElement.getAttribute("data-tag").trim() : e.target.getAttribute("data-tag").trim();
		/* Setting the state to stage1 = false re-renders the component to show stage 2 */
		if(navigator.onLine){
			this.showLoader();
			Meteor.call("scheduleBestTime", {"tag": tag , "today": new Date() }, (err, res)=>{
				if(err){
					swal("Oops...", err, "error")
				} else {
					let daysFromToday = res.day - new Date().getDay();
					let bestDate = moment(res.time, "HH:mm").add(daysFromToday, "days").format();
					this.setState({
						stage1 : false,
						tagType : tag,
						hasBeenOptimized : true
					});
					document.getElementById("new-task-date").value = bestDate.substring(0, 10);
					document.getElementById("new-task-time").value = bestDate.substring(11, 16);

				}
			});
		} else {
			/* when there are network issues we can skip the automation bits */
			let bestDate = moment().format();
			this.setState({
				stage1 : false,
				tagType : tag,
			}, ()=>{
				document.getElementById("new-task-date").value = bestDate.substring(0, 10);
				document.getElementById("new-task-time").value = bestDate.substring(11, 16);
			});

		}
	}
	showAlarm(){
		this.setState({
			showAlarmVisible: !this.state.showAlarmVisible
		});
	}
	/* Trigger method in parent to hide AddTask Component if necessary and clear state to reset form */
	clearTask(){
		this.props.hideAddTask("calendar");
		this.setState({
			stage1 : true,
			tagType : null,
			search: "",
			showLoader: false
		});
	}
	/* Method to create a new tag for the user if not available*/
	createNewTag(){
		let context = this;
		swal({
			title: "Create A New Tag",
			text: "Please enter a name for your new tag",
			type: "input",
			showCancelButton: true,
			closeOnConfirm: false,
			inputPlaceholder: "Netflix Marathon, Eat Ice, Reading",
			inputValue: document.getElementById("search").value.trim().substring(0, 20),
		},
		function(inputValue){
			if(inputValue.length > 25){
				swal.showInputError("You have exceeded the 25 character limit for tags");
				return false;
			}
			if (inputValue === false) {
				return false;
			}
			if (inputValue === "") {
				swal.showInputError("Please give your tag a name!");
				return false
			}
			Meteor.call("addTag", inputValue.trim(), (err, res)=>{
				if(err){
					swal("Uh Oh!", err, "error");
				} else if(res === "exists"){
					swal("Awkward...", "This tag already exists", "warning");
				} else {
					swal("Tag Created!", "We'll pick up where you left off", "success");
					context.setState({
						stage1 : false,
						tagType : inputValue.trim()
					});
				}
			})
		});
	}
	showLoader(){
		this.setState({
			showLoader : true
		});
	}
	changeAlarm(e){
		this.setState({
			alarm: e
		});
	}
	/* Relevant parts of AddTask stage 1; this should probably be spun off into it's own component */
	renderStage1(){
		/* Get allthe tags by this user and sort by most often used for quicker selection */
		return (
			<AddTaskStage1 
			search={this.state.search}
			updateSearch={this.updateSearch.bind(this)}
			showLoader={this.state.showLoader}
			taskStage2={this.taskStage2.bind(this)}
			createNewTag={this.createNewTag.bind(this)}
		/>
		)
	}

	/* Relevant parts of AddTask stage 2; this should probably be spun off into it's own component */
	renderStage2(){
		let nowTime = moment().add(1, 'hour').format("HH:mm");
		return (
			<AddTaskStage2 
			selectedDate={this.props.selectedDate} 
			now={nowTime} 
			addTask={this.addTask.bind(this)}
			stage1={this.state.stage1}
			tagType={this.state.tagType}
			hasBeenOptimized={this.state.hasBeenOptimized}
			showAlarmVisible={this.state.showAlarmVisible}
			showAlarm={this.showAlarm.bind(this)}
			/>
			)
	}
	shouldComponentUpdate(nextProps, nextState){
		return (nextProps.show !== this.props.show || nextProps.hideAddTask !== this.props.hideAddTask || this.state !== nextState)
	}
	render(){
		/* Display tut if user hasn't signed in before */
		if(Meteor.user().profile.tut.addTasks === false && Meteor.user().profile.tut.login){
			if(window.innerWidth <= 992 && this.props.index === 1){ 
				this.clearTutStage();
			}
			if(window.innerWidth > 992 && window.innerWidth < 1400 && this.props.show){ 
				this.clearTutStage();
			}
			if(window.innerWidth >= 1400){ 
				this.clearTutStage();
			}
		}
		let display = window.innerWidth >= 1400 ? !this.state.stage1 ?  "visible" : "hidden" : "visible";
		let icon = this.state.stage1 ? "mdi mdi-close" : "mdi mdi-refresh"
		return(
			<div id="add-tasks" className={this.props.show ? "animated slideInRight" : "animated slideOutRight"}>
			<div className="form-item" id="add-task-form-nav"><i className={icon} onClick={this.clearTask.bind(this)} style={{visibility : display}}></i><div>New Task</div></div>
			{this.state.stage1 ? this.renderStage1() : this.renderStage2()}
			</div>);
	}
}