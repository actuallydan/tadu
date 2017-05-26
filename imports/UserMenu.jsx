import React, {Component} from 'react';
import Menu from './Menu.jsx';

const UserMenu = (props)=>{
	return(
		<Menu show={props.showMenu} toggleMenu={props.toggleMenu} className="menu-slide-in">
			<div className="wrapper">
				<div className="menu-header"> Menu </div>
				<div className="menu-item" onClick={props.loggedInChange}>
				<div className="menu-icon mdi mdi-exit-to-app"></div>
						<div className="menu-text">Logout</div>
				</div>
				</div>
			</Menu>
		)
}
export default UserMenu;