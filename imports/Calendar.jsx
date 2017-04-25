/* Calendar view for Tadu App 
*
* Displays current month, current day, selected day, and switches views in parent component 
*
*/
import React from 'react';
import Notice from './Notice.jsx';
import Schedule from './Schedule.jsx';
import MonthView from './MonthCal.jsx';

/* 3rd party plugins*/
import ReactTooltip from 'react-tooltip';
import TrackerReact from 'meteor/ultimatejs:tracker-react';
import moment from 'moment';
import Rodal from 'rodal';
import 'rodal/lib/rodal.css';

import SwipeableViews from 'react-swipeable-views';

export default class Cal extends TrackerReact(React.Component) {
	constructor(props){
		super(props);

		/* Keep track of the current day (adjusted for timezone differences and Firefox's abiltiy to ruin everything)
		* track the date we want to create a task on or see what tasks we have on that day
		* the current month to view
		* and whether or not to display notifications tray
		*/
		this.state = {
			today : new Date(new Date().getTime() - (new Date().getTimezoneOffset() * 60000)).toJSON().substring(0, 10),
			selectedDate : new Date(new Date().getTime() - (new Date().getTimezoneOffset() * 60000)).toJSON().substring(0, 10),
			monthShowing : new Date(),
			showNotifications: false,
			showSchedule: false,
			weekView: false,
			index: null
		};
	}
	/* Triggers update in parent to tell app what day we are concerned with (changes current tasks view) 
	* Also updates state to delegate the coveted "selected-day" theme to child Day components
	*/
	selectDate(date){
		this.props.selectDate(date);
		this.setState({
			selectedDate : date
		});
	}
	/* Move back 1 month 
	* Set state to date object 1 month prior
	* This should not update the selectedDate
	*/
	prevMonth(){
		this.setState({
			monthShowing : new Date(this.state.monthShowing.getFullYear(), this.state.monthShowing.getMonth() - 1, this.state.monthShowing.getDate())
		});
	}
	/* Move forward 1 month 
	* Set state to date object of 1 month in the future
	* This should not change selectedDate
	*/
	nextMonth(){
		this.setState({
			monthShowing : new Date(this.state.monthShowing.getFullYear(), this.state.monthShowing.getMonth() + 1, this.state.monthShowing.getDate())
		});
	}
	/* Display the notifications tray
	* Should probably condensed into a single toggle method
	*/	
	showNotice() {
		this.setState({ showNotifications : true });
	}
	/* Hide the notifications tray
	* Should probably condensed into a single toggle method
	*/	
	hideNotice() {
		this.setState({showNotifications : false});
	}
	toggleWeekView(){
		this.setState({weekView : !this.state.weekView})
	}
	updateMonth(index, type){
		// switch(index){
		// 	case 0:
		// 	this.prevMonth();
		// 	break;
		// 	case 2:
		// 	this.nextMonth()
		// 	break;
		// }
		this.setState({
			index: 1
		});

	}
	render(){
		/* Get tasks so we can map them over the current month to show them on the calendar 
		* Refined to only search for tasks in this current month
		*/
		let tasks = Tasks.find({"dateStart" : {$regex: this.state.monthShowing.toJSON().substring(0,4) + ".*"}}).fetch();
		const daysOfWeek = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

		const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

	
			return (<div id="calendar">

				<div id="calendar-header">
				<div id="action-bar">
				<div id="add-event-button" className="nav-button mdi mdi-alarm" onClick={this.showNotice.bind(this)} data-tip="Notifications"></div>
				{
					this.state.weekView ?  
					<div id="add-event-button" className="nav-button mdi mdi-calendar" onClick={this.toggleWeekView.bind(this)} data-tip="Calendar"></div>

					: 
					<div id="add-event-button" className="nav-button mdi mdi-view-dashboard" onClick={this.toggleWeekView.bind(this)} data-tip="Schedule"></div>

				}

				<div id="add-event-button" className="nav-button mdi mdi-plus hide-on-large" onClick={this.props.showAddTask.bind(this)} data-tip="Add Event"></div>
				</div>
				<div className="hide-on-small">
				<ReactTooltip place="bottom" type="dark" effect="solid" style={{borderRadius : 0, color: '#1de9b6', opacity: 0, backgroundColor: '#000000'}}>
				</ReactTooltip>
				</div>

				<div id="calendar-header-month">
				{months[this.state.monthShowing.getMonth()]}
				</div>
				<div id="calendar-header-year"> 
				{this.state.monthShowing.getFullYear()}
				</div>
				</div>
				{this.state.weekView ? 
					<Schedule />
					:
					<div id="calendar-wrapper">
					<div id="calendar-header-days">
					<div id="prev-month-button" className="mdi mdi-chevron-left" onClick={this.prevMonth.bind(this)}></div>
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
					<div id="next-month-button" className="mdi mdi-chevron-right" onClick={this.nextMonth.bind(this)}></div>
					</div>
					<div id="calendar-body" style={{"paddingTop" : "3.25em"}}>

					<SwipeableViews
					index={this.state.index === null ? 1 : this.state.index}
					onSwitching={this.updateMonth.bind(this)}>

					<div>
					<MonthView 
					today={this.state.today} 
					selectedDate={this.state.selectedDate} 
					selectDate={this.selectDate.bind(this)}
					monthShowing={this.state.monthShowing}
					year={this.state.monthShowing.getFullYear()}
					month={this.state.monthShowing.getMonth() - 1}
					tasks={tasks}
					/>
					</div>

					<div>
					<MonthView 
					today={this.state.today} 
					selectedDate={this.state.selectedDate} 
					selectDate={this.selectDate.bind(this)}
					monthShowing={this.state.monthShowing}
					year={this.state.monthShowing.getFullYear()}
					month={this.state.monthShowing.getMonth()}
					tasks={tasks}
					/>
					</div>

					<div>
					<MonthView 
					today={this.state.today} 
					selectedDate={this.state.selectedDate} 
					selectDate={this.selectDate.bind(this)}
					monthShowing={this.state.monthShowing}
					year={this.state.monthShowing.getFullYear()}
					month={this.state.monthShowing.getMonth() + 1}
					tasks={tasks}
					/>
					</div>


					</SwipeableViews>

					</div>
					
					</div>

				}
				{
				/* Crammed down here like the dirty after-thought it is, is the nofitications icon tray
				* (I bet you forgot about it too didnt' you?)
				* One of the gnarliest ternary opertators I've written to decide whether or not to rear it's ugly face
				* TODO: style should be passed in from parent that also has a Rodal style object
				*/
				this.state.showNotifications ? 
				<Rodal visible={this.state.showNotifications} onClose={this.hideNotice.bind(this)} className="modal task-detail glow" animation="door" customStyles={{width: '80%',
				height: '80%', borderRadius: 0, borderColor: '#1de9b6', borderWidth: 1, borderStyle : 'solid', background: '#242424', color: '#fff'}}>
				<div id="notice-header">Notifications</div>	
				<div id="notice-wrapper">
				{this.props.notifications.sort((a, b)=>{return a.timestamp < b.timestamp}).map((notice)=>{
					return (<Notice key={notice._id} data={notice} />)
				})}
				</div>
				</Rodal>
				:
				""
			}
			</div>)
}
}
const get20Years = ()=>{
	var allYears = [];
	for(var i = 12; i > 0; i--){ 
		allYears.push(moment().subtract(i, "months")) 
	} 
	allYears.push(moment()); 
	for(var i = 0; i < 12; i++){ 
		allYears.push(moment().add(i, "months")) 
	} 
	return allYears 
};

