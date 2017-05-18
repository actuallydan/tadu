import React from 'react';
import Day from './Day.jsx';
import moment from 'moment';

export default class MonthView extends React.Component {
	constructor(props){
		super();
	}
	render (){
		let _year = this.props.year, _month = this.props.month;
		var daysBefore = new Date(_year, _month, 1).getDay();
		var tempCal = {};
		for (var i = daysBefore; i > 0; --i) {
			tempCal[new Date(_year, _month, -1 * i + 1).toJSON().substring(0, 10)] = {
				events: this.props.tasks.filter((event)=>{return event.dateStart === new Date(_year, _month, -1 * i + 1).toJSON().substring(0, 10) })
			};
		}
		for (var i = 0; i < 35 + (7 - daysBefore); i++) {
			tempCal[new Date(_year, _month, 1 + i).toJSON().substring(0, 10)] = {
				events: this.props.tasks.filter((event)=>{return event.dateStart === new Date(_year, _month, i + 1).toJSON().substring(0, 10) })
			};
		} /* To iteratively index into cal obj */
		var _calArray = Object.keys(tempCal); 
		/* Create calendar days with Day components, each has it's own style depending on whether its in the month, is selected, or is today */
		
		return(
			<div className="month-wrapper">
			{
				_calArray.map((day)=>{
					let _inThisMonth = parseInt(day.substring(5, 7)) === this.props.monthShowing.getMonth() + 1 ? true : false;
					let _isToday = day === this.props.today ? true : false;
					let _isSelected = day === this.props.selectedDate ? true : false;
					let _dayStyles = {
						color: !_inThisMonth ? "#424242" : !_isToday ? "#FFF" : _isSelected ? "#FFF" : "#1de9b6",
						borderWidth: 1,
						borderStyle: 'solid',
						borderColor: _isSelected ? "#1de9b6" : "transparent",
						backgroundColor: _isToday && _isSelected ? "#1de9b6" : "transparent",
						width : this.props.width > 1400 ? "calc(60vw / 7 - 2px)" : this.props.width > 992 ? "calc(70vw / 7 - 2px)" : "calc(100vw / 7 - 2px)",
						height : "calc(100% / 6 - 2px)",
					};
					return <Day date={day} style={_dayStyles} key={day} selectDate={this.props.selectDate.bind(this)} isSelected={_isSelected} events={tempCal[day].events}/>
				})
			}
			</div>
			)
	}
}