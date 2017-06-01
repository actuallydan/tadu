import React, {Component} from 'react';

/* Default Component for Toast, supplied to toastify 'toast' method when a user does a minor action */
const Toast = (props) =>{
	const toast = {
		item: {
			fontSize: "1.3em",
		    lineHeight: "200%",
		    cursor: "pointer",
		},
		icon : {
			display: "inline-block",
			width: "15%",
			color: "#FFF",
			textAlign: "center",
		},
		text : {
			display: "inline-block",
			width: "60%",
			color: "#FFF",
		},
		time : {
			display: "inline-block",
			width: "25%",
			color: "#FFF",
		}
	}
	return (
		<div className="toast-item" onClick={props.onClick}>
		<div className={"toast-icon mdi " + props.iconClass} style={toast.icon}></div>
		<div className="toast-text"  style={toast.text}>{props.text}</div>
		<div className="toast-time" style={toast.time}>{props.secondary}</div>
		</div>
		)
}
export default Toast;
