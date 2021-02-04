import React from 'react';
import Day from './Day.jsx';
import moment from 'moment';

/* The actual Calendar part of the Calendar Component, generates the month from the given day and maps out the month's tasks 
* There has to be a way to make this stateless */
export default class MonthView extends React.Component {
	constructor(props){
		super();
	}
	render (){		
		let _year = this.props.year, _month = this.props.month;
		let daysBefore = moment(this.props.monthShowing, "YYYY-MM-DD").set('date', 1).format('e');
		let tempCal = {};
		for (var i = daysBefore; i > 0; --i) {
			tempCal[moment(this.props.monthShowing, "YYYY-MM-DD").set('date', 1).subtract(i, 'days').format("YYYY-MM-DD")] = {
				events: this.props.tasks.filter((event)=>{return event.dateStart === moment(this.props.monthShowing, "YYYY-MM-DD").set('date', 1).subtract(i, 'days').format("YYYY-MM-DD") })
			};
		}
		for (var i = 0; i < 35 + (7 - daysBefore); i++) {
			tempCal[moment(this.props.monthShowing, "YYYY-MM-DD").set('date', 1).add(i, 'days').format("YYYY-MM-DD")] = {
				events: this.props.tasks.filter((event)=>{return event.dateStart === moment(this.props.monthShowing, "YYYY-MM-DD").set('date', 1).add(i, 'days').format("YYYY-MM-DD") })
			};
		} /* To iteratively index into cal obj */
		var _calArray = Object.keys(tempCal); 
		/* Create calendar days with Day components, each has it's own style depending on whether its in the month, is selected, or is today */
		
		return(
			<div className="month-wrapper animated pulse">
			{
				_calArray.map((day)=>{
					let _inThisMonth = day.substring(5, 7) === this.props.month ? true : false;
					let _isToday = day === this.props.today ? true : false;
					let _isSelected = day === this.props.selectedDate ? true : false;
					let _dayStyles = {
						color: !_inThisMonth ? "#424242" : !_isToday ? "#FFF" : _isSelected ? "#242424" : "#33FFCC",
						borderWidth: 1,
						borderStyle: 'solid',
						borderColor: _isSelected ? "#33FFCC" : "transparent",
						backgroundColor: _isToday && _isSelected ? "#33FFCC" : "transparent",
						width : this.props.width > 1400 ? "calc(60vw / 7 - 2px)" : this.props.width > 992 ? "calc(70vw / 7 - 2px)" : "calc(100vw / 7 - 2px)",
						height : this.props.width > 992 ? "calc(100vh / 13 * 10 / 6 - 2px)" : "calc(100% / 6 - 2px)",
					};
					return <Day date={day} style={_dayStyles} key={day} selectDate={this.props.selectDate.bind(this)} isSelected={_isSelected} events={tempCal[day].events}/>
				})
			}
			</div>
			)
	}
}