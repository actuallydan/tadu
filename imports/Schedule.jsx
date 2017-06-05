import React from 'react';
import TrackerReact from 'meteor/ultimatejs:tracker-react';
import moment from 'moment';
import Loader from './Loader.jsx';


export default class Schedule extends TrackerReact(React.Component) {
	constructor(){
		super();
		
	}
	componentDidMount(){
		if(Meteor.user().profile.tut.schedule === false){
			swal({
				title:"Your Schedule",
				text: "Any hours reserved for things you don't need to be reminded of (work, classes, sleep) can be set to tell Tadu not to schedule tasks. Lit-up blocks are 'busy' hours",
				type: "success", 
				closeOnConfirm: true, 
			},
			()=>{
				Meteor.call("toggleCompleteTour", "schedule")
			}) 
		}
		}
		modifySchedule(e){
			e.target.parentElement.style.backgroundColor = "transparent" ? "#1de9b6" : "transparent";
			let coords = e.target.getAttribute("data-coords");
			Meteor.call("modifySchedule", coords, (err, res)=>{
				if(err){
					swal("Whoops!", err, "error");
				} 
			})
		}
		render(){
			const hours = ["00:00", "01:00", "02:00", "03:00", "04:00", "05:00", "06:00", "07:00", "08:00", "09:00", "10:00", "11:00", "12:00", "13:00", "14:00", "15:00", "16:00", "17:00", "18:00", "19:00", "20:00", "21:00", "22:00", "23:00"];

			const fakeDaysofWeek = ["Blank", "Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
			mySched = Schedules.findOne();
			const styles = {
				month: {
					width: window.innerWidth > 1400 ? "60%" : window.innerWidth > 992 ? "71%" : "100%",
					position: "fixed",
					display: "inline-flex",
					backgroundColor: " rgba(24, 24, 24, 0.2)",
					fontSize : "1.5em",
					top: "calc(100vh / 13 * 2)",
					zIndex: 4,
					height: "calc(100vh / 13)",
					lineHeight : "calc(100vh / 13)"
				},
				day: {
					color: "#1de9b6",
					textAlign: "center",
					width: "calc((100% - 7px) / 8)"
				}
			};
			return (
				<div className="wrapper">
				<div style={styles.month} id="schedule-header">
				<div className="header" style={styles.day}></div><div style={styles.day}>S</div><div style={styles.day}>M</div><div style={styles.day}>T</div><div style={styles.day}>W</div><div style={styles.day}>Th</div><div style={styles.day}>F</div><div style={styles.day}>S</div>
				</div>
				<table id="schedule" className="animated fadeIn">
				<tbody style={{"marginTop" : "1em"}} id="schedule-body">
				{
					mySched === undefined ? "" : 
					hours.map((hour)=> {
						return (<tr key={hour} id={"schedule-row-"+hour.substring(0,2)} style={{color: "#424242"}}>
						{
							fakeDaysofWeek.map((day)=>{
								return day === "Blank" ? 
								<td className="header" key={day + "T" + hour}>{moment(hour, "HH:mm").format("h a")}</td>
								: <td key={day + "T" + hour} 

								style={{backgroundColor: mySched.schedule[day][hour] === null ? "transparent" : "#1de9b6"}}
								><div draggable="true"
								data-coords={day + "T" + hour} 
								onClick={this.modifySchedule.bind(this)}
								onDragEnter={this.modifySchedule.bind(this)}>{'\u00A0'}</div></td>
							}
							)
						}
						</tr>
						)
					}
					)
				}
				</tbody>
				</table>
				</div>)
		}
	}