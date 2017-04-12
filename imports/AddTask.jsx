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
			search: ""
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
			let tag = e.target.getAttribute("data-tag").trim();
			/* Setting the state to stage1 = false re-renders the component to show stage 2 */
			this.setState({
				stage1 : false,
				tagType : tag
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
						tagType : null
					});
		}
		/* Relevant parts of AddTask stage 1; this should probably be spun off into it's own component */
		renderStage1(){
			/* Get allthe tags by this user and sort by most often used for quicker selection */
			let tags = TagTypes.find({}, { sort : {"uses" : -1}}).fetch();
			let n = 0;

			return (
				<div>
				<div id="search-wrapper">
				<i id="search-icon" className="mdi mdi-magnify"></i>
					<input id="search" type="text" value={this.state.search} onChange={this.updateSearch.bind(this)} placeholder="Select Category or Search"/>
				</div>
				{
					//TODO: clean up A LOT
					tags.filter((tag)=>{ return tag.type.toLowerCase().indexOf(this.state.search.toLowerCase()) !== -1}).map((tag)=>{ 
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
						return (<div className={"event-tag-tile " + colorClass} key={tag._id} data-uses={tag.uses} data-id={tag._id} data-tag={tag.type} onClick={this.taskStage2.bind(this)}> {tag.type}</div>)
					}
					)
				}
				{
					n === 0 ? <div> No Tags </div> : ""
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

				<div className="form-item desc"><textarea type="text" ref="desc" placeholder="Description" maxLength="300"></textarea> </div>

				<div  className="form-item"><button type="submit" className="button">Add Task</button> </div>
				</form>
				)
		}
		render(){
			return (		
				<div id="AddTaskForm" className={this.props.show ? "animated slideInRight" : "animated slideOutRight hidden"}>
				<div className="form-item hide-on-large" id="add-task-form-nav"><i className="mdi mdi-close" onClick={this.clearTask.bind(this)}></i><span>New Event</span></div>
				{this.state.stage1 ? this.renderStage1() : this.renderStage2()}
				</div>
				)

		}
	}
