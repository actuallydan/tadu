import React from 'react';
import moment from 'moment';

export default class TaskDetail extends React.Component{
	editTask(e){
		e.preventDefault();
		const old = this.props.taskDetail;
		const updatedTask = {
			_id: old._id,
			text: this.refs.title.value.trim(),
			dateStart:this.refs.dateStart.value.trim(),
			timeStart:this.refs.timeStart.value.trim(), 
			tag:  old.tag,
			userId:  old.userId,
			desc: this.refs.desc.value.trim(),
			timeUTC: moment(this.refs.dateStart.value.trim() + "T" + this.refs.timeStart.value.trim(), "YYYY-MM-DDTHH:mm").utc().format().substring(0,16),
		};

		Meteor.call("updateTask", updatedTask, (err)=>{
			if(err){
				swal("Sorry!", "There was an error updating your task, please try again later", "error");
			} else {
				swal("Success", "Task Updated", "success");
			}
		});
		this.props.closeDetail.bind(this);
	}
	componentDidUpdate(){
		console.log(this.props.taskDetail);
		if(this.props.taskDetail !== null){
				document.getElementById("edit-task-title").value = this.props.taskDetail.text;
				document.getElementById("edit-task-date").value = this.props.taskDetail.dateStart;
				document.getElementById("edit-task-time").value = this.props.taskDetail.timeStart;
				document.getElementById("edit-task-desc").value = this.props.taskDetail.desc !== null ? this.props.taskDetail.desc : "";
			}
	}
	render(){
		return(
			<form onSubmit={this.editTask.bind(this)}>
			<div id="update-task-header">Update Task</div>
			<div className="edit-item">
				<div className='text'> Title </div>
				<input className="" id="edit-task-title" type="text" ref="title" defaultValue={this.props.taskDetail.text}  required maxLength="75"/>
			 </div>
			<div className="edit-item">
				<div className='dateStart'> Date </div>
				<input className="typeable" id="edit-task-date" type="date" ref="dateStart" defaultValue={this.props.taskDetail.dateStart} /> 
			</div>
			<div className="edit-item">
				<div className='timeStart'> Time </div>
				<input className="typeable" id="edit-task-time" type="time" ref="timeStart"  defaultValue={this.props.taskDetail.timeStart} /> 
			</div>

			<div className="desc">
			<textarea type="text" ref="desc" id="edit-task-desc" placeholder="Description" maxLength="300" defaultValue={this.props.taskDetail.desc}></textarea> 
			</div>

			<div  className="edit-item">
				<button type="submit" className="button">Update Task</button> 
			</div>
			</form>
			);
	}
}
