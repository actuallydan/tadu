import React from 'react';

export default class TopNav extends React.Component {
	constructor(props) {
    	super(props);
   		this.state = {activeView : 'calendar'};
	}
	showCal(){
		this.setState({activeView : 'calendar'});
		this.props.showView('calendar');
		// change all colors to normal
		document.getElementById("showDash").style.color = "#fff";
	}
	showTasks(){
		this.setState({activeView : 'tasks'});
		this.props.showView('tasksList');
		// change all colors to normal
		document.getElementById("showTasks").style.color = "#fff";
	}
	showAddTask(){
		this.setState({activeView : 'addTask'});
		this.props.showView('addTask');
		// change all colors to normal
		document.getElementById("showNewTask").style.color = "#fff";

	}

	render(){
		return(
				<nav className='nav hide-on-large hide-on-med' >
					<div id="mobile-nav-tabs" className="tabs" > 
				        <div className="tab" id="showTasks">
				            <a onClick={this.showTasks.bind(this)} className="mobile-nav-btns">
				              <i className="mdi mdi-sort-variant" aria-hidden="true"></i>
				            </a>
				          </div>
				          <div className="tab" id="showDash">
				            <a onClick={this.showCal.bind(this)} className="mobile-nav-btns active">
				              <i className="mdi mdi-calendar" aria-hidden="true"></i>
				            </a>
				          </div>
				          <div className="tab" id="showNewTask">
				            <a onClick={this.showAddTask.bind(this)} className="mobile-nav-btns">
				              <i className="mdi mdi-plus" aria-hidden="true"></i>
				            </a>
				          </div>	
				    </div>
				</nav>

		);
	}
}