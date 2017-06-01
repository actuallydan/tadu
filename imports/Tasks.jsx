import React, {Component} from 'react';
import moment from 'moment';

/* Component to display tasks */
const Tasks = (props)=>{
	const showDetail = (event)=>{
		props.showDetail(event);
	};
	return(
		<div id="tasks">
		<div className="hide-on-large hide-on-med"></div>
		<div id="task-list-header">{moment(props.selectedDate, "YYYY-MM-DD").format("ddd MMMM Do")} </div>
		<ul id="tasks-wrapper">
		{props.filteredTasks}
		</ul>
		</div>);
}
export default Tasks;