import React, {Component} from 'react';
import swal from 'sweetalert';
import moment from 'moment';

export default class TaskSingle extends Component {
	constructor(props) {
		super(props);
	}
	toggleTask(){
		Meteor.call('toggleTask', this.props.task);
	}
	deleteTask(){
		let task = this.props.task;
		swal({
			title: "Whoa there!",
			text: "Are you sure you want to delete this task?",
			type: "warning",
			showCancelButton: true
		}, function(){
					Meteor.call('deleteTask', task);
		});
	}
	showDetail(event){
		let targ = event.target.tagName.toLowerCase();
		let goodTarg = ['span', 'li', 'p', 'div'];
		if(goodTarg.indexOf(targ) === -1){
			// Do nothing
		} else {
			this.props.showDetail(this.props.task);
		}
	}
	render(){
		var taskClass = this.props.task.completed ? "completed-task" : "";
		
		return (
			<li className="task-single animated bounceInUp" onClick={this.showDetail.bind(this)}>
			<div className="checkbox">
				<input id={"task_"+this.props.task._id} type="checkbox" readOnly={true} checked={this.props.task.completed} onClick={this.toggleTask.bind(this)} />
				 <label htmlFor={"task_"+this.props.task._id}></label>
			</div>
			<div>
				<span className={"task-title " + taskClass}>{this.props.task.text}</span>
				<p className='task-info-date'>{moment(this.props.task.dateStart, "YYYY-MM-DD").format("M/DD/YYYY")}</p>
				<p className='task-info-time'>{moment(this.props.task.timeStart, "HH:mm").format("h:mm a")}</p>
			</div>
			<i className="btn-cancel task-secondary mdi mdi-close-box-outline text-grey-light" onClick={this.deleteTask.bind(this)} ></i>

			</li>	
			)
	}
}