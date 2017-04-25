import React from 'react';
import moment from 'moment';

export default class TaskDetail extends React.Component{
	constructor(props){
		super();
		this.state = {
			showAlarmVisible: false,
		}
	}
	editTask(e){
		e.preventDefault();
		const old = this.props.taskDetail;

		let alarm = null;
		if(this.refs.hasAlarm.checked){
			if(this.refs["5min"].checked){
				alarm = 5;
			} else if(this.refs["30min"].checked){
				alarm = 30;
			} else if(this.refs["1hour"].checked){
				alarm = 60;
			} else if(this.refs["1day"].checked){
				alarm = 1440;
			}
		}
		const updatedTask = {
			_id: old._id,
			text: this.refs.title.value.trim(),
			dateStart:this.refs.dateStart.value.trim(),
			timeStart:this.refs.timeStart.value.trim(), 
			tag:  old.tag,
			userId:  old.userId,
			desc: this.refs.desc.value.trim(),
			timeUTC: alarm !== null ? moment(this.refs.dateStart.value.trim() + "T" + this.refs.timeStart.value.trim(), "YYYY-MM-DDTHH:mm").subtract(alarm, "minutes").utc().format().substring(0,16) : null,
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
		if(this.props.taskDetail !== null){
				document.getElementById("edit-task-title").value = this.props.taskDetail.text;
				document.getElementById("edit-task-date").value = this.props.taskDetail.dateStart;
				document.getElementById("edit-task-time").value = this.props.taskDetail.timeStart;
				document.getElementById("edit-task-desc").value = this.props.taskDetail.desc !== null ? this.props.taskDetail.desc : "";
				document.getElementById("has-alarm-toggle").checked = this.state.showAlarmVisible;
				document.getElementById("priority-radio-low").checked = this.props.taskDetail.alarm === 5;
				document.getElementById("priority-radio-med").checked = this.props.taskDetail.alarm === 30;
				document.getElementById("priority-radio-high").checked = this.props.taskDetail.alarm === 60;
				document.getElementById("priority-radio-critical").checked = this.props.taskDetail.alarm === 1440;
			}
	}
	componentDidMount(){
		if(this.props.taskDetail !== null){
			this.setState({
				showAlarmVisible: this.props.taskDetail.alarm !== null
			})
		}
	}
	showAlarm(){
		this.setState({
			"showAlarmVisible" : !this.state.showAlarmVisible
		});
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
			<div className="form-item"> Set Alarm? 
				<div className="checkbox">
				<input id="has-alarm-toggle" type="checkbox" readOnly="" ref="hasAlarm" onClick={this.showAlarm.bind(this)} />
				<label htmlFor="has-alarm-toggle"></label>
				</div>
				</div>
				<div id="alarm-radio-wrapper" className={"form-item " + (this.state.showAlarmVisible ? "" : "hidden")}> 
				<div className="radio-option-wrapper">
				<label className="radio" htmlFor="priority-radio-low">
				<input id="priority-radio-low" ref="5min" type="radio" name="priority" value="5min" defaultChecked={this.props.taskDetail.alarm === 5}/> 
				<span className="outer"><span className="inner"></span></span><div className="radio-option-label-text">5 min</div>
				</label>
				</div>	
				<div className="radio-option-wrapper">
				<label className="radio" htmlFor="priority-radio-med">
				<input id="priority-radio-med" ref="30min" type="radio" name="priority" value="30min" defaultChecked={this.props.taskDetail.alarm === 30}/> <span className="outer">
				<span className="inner"></span></span><div className="radio-option-label-text">30 min</div>
				</label>
				</div>	
				<div className="radio-option-wrapper">
				<label className="radio" htmlFor="priority-radio-high">
				<input id="priority-radio-high" ref="1hour" type="radio" name="priority" value="1hour" defaultChecked={this.props.taskDetail.alarm === 60}/> <span className="outer">
				<span className="inner"></span></span><div className="radio-option-label-text">1 hour</div>
				</label>
				</div>	
				<div className="radio-option-wrapper">
				<label className="radio" htmlFor="priority-radio-critical">
				<input id="priority-radio-critical" ref="1day" type="radio" name="priority" value="1day" defaultChecked={this.props.taskDetail.alarm === 1440}/> <span className="outer">
				<span className="inner"></span></span><div className="radio-option-label-text"> 1 day</div>
				</label>
				</div>
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
