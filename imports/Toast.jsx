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
			width: "55%",
			color: "#FFF",
			textOverflow: "ellipsis",
		    overflow: "hidden",
		    wordWrap: "break-word",
		    whiteSpace: "nowrap",
		    paddingRight: "0.2em",
		    verticalAlign: "top"
		},
		time : {
			display: "inline-block",
			width: "25%",
			color: "#FFF",
			textAlign: "right"
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
