import React from 'react';
import moment from 'moment';
import TrackerReact from 'meteor/ultimatejs:tracker-react';

export default class AddTask extends TrackerReact(React.Component) {
	constructor(props) {
		super(props);

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
	updateSearch(event){
		this.setState({search: event.target.value});
	}
	addTask(event){

		event.preventDefault();
		console.log(this, event);

		let task = {
				text : this.refs.newTask.value.trim(),
				dateStart : this.refs.dateStart.value.trim(),
				timeStart : this.refs.timeStart.value.trim(),
				// priority : event.target.elements.priority.value.trim()
				tagType : this.state.tagType,
				userId: Meteor.userId(),
				desc: this.refs.desc.value.trim(),
				completed: false
			};

			Meteor.call("addTask", task, (err, data)=>{
				if(err){
					swal("Oops...", err, "error");
				} else {
					this.refs.newTask.value = "";
					swal("Success", "Task Created", "success");
					this.clearTask();
				};
			})
			console.log(task);
		}
		taskStage2(e) {
			let tag = e.target.getAttribute("data-tag").trim();
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
		clearTask(){
			this.props.hideAddTask();
			this.setState({
						stage1 : true,
						tagType : null
					});
		}
		getTags(){
			let tags = [];

			Meteor.call("getTags", (err, data)=>{
				if(err){
					console.log("Error: " + err);
				} else {
					tags = data;
				}
			});
			return tags;
		}
		renderStage1(){
			let tags = TagTypes.find({}, { sort : {"uses" : -1}}).fetch();
			// let tags = TagTypes.find().fetch();
			let n = 0;

			return (
				<div>
				<div id="search-wrapper">
				<i id="search-icon" className="mdi mdi-magnify"></i>
					<input id="search" type="text" value={this.state.search} onChange={this.updateSearch.bind(this)} placeholder="Select Category or Search"/>
				</div>
				{
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
				<div className="form-item hide-on-large hide-on-small" id="add-task-form-nav"><i className="mdi mdi-close" onClick={this.clearTask.bind(this)}></i><span>New Event</span></div>
				{this.state.stage1 ? this.renderStage1() : this.renderStage2()}
				</div>
				)

		}
	}
