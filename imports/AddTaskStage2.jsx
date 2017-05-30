import React, {Component} from 'react';

export default class AddTaskStage2 extends React.Component {
	submit(e){
		/* Stop the event from triggering a POST request */ 
		e.preventDefault();
		this.props.addTask(this.refs);
	}
	render(){
		return(
			<form onSubmit={this.submit.bind(this)} className={this.props.stage1 ?  "animated slideOutRight" : "animated pulse"}>
			<div className="form-item"><span className='form-item-label'> Title </span><input className="typeable" type="text" ref="newTask" defaultValue={this.props.tagType}  required maxLength="75"/> </div>
			<div className="form-item"><span className='form-item-label'> Date </span><input className="typeable" id="new-task-date" type="date" ref="dateStart" defaultValue={this.props.selectedDate} /> </div>
			<div className="form-item"><span className='form-item-label'> Time </span><input className="typeable" id="new-task-time" type="time" ref="timeStart"  defaultValue={this.props.nowTime} /> </div>

			{this.props.hasBeenOptimized ? <div className="form-item" style={{"color": "#1de9b6", "fontSize" : "0.6em", "textAlign" : "center"}}><span className='form-item-label mdi mdi-alert-circle'></span><span> {'\u00A0'} This date and time has been optimized for you!</span> </div> : ""}


			<div className="form-item"> Set Alarm? 
			<div className="checkbox">
			<input id="has-alarm-toggle" type="checkbox" readOnly="" defaultChecked={this.props.showAlarmVisible}ref="hasAlarm" onClick={this.props.showAlarm.bind(this)} />
			<label htmlFor="has-alarm-toggle"></label>
			</div>
			</div>
			<div id="alarm-radio-wrapper" className={"form-item " + (this.props.showAlarmVisible ? "" : "hidden")}> 
			<div className="radio-option-wrapper">
			<label className="radio" htmlFor="alarm-option-low">
			<input id="alarm-option-low" ref="5min" type="radio" name="alarm" value="5min" defaultChecked={true}/> 
			<span className="outer"><span className="inner"></span></span><div className="radio-option-label-text">5 min</div>
			</label>
			</div>	
			<div className="radio-option-wrapper">
			<label className="radio" htmlFor="alarm-option-med">
			<input id="alarm-option-med" ref="30min" type="radio" name="alarm" value="30min" /> <span className="outer">
			<span className="inner"></span></span><div className="radio-option-label-text">30 min</div>
			</label>
			</div>	
			<div className="radio-option-wrapper">
			<label className="radio" htmlFor="alarm-option-high">
			<input id="alarm-option-high" ref="1hour" type="radio" name="alarm" value="1hour" /> <span className="outer">
			<span className="inner"></span></span><div className="radio-option-label-text">1 hour</div>
			</label>
			</div>	
			<div className="radio-option-wrapper">
			<label className="radio" htmlFor="alarm-option-critical">
			<input id="alarm-option-critical" ref="1day" type="radio" name="alarm" value="1day" /> <span className="outer">
			<span className="inner"></span></span><div className="radio-option-label-text"> 1 day</div>
			</label>
			</div>
			</div>

			<div className="form-item desc"><textarea type="text" ref="desc" placeholder="Description" maxLength="300"></textarea> </div>

			<div  className="form-item"><button type="submit" className="button">Add Task</button> </div>
			</form>
			)
	}
}