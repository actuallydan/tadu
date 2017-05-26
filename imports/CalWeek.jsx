import React, {Component} from 'react';

const CalWeek = (props)=>{
	const daysOfWeek = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
	return(
		<div id="cal-week" className="row" style={{display: props.weekView ? "none" : "block"}}>
			<div id="prev-month-button" className="mdi mdi-chevron-left" onClick={props.prevMonth}></div>
			{
				/* Create calendar header */
				daysOfWeek.map((dayText)=> {
					return (
						<span className="cal-header" key={"day-header-"+dayText}>	
						<p className="cal-day-text">
						{dayText[0]} 				
						</p>
						</span>
						)
				}
				)
			}
			<div id="next-month-button" className="mdi mdi-chevron-right" onClick={props.nextMonth}></div>
			</div>
		)
}
export default CalWeek;