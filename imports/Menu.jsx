import React, {Component} from 'react';

const Menu = (props)=> {
	const close = (e)=>{
		if(e.target.className === "menu-mask"){
			props.toggleMenu();
		}
	};

	return (
		<div className="menu-mask" style={{display: props.show ? "block" : "none"}} onClick={close}>
		<div id="user-menu" className={props.show ? "animated bounceIn " + props.className : "bounceOut"}>
			{props.children}
		</div>
		</div>
		);
	};

export default Menu;