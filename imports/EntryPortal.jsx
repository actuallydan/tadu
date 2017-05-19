/* Login and Registration views for Tadu
*
* User is presented with this view if there is no Meteor user set
* either becaue they have not registered or have been logged out by Meteor
* Tests should be done to make sure user's don't have to sign in too often if on the same device
*/
import React from 'react';
import Login from './Login.jsx';
import Register from './Register.jsx';
import Menu from './Menu.jsx';
import Policy from './Policy.jsx';

export default class EntryPortal extends React.Component {
	constructor(props) {
		super(props);
		/* Single state value to switch out login for register view or vice versa */ 
		this.state = {
			showLogin: true,
			showPolicy: false,
		};
	}
	/* Method that actually updates the state to show whichever form isn't present */
	handleChangeForm() {
		this.setState({showLogin : !this.state.showLogin});
	}

	/* After user submit's login form we attempt to sign them in */
	tryLogin(event){
		/* Stop from from submitting and page from refreshing. What is this 2012? */
		event.preventDefault();
		/* Because this works weird in JS, i'm making sure it points to the current component we're in, not a meteor method or something else */
		const context = this;

		/* Grab, trim, and ideally sanitize user login data */
		const email = this.refs.email.value.trim();
		const password = this.refs.password.value.trim();

		/* Make sure both fields have data in them otherwise ignore it in case of errant enter or mouse click to prevent needless alerting of user */
		if ( email !== "" && password !== "") {
			try{
				/* Attempt to login user with Meteor Account's method and exception will tell us what happened if thrown */
				Meteor.loginWithPassword(email, password, (err, data)=> {
					if(err){
						/* Account credentials are incorrect and/or fields are not of satisfactory length */
						swal("Oops...", err.reason, "error");
					} else {
						/* Login was a success, trigger state change in parent component */
						this.props.loggedInChange(true);
					}
				});	
			} catch (e){
				/* Something unforseen happened with the server request, possibly a poor connection issue */
				swal("Oops...", e, "error");
			}
		} else {
			/* The user tried to enter invalid email or username credentials. Email addresses should contain alphanumeric characters, @, ., _, and - only */
			swal("Sorry", "Please enter a valid email and a valid username with at least 6 characters.", "error");
		}
	}

	/* After user submit's registration form we attempt to sign them in */
	tryRegister(event){
		/* Second verse, same as the first */
		event.preventDefault();
		let valid = true;
		/* Trim, validate, and sanitize user input */
		const bad = "~`,<>/?'\";:]}[{\|+=)(*&^%$#!";

		for(var i = 0; i < bad.length; i++){
			if(this.refs.email.value.indexOf(bad[i]) >= 0 || this.refs.username.value.indexOf(bad[i]) >= 0){
				valid = false;
				break;    
			}
		}

		if (this.refs.username.value.trim() !== "" && this.refs.password.value.trim() !== "" && this.refs.email.value.trim() !== "" && valid && this.refs.bedHour.value !== "") {
			/* Get the time the user ususally goes to bed to build their social circadian rhythm around that */
			const user = {
				username: this.refs.username.value.trim(),
				password: this.refs.password.value.trim(),
				email: this.refs.email.value.trim(),
				profile: {
					bedHour: this.refs.bedHour.value
				}
			};
			console.log(user, this.refs);
			try{
				/* Try to create a new user with Meteor's account package */
				Accounts.createUser(user, (err)=> {
					if(err){
						/* There was an issue with existing accounts, parameter length wasn't sufficient etc.*/
						swal("Oops...", err.reason, "error");
					} else {
						 /* Meteor will automagically sign in users after successful account creation so we can trigger state update in parent to escape this prison */
						this.props.loggedInChange(true);
						Meteor.call("addDefaultTags");
						Meteor.call("addDefaultSchedule");
					}
				});				
			} catch (e){
				/* There was a non-meteor related issue, likely Error: 500 */
				swal("Oops...", e, "error");
			}
			
		} else {
			/* The user tried to enter invalid email or username credentials. Email addresses should contain alphanumeric characters, @, ., _, and - only */
			swal("Sorry", "Please fill out all fields. Make sure you enter a valid email and a valid username with at least 6 characters.", "error");
		}
	}
	togglePolicy(){
		this.setState({
			showPolicy: !this.state.showPolicy
		});
	}
	render(){
		/* Swaps out which form should be visible based on this component's state: register or login. Also display the pirvacy policy because links don't work by default in Cordova */
		return (
			<div id="entry-portal"> 
			
			{this.state.showLogin ? 
			<Login showLogin={this.state.showLogin} tryLogin={this.tryLogin} handleChangeForm={this.handleChangeForm.bind(this)} loggedInChange={this.props.loggedInChange.bind(this)}/> 
			:
			 <Register showLogin={this.state.showLogin} tryRegister={this.tryRegister} handleChangeForm={this.handleChangeForm.bind(this)}  showPolicy={this.togglePolicy.bind(this)} loggedInChange={this.props.loggedInChange.bind(this)}/>
			 }
			 <Menu show={this.state.showPolicy} toggleMenu={this.togglePolicy.bind(this)}>
			 	<Policy />
			 </Menu>
			 </div>
			  ) 
	
	}
}
