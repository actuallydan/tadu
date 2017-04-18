import React from 'react';
import Day from './Day.jsx';

export default class MonthView extends React.Component {
	render (){
				const daysOfWeek = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

		return (
			<div id="calendar-wrapper">
			<div id="calendar-header-days">
			<div id="prev-month-button" className="mdi mdi-chevron-left" onClick={this.props.prevMonth.bind(this)}></div>
			{
				/* Create calendar header */
				daysOfWeek.map((dayText)=> {
					return (
						<span className="cal-block cal-header" key={"day-header-"+dayText}>	
						<p className="cal-day-text">
						{dayText === "Thursday" ? "Th" : dayText === "Saturday" ? "Sa" : dayText === "Sunday" ? "Su" : dayText[0]} 				
						</p>
						</span>
						)
				}
				)
			}
			<div id="next-month-button" className="mdi mdi-chevron-right" onClick={this.props.nextMonth.bind(this)}></div>
			</div>
			<div id="calendar-body" className="animated fadeIn" style={{"paddingTop" : "2.3em"}}>
			{
				/* Create calendar days with Day components, each has it's own style depending on whether its in the month, is selected, or is today */
				this.props.calArray.map((day)=>{
					let inThisMonth = parseInt(day.substring(5, 7)) === this.props.month + 1 ? true : false;
					let isToday = day === this.props.today ? true : false;
					let isSelected = day === this.props.selectedDate ? true : false;
					let dayStyles = {
						color: !inThisMonth ? "#424242" : !isToday ? "#FFFFFF" : isSelected ? "#FFFFFF" : "#1de9b6",
						borderWidth: 1,
						borderStyle: 'solid',
						borderColor: isSelected ? "#1de9b6" : "transparent",
						backgroundColor: isToday && isSelected ? "#1de9b6" : "transparent",
						width : "calc(100% / 7 - 2px)",
					};

					return (<Day date={day} style={dayStyles} key={day} selectDate={this.props.selectDate.bind(this)} isSelected={isSelected} events={this.props.cal[day].events}/>)
				}
				)
			}
			</div>
			</div>
			)
	}
}