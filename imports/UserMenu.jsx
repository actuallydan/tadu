import React, {Component} from 'react';
import Menu from './Menu.jsx';

/* Left aligned popout menu for general user stuff, uses the Menu component API with modified style and animation */
const UserMenu = (props)=>{
	return(
		<Menu show={props.showMenu} toggleMenu={props.toggleMenu} className="menu-slide-in">
			<div className="wrapper">
				<div className="menu-header"> Menu </div>
				{/* Menu Items go here */}
				<div className="menu-item" onClick={props.loggedInChange}>
				<div className="menu-icon mdi mdi-exit-to-app"></div>
						<div className="menu-text">Logout</div>
				</div>
				</div>
			</Menu>
		)
}
export default UserMenu;