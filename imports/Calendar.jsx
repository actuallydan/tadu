import React from 'react';
import Day from './Day.jsx';
import ReactTooltip from 'react-tooltip';
import TrackerReact from 'meteor/ultimatejs:tracker-react';
import moment from 'moment';
import Rodal from 'rodal';
import 'rodal/lib/rodal.css';

export default class Cal extends TrackerReact(React.Component) {
	constructor(props){
		super(props);

		this.state = {
			today : new Date(new Date().getTime() - (new Date().getTimezoneOffset() * 60000)).toJSON().substring(0, 10),
			selectedDate : new Date().toJSON().substring(0, 10),
			monthShowing : new Date(),
			eventsThisMonth: {},
			events: [],
			showNotifications: false
		};
	}
	selectDate(date){
		this.props.selectDate(date);
		this.setState({
			selectedDate : date
		});
	}
	prevMonth(){
		this.setState({
			monthShowing : new Date(this.state.monthShowing.getFullYear(), this.state.monthShowing.getMonth() - 1, this.state.monthShowing.getDate())
		});
	}
	nextMonth(){
		this.setState({
			monthShowing : new Date(this.state.monthShowing.getFullYear(), this.state.monthShowing.getMonth() + 1, this.state.monthShowing.getDate())
		});


	}
	showNotice() {
		this.setState({ showNotifications : true });
	}

	hideNotice() {
		this.setState({showNotifications : false});
	}
	setAlarm(){
		let nextTask = Tasks.findOne({dateStart: {$gte : new Date().toJSON().substring(0,10)}, timeStart: {$gt : moment().format("hh:mm")}}, {sort : {dateStart: 1, timeStart: 1}})
		console.log(nextTask);
		if(nextTask !== undefined){
			let nextTaskDateTime = moment(nextTask.dateStart + "T" + nextTask.timeStart, "YYYY-MM-DDThh:mm").format("x");
			console.log("alarm set");
			setTimeout(()=>{ this.notify(nextTask);}, nextTaskDateTime - new Date().getTime());
		}
	}

	render(){
		let tasks = Tasks.find().fetch();
		let year = this.state.monthShowing.getFullYear(), month = this.state.monthShowing.getMonth(), day = this.state.monthShowing.getDate();
		let cal = [];
		// See if the first day of the week is a Sunday, if not get the days preceding it so we can have a contiguous block
		let daysBeforeInBlock = new Date(year, month, 1).getDay() ;

		for(let i = daysBeforeInBlock; i > 0; --i){
			cal[new Date(year, month, -1 * i + 1).toJSON().substring(0, 10)] = {
				events : tasks.filter((event)=>{return event.dateStart === new Date(year, month, -1 * i + 1).toJSON().substring(0, 10) })
			};
		}
		for(let i = 0; i < 35 + (7 - daysBeforeInBlock) ; i++){
			cal[new Date(year, month, 1 + i).toJSON().substring(0, 10)] = {
				events : tasks.filter((event)=>{return event.dateStart === new Date(year, month, i + 1).toJSON().substring(0, 10) })
			};
		}
		let calArray = Object.keys(cal);
		for (let i = 0; i < 31; i++) {
			this.state.eventsThisMonth[new Date(year, month, 1 + i).toJSON().substring(0, 10)] = {
				events : tasks.filter((event)=>{return event.dateStart === new Date(year, month, i + 1).toJSON().substring(0, 10)})
			};
		}
		const daysOfWeek = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

		let n = 0;
		// this.renderTasks();

		const thisMonth = new Date(this.props.month)

		const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

		return (<div id="calendar">

			<div id="calendar-header">
			<div id="action-bar">
			<div id="add-event-button" className="nav-button mdi mdi-view-list hide-on-large hide-on-med" onClick={this.props.showTasks.bind(this)} data-tip="Tasks"></div>
			<div id="add-event-button" className="nav-button mdi mdi-alarm" onClick={this.showNotice.bind(this)} data-tip="Notifications"></div>
			<div id="add-event-button" className="nav-button mdi mdi-view-dashboard" onClick={this.props.showAddTask.bind(this)} data-tip="Schedule"></div>
			<div id="add-event-button" className="nav-button mdi mdi-plus hide-on-large" onClick={this.props.showAddTask.bind(this)} data-tip="Add Event"></div>
			</div>
			<ReactTooltip place="bottom" type="dark" effect="solid" style={{borderRadius : 0, color: '#1de9b6', opacity: 0, backgroundColor: '#000000'}}/>

			<div id="calendar-header-month">
			{months[this.state.monthShowing.getMonth()]}
			</div>
			<div id="calendar-header-year"> 
			{this.state.monthShowing.getFullYear()}
			</div>
			</div>
			<div id="calendar-header-days">
			<div id="prev-month-button" className="mdi mdi-chevron-left" onClick={this.prevMonth.bind(this)}></div>
			{
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
			<div id="calendar-body" className="animated fadeIn">
			{
				calArray.map((day)=>{
					n++;
					let inThisMonth = parseInt(day.substring(5, 7)) === month + 1 ? true : false;
					let isToday = day === this.state.today ? true : false;
					let isSelected = day === this.state.selectedDate ? true : false;
					let dayStyles = {
						color: !inThisMonth ? "#424242" : !isToday ? "#FFFFFF" : isSelected ? "#FFFFFF" : "#1de9b6",
						borderWidth: 1,
						borderStyle: 'solid',
						borderColor: isSelected ? "#1de9b6" : "transparent",
						backgroundColor: isToday && isSelected ? "#1de9b6" : "transparent",
						padding: 10,
						width : '1.2em'
					};

					return (<Day date={day} style={dayStyles} key={n} selectDate={this.selectDate.bind(this)} isSelected={isSelected} events={cal[day].events}/>)
				}
				)
			}
			</div>
			{this.state.showNotifications ? 
				<Rodal visible={this.state.showNotifications} onClose={this.hideNotice.bind(this)} className="modal task-detail glow" animation="door" customStyles={{width: '80%',
				height: '80%', borderRadius: 0, borderColor: '#1de9b6', borderWidth: 1, borderStyle : 'solid', background: '#242424', color: '#fff'}}>
				{this.props.notifications.map((notice)=>{
					return (<div key={notice._id}>Notice</div>)
				})}
				</Rodal>
				:
				""
			}
			</div>)
	}
}