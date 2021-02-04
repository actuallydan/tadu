import React from 'react';
import moment from 'moment';
import {toast} from 'react-toastify';
import Toast from './Toast.jsx';

export default class TaskDetail extends React.Component{
	constructor(props){
		super();
		this.state = {
			showAlarmVisible: false,
			sharingWith: [],
			userList: [],
			userListIndex: 0,
			creator: null,
			showStart: true,
			showEnd: false,
		}
	}
	showStart(){
		this.setState({
			showStart: !this.state.showStart
		})
	}
	showEnd(){
		this.setState({
			showEnd: !this.state.showEnd
		})
	}
	componentWillReceiveProps(nextProps){
		if(this.props.taskDetail !== nextProps.taskDetail){
			/* If this task was not made by the current user get the creator's name and add them to state */
			if(nextProps.taskDetail.userId !== Meteor.userId() && nextProps.taskDetail.userId !== undefined){
				Meteor.call("findOneUser", nextProps.taskDetail.userId, (err, res)=>{
					if(err){
						swal("Awkward...", "There was an error getting this task: " + err, "error");
					} else {
						this.setState({
							sharingWith : nextProps.taskDetail.sharingWith !== undefined ? nextProps.taskDetail.sharingWith : [] ,
							creator: res,
							showAlarmVisible: nextProps.taskDetail.alarm !== null
						})
					}
				})
			} else {
				this.setState({
					sharingWith : nextProps.taskDetail.sharingWith !== undefined ? nextProps.taskDetail.sharingWith : [] ,
					showAlarmVisible: nextProps.taskDetail.alarm !== null
				})
			}
		}
	}
	findUsers(){
		let search = document.getElementById("find-user-share-text").value.trim();
		if(search.length > 0){
			Meteor.apply("findUsers", [search, Meteor.user()], (err, res)=>{
				if(err){
					swal("Sorry!", "There was an error commucicatring with the server: " + err, "error");
				} else if(res !== null) {
					res = res.filter((user)=>{
						return this.state.sharingWith.findIndex((existingUser)=>{ return existingUser._id === user._id}) === -1
					});
					this.setState({userList : res});
				}
			})
		} else {
			this.setState({userList : []});
		}
	}
	addUser(e){
		let addUser = {
			_id: e.target.getAttribute("data-userId"),
			username: e.target.getAttribute("data-username")
		};
		let newSharingWith = this.state.sharingWith;
		if(newSharingWith.findIndex((existingUser)=>{ return existingUser._id === addUser._id}) === -1){
			let newSharingWith = this.state.sharingWith;
			newSharingWith.push(addUser);
			this.setState({
				sharingWith : newSharingWith,
				userList : []
			}, ()=>{
				/* Clear search when done */
				document.getElementById("find-user-share-text").value = "";

		});
		}
	}
	removeUser(e){
		let removeUser = e.target.getAttribute("data-id");
		let sharArr = this.state.sharingWith;

		const index = sharArr.findIndex((user)=>{
			return user._id === removeUser;
		});
		sharArr.splice(index, 1);
		this.setState({
			sharingWith : sharArr
		});
	}
	changeUser(amt){
		this.setState({
			userListIndex : this.state.userListIndex + amt
		});
	}
	selectNextFromList(e){
		// attach to id=find-user-share-text onKeyDown={this.selectNextFromList.bind(this)}
		if(e.keyCode === 40){
			// Select next user
			if(this.state.userList.length > 0 && this.state.userListIndex < this.state.userList.length - 1){
				this.changeUser(1);
			}
			e.preventDefault();
		} else if(e.keyCode === 38){
			// Select previous user
			if(this.state.userList.length > 0 && this.state.userListIndex > 0){
				this.changeUser(-1);
			}
			e.preventDefault();

		} else if(e.keyCode === 13){
			// Enter, add user
			if(this.state.userList.length > 0){
				const firstUser = {
					_id: this.state.userList[this.state.userListIndex]._id,
					username: this.state.userList[this.state.userListIndex].username
				};
				this.addUserWithEnter(firstUser);
			}
			e.preventDefault();
		}
	}
	addUserWithEnter(user){
		let newSharingWith = this.state.sharingWith;
		newSharingWith.push(user);
		this.setState({
			sharingWith : newSharingWith,
			userList : [],
			userListIndex: 0
		}, ()=>{
			/* Clear search when done */
			document.getElementById("find-user-share-text").value = "";
		});
	}
	editTask(e){
		e.preventDefault();
		/* Prevent the user from modifying the task if they aren't the progenitor */
		if(this.props.taskDetail.userId !== Meteor.userId()){
			return false;
		}
		const old = this.props.taskDetail;

		let alarm = null;
		if(this.refs.hasAlarm.checked){
			if(this.refs["5min"].checked){
				alarm = 5;
			} else if(this.refs["30min"].checked){
				alarm = 30;
			} else if(this.refs["1hour"].checked){
				alarm = 60;
			} else if(this.refs["1day"].checked){
				alarm = 1440;
			} else {
				alarm = 5;
			}
		}
		const updatedTask = {
			_id: old._id,
			text: this.refs.title.value.trim(),
			dateStart : this.refs.dateStart.value.trim() !== "" ? this.refs.dateStart.value.trim() : this.refs.dateEnd.value.trim() !== null ? this.refs.dateEnd.value.trim() : moment().format("YYYY-MM-DD"),
			timeStart : this.refs.timeStart.value.trim() !== "" ? this.refs.timeStart.value.trim() : this.refs.timeEnd.value.trim() !== null ? moment(this.refs.timeEnd.value.trim(), "HH:mm").subtract(1, 'hours').format("HH:mm") : moment().format("HH:mm"),
			dateEnd: this.refs.dateEnd.value.trim() !== "" ? this.refs.dateEnd.value.trim() : this.refs.dateStart.value.trim() !== null ? this.refs.dateStart.value.trim() : moment().format("YYYY-MM-DD"),
			timeEnd: this.refs.timeEnd.value.trim() !== "" ? this.refs.timeEnd.value.trim() : this.refs.timeStart.value.trim() !== null ? moment(this.refs.timeStart.value.trim(), "HH:mm").add(1, 'hours').format("HH:mm") : moment().add(1, 'hours').format("HH:mm"),
			tag:  old.tag,
			userId:  old.userId,
			desc: this.refs.desc.value.trim(),
			alarm: alarm,
			sharingWith: this.state.sharingWith === undefined ? [] : this.state.sharingWith 
		};
		updatedTask.timeUTC = alarm !== null ? moment(updatedTask.dateStart + "T" + updatedTask.timeStart).utc().subtract(alarm, 'minutes').format().substring(0, 16) : null;
		updatedTask.timeUTCEnd = moment(updatedTask.dateEnd + "T" + updatedTask.timeEnd).utc().format().substring(0, 16);;

		Meteor.apply("updateTask", [updatedTask, Meteor.user()], (err)=>{
			if(err){
				swal("Sorry!", "There was an error updating your task, please try again later", "error");
			} else {
				toast(<Toast onClick={toast.dismiss}  iconClass={"mdi-check"} text={"Task Updated"} secondary={""}/>, {autoClose: 2000});
				this.setState({
					showAlarmVisible : false
				})
				this.props.closeDetail();
			}
		});
	}
	componentDidUpdate(){
		if(this.props.taskDetail !== null && this.props.taskDetail !== undefined ){
			document.getElementById("edit-task-title").value = this.props.taskDetail.text;
			document.getElementById("edit-task-date").value = this.props.taskDetail.dateStart;
			document.getElementById("edit-task-time").value = this.props.taskDetail.timeStart;
			document.getElementById("edit-task-end-date").value = this.props.taskDetail.dateEnd;
			document.getElementById("edit-task-end-time").value = this.props.taskDetail.timeEnd;
			document.getElementById("edit-task-desc").value = this.props.taskDetail.desc !== null ? this.props.taskDetail.desc : "";
			document.getElementById("has-alarm-toggle").checked = this.state.showAlarmVisible;
			this.state.showAlarmVisible ? this.clicker(this.props.taskDetail.alarm) : "";
		}
	}
	clicker(alarm){
		switch(alarm){
			case 5 : 
			document.getElementById("edit-alarm-option-low").checked = true;
			break;
			case 30 : 
			document.getElementById("edit-alarm-option-med").checked = true;
			break;
			case 60 : 
			document.getElementById("edit-alarm-option-high").checked = true;
			break;
			case 1440 : 
			document.getElementById("edit-alarm-option-critical").checked = true;
			break;
		}
	}
	componentDidMount(){
		if(this.props.taskDetail !== null){
			this.setState({
				showAlarmVisible: this.props.taskDetail.alarm === null ? false : true,
				sharingWith : this.props.taskDetail.sharingWith !== undefined ? this.props.taskDetail.sharingWith : []
			}, ()=>{
				this.state.showAlarmVisible ? this.clicker(this.props.taskDetail.alarm) : "";
			});
		}
	}
	showAlarm(){
		this.setState({
			"showAlarmVisible" : !this.state.showAlarmVisible
		});
	}
	render(){
		return(
			<form autoComplete="off" onSubmit={this.editTask.bind(this)}>
			<div id="update-task-header">Update Task</div>
			<div className="edit-item">
			<div className='text'> Title </div>
			<input className="" id="edit-task-title" type="text" ref="title" defaultValue={this.props.taskDetail.text}  required maxLength="75"/>
			</div>

			<div className="edit-item" onClick={this.showStart.bind(this)} style={{height: '1em', minHeight: 0,lineHeight: '0.5em',backgroundColor: '#1de9b6',color: '#242424', cursor: "pointer"}}>
			<div style={{textAlign: 'center', width: '100%', lineHeight: '100%', color: "#242424"}}> Start </div>
			<div id="edit-task-show-start" className={this.state.showStart ? "mdi mdi-chevron-up" : "mdi mdi-chevron-down"}></div>
			</div>

			<div className={this.state.showStart ? "edit-item" : "edit-item hidden"}>
			<div className='dateStart'> Date </div>
			<input className="typeable" id="edit-task-date" type="date" ref="dateStart" /> 
			</div>
			<div className={this.state.showStart ? "edit-item" : "edit-item hidden"}>
			<div className='timeStart'> Time </div>
			<input className="typeable" id="edit-task-time" type="time" ref="timeStart"  /> 

			</div>
			<div className="edit-item" onClick={this.showEnd.bind(this)} style={{height: '1em', minHeight: 0,lineHeight: '0.5em',backgroundColor: '#1de9b6',color: '#242424', cursor: "pointer"}}>
			<div style={{textAlign: 'center', width: '100%', lineHeight: '100%', color: "#242424"}}> End </div>
			<div id="edit-task-show-end" className={this.state.showEnd ? "mdi mdi-chevron-up" : "mdi mdi-chevron-down"}></div>
			</div>

			<div className={this.state.showEnd ? "edit-item" : "edit-item hidden"}>
			<div className='dateStart'> Date </div>
			<input className="typeable" id="edit-task-end-date" type="date" ref="dateEnd" /> 
			</div>
			<div className={this.state.showEnd ? "edit-item" : "edit-item hidden"}>
			<div className='timeStart'> Time </div>
			<input className="typeable" id="edit-task-end-time" type="time" ref="timeEnd"  /> 
			</div>
			<div className="form-item" style={{borderBottom : "1px solid #424242", padding: "0.5em", lineHeight: "2em", 'textAlign' : 'left'}}>
			<div style={{width: window.innerWidth > 992 ? '15%' : "30%", display: "inline-block", fontSize: '1em'}}>Set Alarm? </div>
			<div className="checkbox" >
			<input id="has-alarm-toggle" type="checkbox" ref="hasAlarm" onClick={this.showAlarm.bind(this)} />
			<label htmlFor="has-alarm-toggle"></label>
			</div>
			</div>
			<div id="alarm-radio-wrapper" className={"form-item " + (this.state.showAlarmVisible ? "" : "hidden")} style={{borderBottom : "1px solid #424242", padding: "1em 0.5em 0.5em 0"}}> 
			<div className="radio-option-wrapper">
			<label className="radio" htmlFor="edit-alarm-option-low">
			<input id="edit-alarm-option-low" ref="5min" type="radio" name="alarm" value="5min" defaultChecked={this.props.taskDetail.alarm === 5}/> 
			<span className="outer"><span className="inner"></span></span><div className="radio-option-label-text">5 min</div>
			</label>
			</div>	
			<div className="radio-option-wrapper">
			<label className="radio" htmlFor="edit-alarm-option-med">
			<input id="edit-alarm-option-med" ref="30min" type="radio" name="alarm" value="30min" defaultChecked={this.props.taskDetail.alarm === 30}/> <span className="outer">
			<span className="inner"></span></span><div className="radio-option-label-text">30 min</div>
			</label>
			</div>	
			<div className="radio-option-wrapper">
			<label className="radio" htmlFor="edit-alarm-option-high">
			<input id="edit-alarm-option-high" ref="1hour" type="radio" name="alarm" value="1hour" defaultChecked={this.props.taskDetail.alarm === 60}/> <span className="outer">
			<span className="inner"></span></span><div className="radio-option-label-text">1 hour</div>
			</label>
			</div>	
			<div className="radio-option-wrapper">
			<label className="radio" htmlFor="edit-alarm-option-critical">
			<input id="edit-alarm-option-critical" ref="1day" type="radio" name="alarm" value="1day" defaultChecked={this.props.taskDetail.alarm === 1440}/> <span className="outer">
			<span className="inner"></span></span><div className="radio-option-label-text"> 1 day</div>
			</label>
			</div>
			</div>

		{/* If The user is the creator of this task let them search for users to add otherwise display the User who created it */}
		{this.props.taskDetail.userId === Meteor.userId() ? 
			<div className="form-item"><span className='form-item-label'> Share with: </span><input autoComplete="off" id="find-user-share-text" onChange={this.findUsers.bind(this)} onKeyDown={this.selectNextFromList.bind(this)}  className="typeable" type="text" maxLength="75" placeholder="Enter a username"/> </div>
			:
			<div className="form-item"><span className='form-item-label'> Creator: </span>{this.state.creator}</div>
		}
		<div style={{display: this.state.userList.length > 0 ? "block" : "none"}} id="share-with-user-list" >
		{this.state.userList.length === 0 ? "" : this.state.userList.filter((user)=>{ return this.state.sharingWith.findIndex((obj)=>{ return obj.username === user.username }) === -1 }).map((user)=>{
			return (<div className="share-search-result" key={user._id} data-username={user.username} data-userId={user._id} onClick={this.addUser.bind(this)} style={this.state.userList[this.state.userListIndex]._id === user._id ? {backgroundColor: '#1de9b6', 'color': '#242424'} : {display: 'normal'}}>{user.username}</div>)
		})}
		</div>
		<div id="sharing-with-list">
		{this.state.sharingWith === undefined || this.state.sharingWith.length === 0 ? "" : this.state.sharingWith.map((user)=>{
			return(
				<div className="share-tag" key={user._id}><span className="share-tag-name">{user.username}</span><span style={{display: this.props.taskDetail.userId === Meteor.userId() ? "inherit" : "none"}} className="share-tag-remove mdi mdi-close" data-id={user._id} onClick={this.removeUser.bind(this)}></span></div>
				)
		})}
		</div>

		<div className="desc">
		<textarea type="text" ref="desc" id="edit-task-desc" placeholder="Description" maxLength="300" defaultValue={this.props.taskDetail.desc}></textarea> 
		</div>

		<div  className="edit-item" style={{display : this.props.taskDetail.userId === Meteor.userId() ? "inherit" : "none"}}>
		<button type="submit" className="button">Update Task</button> 
		</div>
		</form>
		);
}
}
