import React from 'react';

export default class LoginForm extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			showLogin: false
		};
	}
	handleChangeForm(event) {
		this.setState({showLogin : !this.state.showLogin});
	}
	tryLogin(event){
		event.preventDefault();
		const context = this;
		var email = this.refs.email.value.trim();
		var password = this.refs.password.value.trim();
		if ( email !== null && password !== null) {
			try{
				Meteor.loginWithPassword(email, password, (err, data)=> {
					if(err){
						swal("Oops...", err.reason, "error");
					} else {
						this.props.loggedInChange(true);
					}
				});	
			} catch (e){
				swal("Oops...", e, "error");
			}
		}
	}
	tryRegister(event){
		event.preventDefault();
		if (this.refs.username.value.trim() !== null && this.refs.password.value.trim() !== null && this.refs.email.value.trim() !== null) {
			let user = {
				username: this.refs.username.value.trim(),
				password: this.refs.password.value.trim(),
				email: this.refs.email.value.trim(),
			};
			try{
			Accounts.createUser(user, (err)=> {
					if(err){
						swal("Oops...", err.reason, "error");
					} else {
						this.props.loggedInChange(true);
					}
				});
			} catch (e){
				swal("Oops...", e, "error");
			}
			
		}
	}
	render(){
		if(this.state.showLogin){
			return (<div className={this.state.showLogin ? 'container animated fadeIn' : 'container animated fadeOut'} id="login-form">
				<div className='logo-login mdi mdi mdi-blur-linear'></div>
				<div className="login-header">Login to get back to it</div>
				<form onSubmit={this.tryLogin.bind(this)}>
				<input className='form-input' type="text" ref="email" placeholder="Email" />
				<input className='form-input' type="password" ref="password" placeholder="Password" />
				<p className="center"><input className="button" type="submit" value="Login" /></p>

				</form>
				<p onClick={this.handleChangeForm.bind(this)} className="text-grey">Need to register?</p>


				</div>

				)
		} else {
			return ( <div className={this.state.showLogin ? 'container animated fadeOut' : 'container animated fadeIn'} id="register-form">
				<div className='logo-login mdi mdi mdi-blur-linear'></div>
				<div className="login-header">Register to get started</div>
				<form onSubmit={this.tryRegister.bind(this)}>
				<input className='form-input' type="text" ref="email" placeholder="Email" />
				<input className='form-input' type="password" ref="password" placeholder="Password" />
				<input className='form-input' type="text" ref="username" placeholder="Username" />
				<p className="center"><input className="button" type="submit" value="Register" /></p>

				</form>

				<p onClick={this.handleChangeForm.bind(this)} className="text-grey">Already registered?</p>

				</div>
				)
		}
	}
}