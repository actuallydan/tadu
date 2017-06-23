import React, {Component} from 'react';
import MainLayout from '../imports/MainLayout.jsx';
import EntryPortal from '../imports/EntryPortal.jsx';
import SplashPage from './SplashPage.jsx';

Ground.Collection(Meteor.users);

/* CSS Standardization */
import 'normalize-css';

/* Import Custom CSS */
import '../imports/styles/main.css';

/* 3rd party imports */
import 'react-toastify/dist/ReactToastify.min.css'; 
import swal from 'sweetalert';
import 'sweetalert/dist/sweetalert.css';

/* Fix to change alerts to fit theme */
import '../imports/styles/swaloverride.css';

export default class App extends Component {
	constructor(){
		super();
		this.state = {
			loggedIn: Meteor.userId() === null ? false : true,
			showLogin: false
		};
		this.loggedInChange = this.loggedInChange.bind(this);
	}
	loggedInChange(flag){
		/* Tell out app that we're changing our logged in state and that Meteor knows we're logged in / out and need to change views 
		* Methods that log the user in should provide true as a parameter or false if they're logging out
		*/
		this.setState({
			loggedIn: flag
		});
	}
	showLogin(){
		this.setState({
			showLogin: !this.state.showLogin
		});
	}
	componentDidMount(){
		if(Meteor.isCordova){
			navigator.splashscreen.hide();
		}
	}
	/* Render method should only switch our logged in state */
	render(){
		document.getElementsByTagName("body")[0].style.overflow = !Meteor.isCordova && !this.state.showLogin && !this.state.loggedIn ? "visible" : "hidden";
		return(
			<div className="wrapper">
			{!Meteor.isCordova && !this.state.showLogin && !this.state.loggedIn ?
				<SplashPage showLogin={this.showLogin.bind(this)} />
				:
				this.state.loggedIn ?
				<MainLayout loggedInChange={this.loggedInChange}/>
				:
				<EntryPortal loggedInChange={this.loggedInChange}/>
			}
			</div>
			);
	}
}
