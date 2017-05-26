import React, {Component} from 'react';
import swal from 'sweetalert';
import moment from 'moment';

const TaskSingle = (props)=> {
	const deleteTask = ()=>{
		swal({
			title: "Whoa there!",
			text: "Are you sure you want to delete this task?",
			type: "warning",
			showCancelButton: true
		}, function(){
			Meteor.call('deleteTask', props.task);
		});
	};
	const showDetail = (event)=>{
		let targ = event.target.tagName.toLowerCase();
		let goodTarg = ['span', 'li', 'p', 'div'];
		if(goodTarg.indexOf(targ) === -1){
			// Do nothing
		} else {
			props.showDetail(props.task);
		}
	};
	return (
		<li className="task-single animated bounceInUp" onClick={showDetail}>
		<div className="checkbox">
		<input id={"task_"+props.task._id} type="checkbox" readOnly={true} checked={props.task.completed} onClick={()=>{Meteor.call('toggleTask', props.task)}} />
		<label htmlFor={"task_"+props.task._id}></label>
		</div>
		<div>
		<span className={props.task.completed ? "task-title completed-task" : "task-title"}>{props.task.text}</span>
		<p className='task-info-date'>{moment(props.task.dateStart, "YYYY-MM-DD").format("M/DD/YYYY")}</p>
		<p className='task-info-time'>{moment(props.task.timeStart, "HH:mm").format("h:mm a")}</p>
		</div>
		<i className="btn-cancel task-secondary mdi mdi-close-box-outline text-grey-light" onClick={deleteTask} ></i>

		</li>	
		)
}
export default TaskSingle;