import React, {Component} from 'react';
import Menu from './Menu.jsx';
import Notice from './Notice.jsx';

/* Wrap notifications wrapper in Menu Component */
const NotificationsMenu = (props)=>{
	return(
		<Menu show={props.showNotifications} toggleMenu={props.toggleNotices} className={"normalFont"}> 
		<div className="menu-header"> Notifications </div>

		<div className="wrapper" style={{overflow: "scroll"}}>
		{props.notices.sort((a, b)=>{return a.timestamp < b.timestamp}).map((notice)=>{
			return (<Notice key={notice._id} notice={notice} showDetail={props.showDetail}/>)
		})}
		</div>

		</Menu>
		)
}
export default NotificationsMenu;