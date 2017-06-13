import React, {Component} from 'react';
import moment from 'moment';

export default class AddTaskStage2 extends React.Component {
	submit(e){
		/* Stop the event from triggering a POST request */ 
		e.preventDefault();
		this.props.addTask(this.refs);
	}
	findUsers(){	
		this.props.findUsers();
	}
	showStart(){
		this.props.toggleShowStart();
	}
	showEnd(){
		this.props.toggleShowEnd();
	}
	getNextBestTime(num){
		this.props.changeBestTime(num);
	}

	// selectNextFromList(e){

		// attach to id=find-user-share-text onKeyDown={this.selectNextFromList.bind(this)}
	// 	if(e.keyCode === 40){
	// 		// Select next user
	// 		this.props.changeUser
	// 	} else if(e.keyCode === 38){
	// 		// Select previous user
	// 	} else if(){
	// 		// Enter, add user
	// 	} else {
	// 		e.preventDefault();
	// 	}
	// 	// let usersInList = document.getElementById('share-with-user-list').children;
	// }
	render(){
		let bestDate = moment(this.props.selectedDate, "YYYY-MM-DD").format("YYYY-MM-DDTHH:mm")
		if(this.props.hasBeenOptimized){
			/* If we're allowing the user to optimize this task, get the first best day/time object, 
			figure out the date from props.selectedDate, then create a moment around that object in best date */
			let currBestTime = this.props.bestTimes[this.props.bestTimeIndex];
			let daysFromToday = currBestTime.day - parseInt(moment().format('e')) >= 0 ? currBestTime.day - parseInt(moment().format('e')) : 7 + (currBestTime.day - parseInt(moment().format('e')));
			bestDate = moment(this.props.selectedDate + "T" + currBestTime.time, "YYYY-MM-DDTHH:mm").add(daysFromToday, "days").format("YYYY-MM-DDTHH:mm");
			let bestStartDateFormatted = bestDate.substring(0, 10);
			let bestStarttTimeFormatted = bestDate.substring(11, 16);
			let bestEndDateFormatted = bestDate.substring(0, 10);
			let bestEndTimeFormatted = moment(bestDate, "YYYY-MM-DDTHH:mm").add(1, 'hour').format("HH:mm");
		}
		return(
			<form autoComplete="off" onSubmit={this.submit.bind(this)} className={this.props.stage1 ?  "animated slideOutRight" : "animated pulse"}>
			<div className="form-item"><span className='form-item-label'> Title </span><input className="typeable" type="text" ref="newTask" defaultValue={this.props.tagType}  required maxLength="75"/> </div>
			<div className="form-item" style={{minHeight: 0, lineHeight: '0.5em'}}><div style={{textAlign: 'center', width: '100%'}}>Start</div><div id="add-task-show-start" onClick={this.showStart.bind(this)} className={this.props.showStart ? "mdi mdi-chevron-up" : "mdi mdi-chevron-down"}></div></div>
			
			
			<div className={this.props.showStart ? "form-item" : "form-item hidden"}><span className='form-item-label'> Date </span><input className="typeable" id="new-task-date" type="date" ref="dateStart" defaultValue={this.props.selectedDate} /> </div>
			<div className={this.props.showStart ? "form-item" : "form-item hidden"}><span className='form-item-label'> Time </span><input className="typeable" id="new-task-time" type="time" ref="timeStart"  defaultValue={this.props.now} /> </div>

			{this.props.hasBeenOptimized ? 
				<div className="form-item" style={{"color": "#1de9b6", "fontSize" : "0.6em", "textAlign" : "center"}}>
				<button onClick={(e)=>{e.preventDefault(); this.getNextBestTime(-1)}} id="get-next-best-time-buttons" className={this.props.bestTimeIndex > 0 ? 'form-item-label mdi mdi-chevron-left' : 'invisible'}></button>
				<div onClick={(e)=>{e.preventDefault(); this.getNextBestTime(0)}} id="get-next-best-time" style={{width: "70%", display: "inline-block"}}> Best Time: {moment(bestDate, "YYYY-MM-DDTHH:mm").format("M/DD/YY h:mm a")}</div> 
				<button onClick={(e)=>{e.preventDefault(); this.getNextBestTime(1)}} id="get-next-best-time-buttons" className={this.props.bestTimeIndex < this.props.bestTimes.length - 1 ? 'form-item-label mdi mdi-chevron-right' : 'invisible'}></button>

				</div> 
				: ""}
				<div className="form-item" style={{minHeight: 0,lineHeight: '0.5em'}}><div style={{textAlign: 'center', width: '100%'}}>End</div><div id="add-task-show-end" onClick={this.showEnd.bind(this)} className={this.props.showEnd ? "mdi mdi-chevron-up" : "mdi mdi-chevron-down"}></div></div>

				<div className={this.props.showEnd ? "form-item" : "form-item hidden"}><span className='form-item-label'> Date </span><input className="typeable" id="new-task-end-date" type="date" ref="dateEnd" defaultValue={this.props.selectedDate} /> </div>
				<div className={this.props.showEnd ? "form-item" : "form-item hidden"}><span className='form-item-label'> Time </span><input className="typeable" id="new-task-end-time" type="time" ref="timeEnd"  defaultValue={moment(this.props.now, "HH:mm").add(1, "hours").format("HH:mm")} /> </div>

				<div className="form-item"> Set Alarm? 
				<div className="checkbox">
				<input id="has-alarm-toggle" type="checkbox" readOnly="" defaultChecked={this.props.showAlarmVisible}ref="hasAlarm" onClick={this.props.showAlarm.bind(this)} />
				<label htmlFor="has-alarm-toggle"></label>
				</div>
				</div>
				<div id="alarm-radio-wrapper" className={"form-item " + (this.props.showAlarmVisible ? "" : "hidden")}> 
				<div className="radio-option-wrapper">
				<label className="radio" htmlFor="alarm-option-low">
				<input id="alarm-option-low" ref="5min" type="radio" name="alarm" value="5min" defaultChecked={true} onChange={this.props.changeAlarm.bind(this)}/> 
				<span className="outer"><span className="inner"></span></span><div className="radio-option-label-text">5 min</div>
				</label>
				</div>	
				<div className="radio-option-wrapper">
				<label className="radio" htmlFor="alarm-option-med">
				<input id="alarm-option-med" ref="30min" type="radio" name="alarm" value="30min" onChange={this.props.changeAlarm.bind(this)}/> <span className="outer">
				<span className="inner"></span></span><div className="radio-option-label-text">30 min</div>
				</label>
				</div>	
				<div className="radio-option-wrapper">
				<label className="radio" htmlFor="alarm-option-high">
				<input id="alarm-option-high" ref="1hour" type="radio" name="alarm" value="1hour" onChange={this.props.changeAlarm.bind(this)}/> <span className="outer">
				<span className="inner"></span></span><div className="radio-option-label-text">1 hour</div>
				</label>
				</div>	
				<div className="radio-option-wrapper">
				<label className="radio" htmlFor="alarm-option-critical">
				<input id="alarm-option-critical" ref="1day" type="radio" name="alarm" value="1day" onChange={this.props.changeAlarm.bind(this)}/> <span className="outer">
				<span className="inner"></span></span><div className="radio-option-label-text"> 1 day</div>
				</label>
				</div>
				</div>

				<div className="form-item"><span className='form-item-label'> Share with: </span><input autoComplete="off" id="find-user-share-text" onChange={this.findUsers.bind(this)} className="typeable" type="text" maxLength="75" placeholder="Enter a username"/> </div>
				<div style={{display: this.props.userList.length > 0 ? "block" : "none"}} id="share-with-user-list">
				{this.props.userList.length === 0 ? "" : this.props.userList.filter((user)=>{ return this.props.sharingWith.findIndex((obj)=>{ return obj.username === user.username }) === -1 }).map((user)=>{
					return (<div className="share-search-result" key={user._id} data-username={user.username} data-userId={user._id} onClick={this.props.addUser.bind(this)}>
						{user.profile.pic !== undefined && user.profile.pic !== null && user.profile.pic !== "" ?
						<div className="profilePic" style={{background: 'url(' + user.profile.pic + ') no-repeat center', marginRight: '0.5em', display: 'inline-block', backgroundSize: 'cover', width: '1em', height: '1em', borderRadius: '100%', 'cursor': 'pointer'}}></div>
						:
						<div className="profilePic mdi mdi-account-circle" style={{width: '1em', display: 'inline-block', fontSize : '1em' ,'cursor': 'pointer', marginRight: '0.5em'}}></div>
					}
					<div style={{width: '50%', display: 'inline'}}>{user.username}</div>
					</div>)
				})}
				</div>
				<div id="sharing-with-list">
				{this.props.sharingWith.length === 0 ? "" : this.props.sharingWith.map((user)=>{
					return(
						<div className="share-tag" key={user._id}><span className="share-tag-name">{user.username}</span><span className="share-tag-remove mdi mdi-close" data-id={user._id} onClick={this.props.removeUser.bind(this)}></span></div>
						)
				})}
				</div>
				<div className="form-item desc"><textarea type="text" ref="desc" placeholder="Description" maxLength="300"></textarea> </div>

				<div  className="form-item"><button type="submit" className="button">Add Task</button> </div>
				</form>
				)
}
}