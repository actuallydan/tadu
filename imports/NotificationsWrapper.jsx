import React, {Component} from 'react';
import Notice from './Notice.jsx';

/* Component to list notifications */
const NotificationsWrapper = (props)=>{
			return (
				<div className="wrapper" style={{overflow: "scroll"}}>
				{props.notices.sort((a, b)=>{return a.timestamp < b.timestamp}).map((notice)=>{
					return (<Notice key={notice._id} notice={notice} showDetail={props.showDetail}/>)
				})}
				</div>
				)
		};
export default NotificationsWrapper;