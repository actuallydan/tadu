import React from 'react';
import Calendar from './Calendar.jsx';
import Tasks from './Tasks.jsx';
import AddTask from './AddTask.jsx';
import TaskDetail from './TaskDetail.jsx';
import TaskSingle from './TaskSingle.jsx';
import Notice from './Notice.jsx';

import Joyride from 'react-joyride';
import	'react-joyride/lib/react-joyride-compiled.css';
const DesktopLayout = (props)=>{
	const callback = ()=>{
		console.log(this.type);
	};
		return(
			<div className="wrapper animated fadeIn">
			<Tasks 
				filteredTasks={props.filteredTasks} 
				show={props.viewTaskList} 
				showDetail={props.showDetail} 
				selectedDate={props.selectedDate} 
				showCal={props.showView}
			/>
			<Calendar 
			filteredTasks={props.filteredTasks} 
			width={props.width} 
			show={true} 
			showView={props.showView} 
			selectDate={props.selectDate} 
			showDetail={props.showDetail}
			selectedDate={props.selectedDate}
			loggedInChange={props.loggedInChange}
			/>
			<AddTask 
			show={props.viewAddTask} 
			hideAddTask={props.hideAddTask} 
			selectedDate={props.selectedDate}
			/> 
			 <Joyride
        ref="joyride"
        steps={steps}
        run={true}
        autoStart={true}
        debug={true}
        callback={callback}
        holePadding={0}
        showBackButton={true}
        />
			</div>
			);

};
export default DesktopLayout;

const steps = [
{title: "Welcome!",
text: "Thanks for using Tadu",
selector: '.month-wrapper',
isFixed: true
},
{title: "The Calendar",
text: "To no surprise, this is your calendar, it's pretty blank at the moment, but once you start creating tasks you'll see an indicator of how many tasks you have that day. Speaking of tasks let's make a new one now!",
selector: '.month-wrapper',
isFixed: true
}
];