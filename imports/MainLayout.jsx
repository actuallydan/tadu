import React from 'react';
import TaskList from './TaskList.jsx';
import Calendar from './Calendar.jsx';
import AddTask from './AddTask.jsx';
import './styles/main.less';
import 'animate.css';
import swal from 'sweetalert';
import 'sweetalert/dist/sweetalert.css';
import './styles/swaloverride.css';
import LoginForm from './LoginForm.jsx';

import moment from 'moment';
import Rodal from 'rodal';
import 'rodal/lib/rodal.css';

Tasks = new Mongo.Collection('Tasks');
TagTypes = new Mongo.Collection("TagTypes");

export default class MainLayout extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			loggedIn: Meteor.userId() === null ? false : true,
			viewMode: "calendar",
			selectedDate: new Date().toJSON().substring(0,10),
			width: window.innerWidth > 1399 ? (window.innerWidth - 700) : window.innerWidth > 992 ? (window.innerWidth - 300) : window.innerWidth,
			subscription: {
				tasks: Meteor.subscribe("userTasks"),
				tagTypes: Meteor.subscribe("tagTypes")
			},
			eventDetail : null
		};
	}

	handleResize(){
		let newWidth = window.innerWidth > 1399 ? (window.innerWidth - 700) : window.innerWidth > 992 ? (window.innerWidth - 300) : window.innerWidth;
		this.setState({width: newWidth});
		console.log(this.state.width);
	}
	loggedInChange(flag){
		this.setState({
			loggedIn: flag
			});
	}
	componentWillUnmount(){
		window.removeEventListener('resize');
	}
	componentDidMount() {
		window.addEventListener('resize', this.handleResize.bind(this));

		if (Notification.permission !== "granted")
		    Notification.requestPermission();
		if (!Notification) {
			swal('Desktop notifications not available in your browser. Try Chromium.'); 
			return;
		}
	}
	showAddTask(){
		// this.props.mobileView("addTask");
		this.setState({
			viewMode : 'addEvent'
		});
	}
	hideAddTask(){
		// this.props.mobileView("calendar");
		this.setState({
			viewMode : 'calendar'
		});
	}
	showDetail(event) {
		console.log(event);
	    this.setState({ visible: true , eventDetail : event });
  }
  
  hideDetail() {
    this.setState({ visible: false, eventDetail : null});
  }
  selectDate(date){
  	this.setState({
  		selectedDate: date
  	})
  }
	render() {
		let viewCal =  true;
		let viewEventList =  this.state.viewMode === 'events' ? true : window.innerWidth >= 992 ? true : false;
		let viewAddEvent = this.state.viewMode === 'addEvent' ? true : window.innerWidth >= 1400 ? true : false;
		// console.log("Show Cal:", viewCal, "Show EventList:", viewEventList, "Show Add:", viewAddEvent);
		let eventDetail = this.state.eventDetail !== null ? this.state.eventDetail : "" ;
		// console.log("selected date: " + this.state.selectedDate);
		return (
			<div>

				{this.state.loggedIn 
					?
					<div>
				<div id="left-wrapper">
					<TaskList show={viewEventList} showDetail={this.showDetail.bind(this)} selectedDate={this.state.selectedDate}/>
				</div>
				<div id="center-wrapper">
					<Calendar show={viewCal} showAddTask={this.showAddTask.bind(this)} selectDate={this.selectDate.bind(this)}/>
				</div>
				<div id="right-wrapper" style={{zIndex : viewAddEvent ? 5 : -1}}>
					<AddTask show={viewAddEvent} hideAddTask={this.hideAddTask.bind(this)} selectedDate={this.state.selectedDate}/>
				</div>
				</div>
				:
				<LoginForm loggedInChange={this.loggedInChange.bind(this)}/>
				}

				<Rodal visible={this.state.visible} onClose={this.hideDetail.bind(this)} className="modal task-detail glow" animation="door" customStyles={{width: '80%',
    height: '80%', borderRadius: 0, borderColor: '#1de9b6', borderWidth: 1, borderStyle : 'solid', background: '#242424', color: '#fff'}}>
                    <div className="text">{eventDetail.text}</div>
                    <div className="tag">{eventDetail.tag} </div>
                    <div className="dateStart"> {moment(eventDetail.dateStart, "YYYY-MM-DD").format("M/DD/YYYY")} </div>
                    <div className="timeStart">{moment(eventDetail.timeStart, "HH:mm").format("h:mm a")}</div>
                    <div className="desc">{eventDetail.desc === "" ? "No description" : eventDetail.desc}</div>
                </Rodal>
			</div>
			);
	}
}
