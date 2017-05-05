/* Day component for Tadu App 
*
* Displays a given date from this month
* Should probably be turned into a stateless or functional component if possible   
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

		let eventCounter = props.events.length > 0 && window.innerWidth <= 992 ? "mdi mdi-checkbox-blank-circle" : props.events.length > 0 ? "mdi mdi-numeric-" + props.events.length + "-box-outline" : "mdi mdi-checkbox-blank no-events" ;
		return (
			<div className="cal-block cal-day" onClick={selectDate} style={props.style}>
				<p className="cal-day-text">
					{props.date.substring(8, 10) < 10 ? props.date.substring(9, 10) : props.date.substring(8, 10)}
				</p>				
				<p className={"animated zoomIn event-indicator " + eventCounter} style={{color: props.style.backgroundColor === "#1de9b6"? "#242424" : "#1de9b6"}}></p>
			</div>
			);
	
};
export default Day;


