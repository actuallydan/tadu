import React from 'react';
import Day from './Day.jsx';
import ReactTooltip from 'react-tooltip';
import TrackerReact from 'meteor/ultimatejs:tracker-react';


export default class Cal extends TrackerReact(React.Component) {
	constructor(props){
		super(props);

		this.state = {
			today : new Date(),
			selectedDate : new Date().toJSON().substring(0, 10),
			monthShowing : new Date(),
			eventsThisMonth: {},
			events: []
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
	render(){
		let tasks = Tasks.find().fetch();
		console.log(this.state.monthShowing);

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
					<div id="add-event-button" className="nav-button mdi mdi-alarm" onClick={this.props.showAddTask.bind(this)} data-tip="Set Alarm"></div>
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
					let isToday = day === this.state.today.toJSON().substring(0, 10) ? true : false;
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

			</div>)
	}
}