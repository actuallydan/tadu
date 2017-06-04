import React from 'react';
import Calendar from './Calendar.jsx';
import Tasks from './Tasks.jsx';
import AddTask from './AddTask.jsx';
import TaskDetail from './TaskDetail.jsx';
import TaskSingle from './TaskSingle.jsx';
import Notice from './Notice.jsx';


const DesktopLayout = (props)=>{
		return(
			<div className="wrapper animated fadeIn">
			<Tasks 
				filteredTasks={props.filteredTasks} 
				show={props.viewTaskList} 
				showDetail={props.showDetail} 
				selectedDate={props.selectedDate} 
				showCal={props.showView}
				pushLeft={props.viewAddTask}
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
			</div>
			);

};
export default DesktopLayout;

