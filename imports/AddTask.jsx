import React, {Component} from 'react';
import moment from 'moment';
import TrackerReact from 'meteor/ultimatejs:tracker-react';
import Loader from './Loader.jsx';

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
		let context = this;
		swal({
			title:"Creating New Tasks",
			text: "Tadu uses a tags to determine the best time for Tasks. Choose a tag, or create your own and let Tadu find the best time for it.",
			type: "success", 
			closeOnConfirm: true, 
		},
		()=>{
			Meteor.call("toggleCompleteTour", "addTasks");
		})
	}
	/* Once we've found the ideal tag and added any additional details to our task we try to add it to the database */
	addTask(event){
		/* Stop the event from triggering a POST request */ 
		event.preventDefault();

		/* Create the task object that will be sent to the server to be stored in the database
		* As of now we need the task title (text), the date and time of the task to start, the time as UTC for the server, the user's ID, and the description
		*/ 

		/* Get alarm if any */
		let alarm = null;
		if(this.refs.hasAlarm.checked){
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
			text : this.refs.newTask.value.trim(),
			dateStart : this.refs.dateStart.value.trim(),
			timeStart : this.refs.timeStart.value.trim(),
			tagType : this.state.tagType,
			userId: Meteor.userId(),
			desc: this.refs.desc.value.trim(),
			completed: false,
			alarm: alarm,
			timeUTC: alarm !== null ? moment(this.refs.dateStart.value.trim() + "T" + this.refs.timeStart.value.trim(), "YYYY-MM-DDTHH:mm").subtract(alarm, "minutes").utc().format().substring(0,16) : null
		};

		/* Call Meteor to abscond with our earthly woes and store it in the database if possible */
		Meteor.call("addTask", task, (err, data)=>{
			if(err){
					/* There was some sort of error on the server 
					* Because of MiniMongo this should be rare and ussually points to bad server code or poor life choices */
					swal("Oops...", err, "error");
				} else {
					/* Everything is great; Task is successfully submitted, clear the title for the next task, find some way to inform the user and close the window if necessary*/
					this.refs.newTask.value = "";
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
		/* grab the tag type and save it fin state for task creation (see addTask() )*/
		let tag = e.target.getAttribute("data-tag") === null ? e.target.parentElement.getAttribute("data-tag").trim() : e.target.getAttribute("data-tag").trim();
		/* Setting the state to stage1 = false re-renders the component to show stage 2 */
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
		let myTags = TagTypes.findOne();
		let tags = ["Homework", "Study", "Doctor", "Exercise", "Meeting", "Groceries", "Errands", "Music Practice", "Cleaning"];
		let n = 0;
			// myTags = myTags[0].tags.sort((a , b)=>{return a.uses > b.uses});
			return (
				<div>
				<div id="search-wrapper">
				<i id="search-icon" className="mdi mdi-magnify"></i>
				<input id="search" type="text" value={this.state.search} onChange={this.updateSearch.bind(this)} placeholder="Select Category or Search"/>
				</div>
				{	this.state.showLoader
					?
					<Loader width={"100%"}/>
					:
					/* If the user hasn't started searching give them the dialpad, otherwise show them the most used results */
					this.state.search !== "" ? "" :
					<div id="global-tags">
					<p className="global-tag-wrapper" data-tag="Homework" onClick={this.taskStage2.bind(this)}>
					<i className="tag-icon mdi mdi-pencil"></i>
					<span className="global-tag-label">Homework</span>
					</p>

					<p className="global-tag-wrapper" onClick={this.taskStage2.bind(this)} data-tag="Study">
					<i className="tag-icon mdi mdi-book-open-variant"></i>
					<span className="global-tag-label">Study</span>
					</p>					
					<p className="global-tag-wrapper" onClick={this.taskStage2.bind(this)} data-tag="Doctor">
					<i className="tag-icon mdi mdi-stethoscope"></i>
					<span className="global-tag-label">Doctor</span>
					</p>

					<p className="global-tag-wrapper" onClick={this.taskStage2.bind(this)} data-tag="Exercise">
					<i className="tag-icon mdi mdi-run"></i>
					<span className="global-tag-label">Exercise</span>
					</p>					
					<p className="global-tag-wrapper" onClick={this.taskStage2.bind(this)} data-tag="Meeting">
					<i className="tag-icon mdi mdi-account-multiple"></i>
					<span className="global-tag-label">Meeting</span>
					</p>					
					<p className="global-tag-wrapper" onClick={this.taskStage2.bind(this)} data-tag="Groceries">
					<i className="tag-icon mdi mdi-food-apple"></i>
					<span className="global-tag-label">Groceries</span>
					</p>

					<p className="global-tag-wrapper" onClick={this.taskStage2.bind(this)} data-tag="Errands">
					<i className="tag-icon mdi mdi-car"></i>
					<span className="global-tag-label">Errands</span>
					</p>					
					<p className="global-tag-wrapper" onClick={this.taskStage2.bind(this)} data-tag="Music Practice">
					<i className="tag-icon mdi mdi-music-note"></i>
					<span className="global-tag-label">Music Practice</span>
					</p>					
					<p className="global-tag-wrapper" onClick={this.taskStage2.bind(this)} data-tag="Cleaning">
					<i className="tag-icon mdi mdi-cup-water"></i>
					<span className="global-tag-label">Cleaning</span>
					</p>
					<p className="global-tag-wrapper no-tags" style={{width: '100%', "margin": "0 auto"}} onClick={this.createNewTag.bind(this)}>
					<i className="tag-icon mdi mdi-tag"></i>
					<span className="global-tag-label">New Tag</span>
					</p>


					</div>
				}
				{
					myTags === undefined ? "" :
					// TODO: clean up A LOT
					myTags.tags.filter((tag)=>{ 
						if(this.state.search.trim() === ""){
							// return if not in array
							return !tags.includes(tag.type);
						} else {
							return tag.type.toLowerCase().indexOf(this.state.search.toLowerCase()) !== -1;
						}
					})
					.sort((a, b)=> {
						return a.uses < b.uses;
					})
					.map((tag)=>{ 
						n++;
						let colorClass = "green";
						switch(Math.floor(Math.random() * 3)){
							case 0:
							colorClass = "green";
							break;
							case 1:
							colorClass = "dark-green";
							break;
							case 2:
							colorClass = "light-green";
							break;
						}
						return (<div className={"event-tag-tile " + colorClass} key={tag.type} data-uses={tag.uses} data-id={tag._id} data-tag={tag.type} onClick={this.taskStage2.bind(this)}> {tag.type}</div>)
					}
					)
				}
				{
					n === 0 && this.state.search !== "" ? 
					<p className="global-tag-wrapper no-tags" onClick={this.createNewTag.bind(this)}>
					<label>Looking for something else? Create a new tag for next time!</label>
					<i className="tag-icon mdi mdi-tag"></i>
					<span className="global-tag-label">Create New Tag</span>
					</p>
					: 
					""
				}
				</div>
				)
}

/* Relevant parts of AddTask stage 2; this should probably be spun off into it's own component */
renderStage2(){
	let nowTime = moment().add(1, 'hour').format("HH:mm");
	return (
		<form onSubmit={this.addTask.bind(this)} className={this.state.stage1 ?  "animated slideOutRight" : "animated slideInRight"}>
		<div className="form-item"><span className='form-item-label'> Title </span><input className="typeable" type="text" ref="newTask" defaultValue={this.state.tagType}  required maxLength="75"/> </div>
		<div className="form-item"><span className='form-item-label'> Date </span><input className="typeable" id="new-task-date" type="date" ref="dateStart" defaultValue={this.props.selectedDate} /> </div>
		<div className="form-item"><span className='form-item-label'> Time </span><input className="typeable" id="new-task-time" type="time" ref="timeStart"  defaultValue={nowTime} /> </div>

		{this.state.hasBeenOptimized ? <div className="form-item" style={{"color": "#1de9b6", "fontSize" : "0.6em", "textAlign" : "center"}}><span className='form-item-label mdi mdi-alert-circle'></span><span> {'\u00A0'} This date and time has been optimized for you!</span> </div> : ""}


		<div className="form-item"> Set Alarm? 
		<div className="checkbox">
		<input id="has-alarm-toggle" type="checkbox" readOnly="" defaultChecked={this.state.showAlarmVisible}ref="hasAlarm" onClick={this.showAlarm.bind(this)} />
		<label htmlFor="has-alarm-toggle"></label>
		</div>
		</div>
		<div id="alarm-radio-wrapper" className={"form-item " + (this.state.showAlarmVisible ? "" : "hidden")}> 
		<div className="radio-option-wrapper">
		<label className="radio" htmlFor="alarm-option-low">
		<input id="alarm-option-low" ref="5min" type="radio" name="alarm" value="5min" defaultChecked={true}/> 
		<span className="outer"><span className="inner"></span></span><div className="radio-option-label-text">5 min</div>
		</label>
		</div>	
		<div className="radio-option-wrapper">
		<label className="radio" htmlFor="alarm-option-med">
		<input id="alarm-option-med" ref="30min" type="radio" name="alarm" value="30min" /> <span className="outer">
		<span className="inner"></span></span><div className="radio-option-label-text">30 min</div>
		</label>
		</div>	
		<div className="radio-option-wrapper">
		<label className="radio" htmlFor="alarm-option-high">
		<input id="alarm-option-high" ref="1hour" type="radio" name="alarm" value="1hour" /> <span className="outer">
		<span className="inner"></span></span><div className="radio-option-label-text">1 hour</div>
		</label>
		</div>	
		<div className="radio-option-wrapper">
		<label className="radio" htmlFor="alarm-option-critical">
		<input id="alarm-option-critical" ref="1day" type="radio" name="alarm" value="1day" /> <span className="outer">
		<span className="inner"></span></span><div className="radio-option-label-text"> 1 day</div>
		</label>
		</div>
		</div>




		<div className="form-item desc"><textarea type="text" ref="desc" placeholder="Description" maxLength="300"></textarea> </div>

		<div  className="form-item"><button type="submit" className="button">Add Task</button> </div>
		</form>
		)
}
shouldComponentUpdate(nextProps, nextState){
	return (nextProps.show !== this.props.show || nextProps.hideAddTask !== this.props.hideAddTask || this.state !== nextState)
}
render(){
	if(Meteor.user().profile.tut.addTasks === false){
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