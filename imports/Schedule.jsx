import React from 'react';
import TrackerReact from 'meteor/ultimatejs:tracker-react';

export default class Schedule extends TrackerReact(React.Component) {
	constructor(){
		super();
		this.state ={
			subscription: {
				schedules: Meteor.subscribe("schedules")
			}
		}
	}
	modifySchedule(e){
		let coords = e.target.getAttribute("data-coords");
		Meteor.call("modifySchedule", coords, (err, res)=>{
			if(err){
				swal("Whoops!", err, "error");
			} else {
				// console.log("changed schedule");
			}
		})
	}
	render(){
		const hours = ["00:00", "01:00", "02:00", "03:00", "04:00", "05:00", "06:00", "07:00", "08:00", "09:00", "10:00", "11:00", "12:00", "13:00", "14:00", "15:00", "16:00", "17:00", "18:00", "19:00", "20:00", "21:00", "22:00", "23:00"];

		const fakeDaysofWeek = ["Blank", "Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
		mySched = Schedules.findOne();
		return(
			<table id="schedule">
			<thead>
			<tr><td className="header"></td><td>S</td><td>M</td><td>T</td><td>W</td><td>Th</td><td>F</td><td>S</td></tr>
			</thead>
			<tbody>
			{
				mySched === undefined ? "" : 
				hours.map((hour)=> {
					return (<tr key={hour}>
					{
						fakeDaysofWeek.map((day)=>{
							return day === "Blank" ? 
							 <td className="header" key={day + "T" + hour}>{hour}</td>
							 : <td key={day + "T" + hour} 
								 data-coords={day + "T" + hour} 
								 onClick={this.modifySchedule.bind(this)}
								 style={{backgroundColor: mySched.schedule[day][hour] === null ? "#242424" : "#1de9b6"}}
							 >{'\u00A0'}</td>
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
			)
	}
}