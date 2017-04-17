/* Login and Registration views for Tadu
*
* User is presented with this view if there is no Meteor user set
* either becaue they have not registered or have been logged out by Meteor
* Tests should be done to make sure user's don't have to sign in too often if on the same device
*/
import React from 'react';

export default class LoginForm extends React.Component {
	constructor(props) {
		super(props);
		/* Single state value to switch out login for register view or vice versa */ 
		this.state = {
			showLogin: false
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
		if ( email !== null && password !== null) {
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
		}
	}

	/* After user submit's registration form we attempt to sign them in */
	tryRegister(event){
		/* Second verse, same as the first */
		event.preventDefault();

		/* Trim, validate, and sanitize (TODO) user input */
		if (this.refs.username.value.trim() !== null && this.refs.password.value.trim() !== null && this.refs.email.value.trim() !== null) {
			const user = {
				username: this.refs.username.value.trim(),
				password: this.refs.password.value.trim(),
				email: this.refs.email.value.trim()
			};
			try{
				/* Try to create a new user with Meteor's account package */
				Accounts.createUser(user, (err)=> {
					if(err){
						/* There was an issue with existing accounts, parameter length wasn't sufficient etc.*/
						swal("Oops...", err.reason, "error");
					} else {
						/* Meteor will automagically sign in users after successful account creation so we can trigger state update in parent to escape this prison*/
						this.props.loggedInChange(true);
						Meteor.call("addDefaultTags");
						Meteor.call("addDefaultSchedule");
					}
				});				
			} catch (e){
				/* There was a non-meteor related issue, likely Error: 500 */
				swal("Oops...", e, "error");
			}
			
		}
	}
	render(){
		/* Swaps out which form should be visible based on this component's state: register or login
		* TODO: make transitions more appealing and maybe spin each into it's own component
		*/
		if(this.state.showLogin){
			return (<div className={this.state.showLogin ? 'container animated fadeIn' : 'container animated fadeOut'} id="login-form">
				<div className='logo-login'>
				<img className="logo-img" src="../img/tadu_logo.png"/>
				<p className="logo-text">tadu</p>
				</div>
				<div className="login-header">Login to get back to it</div>
				<form onSubmit={this.tryLogin.bind(this)}>
				<input className='form-input' type="text" ref="email" placeholder="Email" />
				<input className='form-input' type="password" ref="password" placeholder="Password" />
				<p className="login-register-button"><input className="button" type="submit" value="Login" /></p>

				</form>
				<p onClick={this.handleChangeForm.bind(this)} className="toggle-login">Need to register?</p>


				</div>

				)
		} else {
			return ( <div className={this.state.showLogin ? 'container animated fadeOut' : 'container animated fadeIn'} id="register-form">
				<div className='logo-login'>
				<img className="logo-img" src="../img/tadu_logo.png"/>
				<p className="logo-text">tadu</p>
				</div>
				<div className="login-header">Register to get started</div>
				<form onSubmit={this.tryRegister.bind(this)}>
				<input className='form-input' type="text" ref="email" placeholder="Email" />
				<input className='form-input' type="password" ref="password" placeholder="Password" />
				<input className='form-input' type="text" ref="username" placeholder="Username" />
				<p className="login-register-button"><input className="button" type="submit" value="Register" /></p>

				</form>

				<p onClick={this.handleChangeForm.bind(this)} className="toggle-login">Already registered?</p>

				</div>
				)
		}
	}
}