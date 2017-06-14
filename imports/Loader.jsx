import React, {Component} from 'react';

const Loader = (props)=>{
	return(
		<div className="animated fadeIn" style={{width: props.width !== undefined ? props.width : "100%", height: "100%", position: "fixed", top: 0, backgroundColor: "#242424", color: "#FFF"}}>
		<div className="loader-inner ball-grid-pulse" style={{position: "relative", top: "calc(50% - 4.5em)", margin: "auto", width: '90px'}} >
		<div style={{animationName: 'ball-grid-pulse'}}></div>
		<div style={{animationName: 'ball-grid-pulse'}}></div>
		<div style={{animationName: 'ball-grid-pulse'}}></div>
		<div style={{animationName: 'ball-grid-pulse'}}></div>
		<div style={{animationName: 'ball-grid-pulse'}}></div>
		<div style={{animationName: 'ball-grid-pulse'}}></div>
		<div style={{animationName: 'ball-grid-pulse'}}></div>
		<div style={{animationName: 'ball-grid-pulse'}}></div>
		<div style={{animationName: 'ball-grid-pulse'}}></div>
		<div style={{animationName: 'ball-grid-pulse'}}></div>
		<div style={{animationName: 'ball-grid-pulse'}}></div>
		<div style={{animationName: 'ball-grid-pulse'}}></div>
		<div style={{animationName: 'ball-grid-pulse'}}></div>
		<div style={{animationName: 'ball-grid-pulse'}}></div>
		<div style={{animationName: 'ball-grid-pulse'}}></div>
		<div style={{animationName: 'ball-grid-pulse'}}></div>
		
		</div>
		</div>
		);
};
export default Loader;