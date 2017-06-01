import React, {Component} from 'react';

/* Pop up menu template */
const Menu = (props)=> {
	const close = (e)=>{
		if(e.target.className === "menu-mask"){
			props.toggleMenu();
		}
	};
	return (
		<div className="menu-mask" style={{display: props.show ? "block" : "none"}} onClick={close}>
		<div className={props.show ? "user-menu animated pulse " + props.className : "bounceOut"}>
			{props.children}
		</div>
		</div>
		);
	};

export default Menu;