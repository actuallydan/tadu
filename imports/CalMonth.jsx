import React, {Component} from 'react';
import ReactTooltip from 'react-tooltip';

const CalMonth = (props) => {
	return (
		<div id="cal-month" className="row">
		<div id="cal-month-text">
		{props.month}
		</div>
		<div id="action-bar">
		<div className="nav-button mdi mdi-menu" onClick={props.toggleMenu} data-tip="Menu"></div>

		<div className="nav-button mdi mdi-alarm" onClick={props.toggleNotices} data-tip="Notifications"></div>
		{
			props.weekView ?  
			<div className="nav-button mdi mdi-calendar" onClick={props.toggleWeekView} data-tip="Calendar"></div>

			: 
			<div className="nav-button mdi mdi-view-dashboard" onClick={props.toggleWeekView} data-tip="Schedule"></div>

		}
		<div id="add-event-button" className="nav-button mdi mdi-plus hide-on-large" onClick={props.showAddTask} data-tip="Add Task"></div>
		</div>
		<div className="hide-on-small">
		<ReactTooltip place="bottom" type="dark" effect="solid" style={{borderRadius : 0, color: '#1de9b6', opacity: 0, backgroundColor: '#000000'}}>
		</ReactTooltip>
		</div>
		</div>
		)
};

export default CalMonth;