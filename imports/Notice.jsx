import React from 'react';
import moment from 'moment';

const Notice = (props)=> {
	const noticeType = {
		'taskAlert' :'mdi-alarm-check',
		'message' : 'mdi-message-outline',
	};
	return (
		<div className="notice">
		<div className={"notice-icon mdi " + noticeType[props.data.type]}></div>
		<div className="notice-text">{props.data.data.text}</div>
		<div className="notice-time">{moment(props.data.data.timeStart, "HH:mm").format("h:mm a")}</div>
		</div>
	);
};
export default Notice;