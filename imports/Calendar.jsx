import React, {Component} from 'react';

import Schedule from './Schedule.jsx';
import MonthView from './MonthView.jsx';
import QuickTasks from './QuickTasks.jsx';
import CalMonth from './CalMonth.jsx';
import CalYear from './CalYear.jsx';
import CalWeek from './CalWeek.jsx';
import UserMenu from './UserMenu.jsx';
import NotificationsMenu from './NotificationsMenu.jsx';

/* 3rd party plugins*/
import TrackerReact from 'meteor/ultimatejs:tracker-react';
import moment from 'moment';

export default class Calendar extends TrackerReact(Component) {
	constructor(props){
		super(props);
		/* Keep track of the current day (adjusted for timezone differences and Firefox's abiltiy to ruin everything)
		* track the date we want to create a task on or see what tasks we have on that day
		* the current month to view
		* and whether or not to display notifications tray
		*/
		this.state = {
			today : new Date(new Date().getTime() - (new Date().getTimezoneOffset() * 60000)).toJSON().substring(0, 10),
			monthShowing : new Date(),
			showNotifications: false,
			weekView: false,
			showMenu: false
		};
	}/* Triggers update in parent to tell app what day we are concerned with (changes current tasks view) 
	* Also updates state to delegate the coveted "selected-day" theme to child Day components
	*/
	selectDate(date){
		this.props.selectDate(date);
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
	/* Do not update component if, on mobile, we're just sliding from one index to another or it will try to re-render at each frame (yikes) */
	shouldComponentUpdate(nextProps, nextState){
		return (nextProps.filteredTasks !== this.props.filteredTasks || nextProps.selectedDate !== this.props.selectedDate || this.state !== nextState);
	}
	toggleWeekView(){
		this.setState({weekView : !this.state.weekView});
	}
	showAddTask(){
		this.props.showView("addTask");
	}
	toggleNotices(){
		this.setState({showNotifications: !this.state.showNotifications});
	}
	loggedInChange(){
		Meteor.logout();
		this.props.loggedInChange(false);
	}
	toggleMenu(){
		this.setState({showMenu: !this.state.showMenu});
	}
	render(){
		let tasks = Tasks.find({"dateStart" : {$regex: this.state.monthShowing.toJSON().substring(0,4) + ".*"}}).fetch();
		let notices = Notifications.find({}, {sort: {'timestamp': -1}, limit: 10}).fetch();

		const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

		return(
			<div id="calendar">

			<CalMonth toggleMenu={this.toggleMenu.bind(this)}
			toggleNotices={this.toggleNotices.bind(this)}
			toggleWeekView={this.toggleWeekView.bind(this)}
			toggleWeekView={this.toggleWeekView.bind(this)}
			width={this.props.width}
			showAddTask={this.showAddTask.bind(this)}
			month={months[this.state.monthShowing.getMonth()]}
			weekView={this.state.weekView}
			/> 

			<CalYear year={this.state.monthShowing.getFullYear()} />
			<CalWeek prevMonth={this.prevMonth.bind(this)} nextMonth={this.nextMonth.bind(this)} weekView={this.state.weekView}/> 

				<div id="cal-body" className={this.state.weekView ? "row-11" : "row-6"}>
				{
					/* Toggle showing the scheduler or the month calendar. The default is to show the calendar */
					this.state.weekView 
					? 
					<Schedule />
					:
					<MonthView 
					today={this.state.today} 
					selectedDate={this.props.selectedDate} 
					selectDate={this.selectDate.bind(this)}
					monthShowing={this.state.monthShowing}
					year={this.state.monthShowing.getFullYear()}
					month={this.state.monthShowing.getMonth()}
					width={this.props.width}
					tasks={tasks}
					/>
				}
				</div>
			{/* On mobile, display tasks list at bottom of screen where otherwise awkward space would be */}
			<div id="quick-tasks" className="row-4" style={{display: this.state.weekView || this.props.width > 992  ? "none" : "block"}}>
			<QuickTasks filteredTasks={this.props.filteredTasks}/>
			</div>	

			<UserMenu 
			showMenu={this.state.showMenu}
			toggleMenu={this.toggleMenu.bind(this)}
			loggedInChange={this.loggedInChange.bind(this)}
			/>

			<NotificationsMenu 
			showNotifications={this.state.showNotifications}
			toggleNotices={this.toggleNotices.bind(this)}
			notices={notices}
			showDetail={this.props.showDetail.bind(this)}
			/>
			</div>
			);
	}
}