import React, {Component} from 'react';
import NotificationsWrapper from './NotificationsWrapper.jsx';
import Menu from './Menu.jsx';

const NotificationsMenu = (props)=>{
	return(
		<Menu show={props.showNotifications} toggleMenu={props.toggleNotices} className={"normalFont"}> 
		<div className="menu-header"> Notifications </div>
		<NotificationsWrapper notices={props.notices} showDetail={props.showDetail}/>
		</Menu>
		)
}
export default NotificationsMenu;