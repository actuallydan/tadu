import React, {Component} from 'react';

export default class QuickTasks extends Component {
	render(){
		return(<div className="wrapper">
		
			{this.props.filteredTasks}
			
		</div>);
	}
}