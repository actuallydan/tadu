/* Day component for Tadu App 
*
* Displays a given date from this month
*
*/
import React, { Component } from 'react';

const Day = (props) => {
	const selectDate = () => {
		props.selectDate(props.date);
	}
	/* Inform the user whether or not there are any tasks set for this day and if so how many 
	* TODO: Ideally I'd like to find a way to present different types of tasks with different icons
	*/
	const taskIcon = ()=>{
		if(props.events.length > 0 && window.innerWidth <= 992) {
			return "mdi mdi-checkbox-blank-circle";
		} else if(props.events.length === 0){
			return "mdi mdi-checkbox-blank no-events";
		} else if(props.events.length > 0 && props.events.length < 10 ){
			return "mdi mdi-numeric-" + props.events.length + "-box-outline";
		} else {
			return "mdi mdi-numeric-9-plus-box-outline";
		}
	}
	return (
		<div className="cal-block" onClick={selectDate} style={props.style}>
		<p className="cal-day-text">
		{props.date.substring(8, 10) < 10 ? props.date.substring(9, 10) : props.date.substring(8, 10)}
		</p>				
		<p className={"animated zoomIn event-indicator " + taskIcon()} style={{color: props.style.backgroundColor === "#1de9b6"? "#242424" : "#1de9b6"}}></p>
		</div>
		);
};
export default Day;


