import React, {Component} from 'react';

import Schedule from './Schedule.jsx';
import MonthView from './MonthView.jsx';
import QuickTasks from './QuickTasks.jsx';
import NotificationsWrapper from './NotificationsWrapper.jsx';
import Menu from './Menu.jsx';

/* 3rd party plugins*/
import ReactTooltip from 'react-tooltip';
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
			subscription: {
				notifications: Meteor.subscribe("notifications"),
			},
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
		const daysOfWeek = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

		const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
		// if(!weekView && !Meteor.user().profile.tut.calendar){
		// 	/* Show swal for calendar */
		// } else if(weekView && !Meteor.user().profile.tut.schedule){
		// 	/* Show swal for calendar */
		// } else if(this.props.width < 992 && !Meteor.user().profile.tut.tasks){
		// 	/* Show swal for Quick Tasks */ 
		// }
		return(
			<div id="calendar">
			<div id="cal-month" className="row">
			<div id="cal-month-text">
			{months[this.state.monthShowing.getMonth()]}
			</div>
			<div id="action-bar">
			<div className="nav-button mdi mdi-menu" onClick={this.toggleMenu.bind(this)} data-tip="Menu"></div>

			<div className="nav-button mdi mdi-alarm" onClick={this.toggleNotices.bind(this)} data-tip="Notifications"></div>
			{
				this.state.weekView ?  
				<div className="nav-button mdi mdi-calendar" onClick={this.toggleWeekView.bind(this)} data-tip="Calendar"></div>

				: 
				<div className="nav-button mdi mdi-view-dashboard" onClick={this.toggleWeekView.bind(this)} data-tip="Schedule"></div>

			}
			{
				this.props.width > 1400 
				?
				""
				:
				<div id="add-event-button" className="nav-button mdi mdi-plus hide-on-large" onClick={this.showAddTask.bind(this)} data-tip="Add Event"></div>
			}
			</div>
			<div className="hide-on-small">
			<ReactTooltip place="bottom" type="dark" effect="solid" style={{borderRadius : 0, color: '#1de9b6', opacity: 0, backgroundColor: '#000000'}}>
			</ReactTooltip>
			</div>
			</div>
			<div id="cal-year" className="row">
			<div id="cal-year-text">
			{this.state.monthShowing.getFullYear()}
			</div>
			</div>
			<div id="cal-week" className="row" style={{display: this.state.weekView ? "none" : "block"}}>
			<div id="prev-month-button" className="mdi mdi-chevron-left" onClick={this.prevMonth.bind(this)}></div>
			{
				/* Create calendar header */
				daysOfWeek.map((dayText)=> {
					return (
						<span className="cal-header" key={"day-header-"+dayText}>	
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
			{/* Menu for all other nav items (logout etc) */}
			<Menu show={this.state.showMenu} toggleMenu={this.toggleMenu.bind(this)}>
			<div className="wrapper">
				<div className="menu-header"> Menu </div>
				<div className="menu-item" onClick={this.loggedInChange.bind(this)}>
				<div className="menu-icon mdi mdi-exit-to-app"></div>
						<div className="menu-text">Logout</div>
				</div>
				</div>
			</Menu>
			{/* Menu for all other nav items (logout etc) */}
			<Menu show={this.state.showMenu} toggleMenu={this.toggleMenu.bind(this)}>
			<div className="wrapper">
				<div className="menu-header"> Menu </div>
				<div className="menu-item" onClick={this.loggedInChange.bind(this)}>
				<div className="menu-icon mdi mdi-exit-to-app"></div>
						<div className="menu-text">Logout</div>
				</div>
				</div>
			</Menu>
		{/* Menu for Notifications */}
		<Menu show={this.state.showNotifications} toggleMenu={this.toggleNotices.bind(this)}> 
		<div className="menu-header"> Notifications </div>
		<NotificationsWrapper notices={notices} showDetail={this.props.showDetail.bind(this)}/>
		</Menu>
			</div>
			);
	}
}