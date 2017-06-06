import React, {Component} from 'react';
import moment from 'moment';

/* Display an individual notice in the notification list */
const Notice = (props)=> {
	const noticeType = {
		'taskAlert' :'mdi-alarm-check',
		'message' : 'mdi-message-outline',
		'taskShare' : 'mdi-account-multiple'
	};
	const showDetail = ()=>{
		/* If The Notice is a task alarm let the user see the task in detail */
		if(props.notice.type === 'taskAlert'){
			props.showDetail(props.notice.data);
		}
	}
	return (
		<div className="menu-item" onClick={showDetail}>
		<div className={"notice-icon mdi " + noticeType[props.notice.type]}></div>
		<div className="notice-text">{props.notice.data.text}</div>
		<div className="notice-time">{moment(props.notice.data.timeStart, "HH:mm").format("h:mm a")}</div>
		</div>
		);
};
export default Notice;