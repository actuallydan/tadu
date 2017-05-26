import React, {Component} from 'react';
const CalYear = (props) => {
	return(
		<div id="cal-year" className="row">
		<div id="cal-year-text">
		{props.year}
		</div>
		</div>
		)
}
export default CalYear;