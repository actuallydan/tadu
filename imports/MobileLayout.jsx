import React from 'react';
import Calendar from './Calendar.jsx';
import AddTask from './AddTask.jsx';
import TaskDetail from './TaskDetail.jsx';
import TaskSingle from './TaskSingle.jsx';
import Notice from './Notice.jsx';

import SwipeableViews from 'react-swipeable-views';

export default class MobileLayout extends React.Component {
	constructor(props){
		super();
		this.state = {
			index : 0
		};
	}
	/*Triggered when swiping between views (mobile only) */
	onChangeIndex(index, type){
		// console.log(index, type);
		if(type === "end"){
			this.setState({
				index: index
			});
		}
	}
	/* Triggered when manually switching views (with button) */
	changeIndex(e){
		const switcher = {
			"calendar" : 0,
			"addTask" : 1,
		};
		this.setState({
			index: switcher[e]
		});
	}
	render(){
		return(
			<SwipeableViews index={this.state.index}  style={{height: "100vh"}} onSwitching={this.onChangeIndex.bind(this)}>
  				<Calendar 
  				index={this.state.index}
  				filteredTasks={this.props.filteredTasks} 
  				width={this.props.width} 
  				show={true} 
  				showView={this.changeIndex.bind(this)} 
  				selectDate={this.props.selectDate} 
  				showTasks={this.changeIndex.bind(this)} 
  				showDetail={this.props.showDetail.bind(this)}
				selectedDate={this.props.selectedDate}
				loggedInChange={this.props.loggedInChange.bind(this)}
  				/>  				
  				<AddTask 
  				index={this.state.index}
  				show={true} 
  				hideAddTask={this.changeIndex.bind(this)} 
  				selectedDate={this.props.selectedDate}
  				/>
  				</SwipeableViews>
			)
	}
}
