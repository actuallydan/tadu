/* Add Tasks view for Tadu App 
*
* Allows user to create tasks for themselves based on tags
* This component will have interplay with Tadu SI to optimize task creation
*/
import React from 'react';
import moment from 'moment';
import TrackerReact from 'meteor/ultimatejs:tracker-react';

export default class AddTask extends TrackerReact(React.Component) {
	constructor(props) {
		super(props);

		/* Task creation is in two steps, so we keep track of which view should appear and afterwards revert to stage 1
		* User's custom tags will also appear here below the dialpad once created so we subscribe to the collection of tags 
		* Also alow users to search for one of their tags 
		*/ 
		this.state = {
			stage1 : true,
			dueDateVisible: false,
			tagType : null,
			subscription: {
				tagTypes: Meteor.subscribe("tagTypes")
			},
			search: "",
			hasBeenOptimized: false
		};
	}
	/* Update the parameter of our search for the perfect tag */
	updateSearch(event){
		this.setState({search: event.target.value});
	}
	/* Once we've found the ideal tag and added any additional details to our task we try to add it to the database */
	addTask(event){
		/* Stop the event from triggering a POST request */ 
		event.preventDefault();

		/* Create the task object that will be sent to the server to be stored in the database
		* As of now we need the task title (text), the date and time of the task to start, the time as UTC for the server, the user's ID, and the description
		*/ 
		let task = {
				text : this.refs.newTask.value.trim(),
				dateStart : this.refs.dateStart.value.trim(),
				timeStart : this.refs.timeStart.value.trim(),
				// priority : event.target.elements.priority.value.trim()
				tagType : this.state.tagType,
				userId: Meteor.userId(),
				desc: this.refs.desc.value.trim(),
				completed: false,
				timeUTC: moment(this.refs.dateStart.value.trim() + "T" + this.refs.timeStart.value.trim(), "YYYY-MM-DDTHH:mm").utc().format().substring(0,16)
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
				};
			})
		}
		/* Method to move to stage 2 of task creation which is additional and optional details */
		taskStage2(e) {
			/* grab the tag type and save it fin state for task creation (see addTask() )*/
			let tag = e.target.getAttribute("data-tag") === null ? e.target.parentElement.getAttribute("data-tag").trim() : e.target.getAttribute("data-tag").trim();
			/* Setting the state to stage1 = false re-renders the component to show stage 2 */

			Meteor.call("scheduleBestTime", {"tag": tag , "today": new Date() }, (err, res)=>{
				if(err){
					swal("Oops...", err, "error")
				} else {
					let daysFromToday = res.date - new Date().getDay();
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
		showDueDate(event){
			this.setState({
				dueDateVisible: !this.state.dueDateVisible
			});
		}
		/* Trigger method in parent to hide AddTask Component if necessary and clear state to reset form */
		clearTask(){
			this.props.hideAddTask();
			this.setState({
						stage1 : true,
						tagType : null,
						search: ""
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
			  inputPlaceholder: document.getElementById("search").value.trim()
			},
			function(inputValue){
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
				{
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
						return a.uses > b.uses;
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
				
				<div className="form-item desc"><textarea type="text" ref="desc" placeholder="Description" maxLength="300"></textarea> </div>

				<div  className="form-item"><button type="submit" className="button">Add Task</button> </div>
				</form>
				)
		}
		render(){
			return (		
				<div id="AddTaskForm" className={this.props.show ? "animated slideInRight" : "animated slideOutRight hidden"}>
				<div className="form-item hide-on-large" id="add-task-form-nav"><i className="mdi mdi-close" onClick={this.clearTask.bind(this)}></i><div>New Event</div></div>
				{this.state.stage1 ? this.renderStage1() : this.renderStage2()}
				</div>
				)

		}
	}

