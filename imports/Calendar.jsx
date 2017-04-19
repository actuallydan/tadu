/* Calendar view for Tadu App 
*
* Displays current month, current day, selected day, and switches views in parent component 
*
*/
import React from 'react';
import Notice from './Notice.jsx';
import Schedule from './Schedule.jsx';
import MonthView from './MonthView.jsx';

/* 3rd party plugins*/
import ReactTooltip from 'react-tooltip';
import TrackerReact from 'meteor/ultimatejs:tracker-react';
import moment from 'moment';
import Rodal from 'rodal';
import 'rodal/lib/rodal.css';

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
			selectedDate : new Date().toJSON().substring(0, 10),
			monthShowing : new Date(),
			showNotifications: false,
			showSchedule: false,
			weekView: false
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
	render(){
		/* Get tasks so we can map them over the current month to show them on the calendar 
		* Refined to only search for tasks in this current month
		*/
		let tasks = Tasks.find({"dateStart" : {$regex: this.state.monthShowing.toJSON().substring(0,8) + ".*"}}).fetch();
		let year = this.state.monthShowing.getFullYear(), month = this.state.monthShowing.getMonth(), day = this.state.monthShowing.getDate();
		/* Create an array that will hold day objects to represent each Day Component */
		let cal = {};

		/* See if the first day of the month is a Sunday, if not get the days preceding it so we can have a contiguous block */
		let daysBeforeInBlock = new Date(year, month, 1).getDay() ;

		/* Get the days in this week that are in the previous month if any, and add them to our calendar object 
		* Deprecated: From the array of tasks, give each day object an array of it's  respective tasks
		*/
		for(let i = daysBeforeInBlock; i > 0; --i){
			cal[new Date(year, month, -1 * i + 1).toJSON().substring(0, 10)] = {
				events : tasks.filter((event)=>{return event.dateStart === new Date(year, month, -1 * i + 1).toJSON().substring(0, 10) })
			};
		}
		/* Get the rest of the days in this month and any that would complete the 6th row of our calendar as needed, and add them to our calendar object 
		*  From the array of tasks, give each day object an array of it's respective tasks
		*/
		for(let i = 0; i < 35 + (7 - daysBeforeInBlock) ; i++){
			cal[new Date(year, month, 1 + i).toJSON().substring(0, 10)] = {
				events : tasks.filter((event)=>{return event.dateStart === new Date(year, month, i + 1).toJSON().substring(0, 10) })
			};
		}
		/* Create iterable array from our calendar object*/
		let calArray = Object.keys(cal);

		/* The days of the week so we can iterate over them instead of having 7 tags which is maybe superflous 
		Maybe useful if someone wants to add a localization starts-on-monday bit of nonsense #westerncentric */
		const daysOfWeek = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

		/* indicates to each Day component how it should be styled: white for the current month, grey for other months */
		const thisMonth = new Date(this.props.month)

		/* Because the Date Object doesn't have an option to ge the full name of the month we have it here 
		* Also potential place for localization/language thing
		*/
		const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
		return (<div id="calendar">

			<div id="calendar-header">
			<div id="action-bar">
			<div id="add-event-button" className="nav-button mdi mdi-view-list hide-on-large hide-on-med" onClick={this.props.showTasks.bind(this)} data-tip="Tasks"></div>
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
				<MonthView 
				calArray={calArray} 
				today={this.state.today} 
				selectedDate={this.state.selectedDate} 
				cal={cal} 
				month={month} 
				selectDate={this.selectDate.bind(this)}
				prevMonth={this.prevMonth.bind(this)}
				nextMonth={this.nextMonth.bind(this)}
				/>
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
				{this.props.notifications.map((notice)=>{
					return (<Notice key={notice._id} data={notice} />)
				})}
				</Rodal>
				:
				""
			}
			</div>)
}
}