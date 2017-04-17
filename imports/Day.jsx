/* Day component for Tadu App 
*
* Displays a given date from this month
* Should probably be turned into a stateless or functional component if possible   
*
*/
import React, { Component } from 'react';

export default class Day extends Component {
	constructor(props){
		super(props);

		this.state = {
			selected : false
		};
	}
	selectDate() {
		this.props.selectDate(this.props.date);
		this.setState({
			selected : true
		});
	}
	render() {
		/* Inform the user whether or not there are any tasks set for this day and if so how many 
		* TODO: Ideally I'd like to find a way to present different types of tasks with different icons
		*/
		let eventCounter = this.props.events.length > 0 ? "mdi mdi-numeric-" + this.props.events.length + "-box-outline" : "no-events" ;
		return (
			<div className="cal-block cal-day" onClick={this.selectDate.bind(this)}>
				<p className="cal-day-text" style={this.props.style}>
					{this.props.date.substring(8, 10) < 10 ? this.props.date.substring(9, 10) : this.props.date.substring(8, 10)}
				</p>				
				<p className={"event-indicator " + eventCounter}></p>
			</div>
			);
	}
}


