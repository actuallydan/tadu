import React from 'react';
import ReactTooltip from 'react-tooltip';

export default class Register extends React.Component {
	highlight(e){
		let elements = document.getElementsByClassName('form-input-wrapper');
		for (let i in elements) {
			if (elements.hasOwnProperty(i)) {
				elements[i].style.borderBottom  = '1px solid #FFF';
			}
		}
		e.target.parentElement.style.borderBottom = "1px solid #1de9b6";
	}
	showPolicy(){
		this.props.showPolicy();
	}
	changeRegisterState(){
		let data = {
			'email': document.getElementById('register-email').value.trim(),
			'password': document.getElementById('register-password').value.trim(),
			username :document.getElementById("register-username").value.trim(),
			bedHour: document.getElementById("register-bedHour").value.trim()
		};
		this.props.changeRegisterState(data);
	}
	render(){
		return (
			<div className={this.props.showLogin ? 'container animated fadeOut' : 'container animated fadeIn'} id="register-form">
			
			<form onSubmit={this.props.tryRegister.bind(this)} autoComplete="off">
			<div className="logo-text">TADU</div>
			<div className="form-input-wrapper">
			<label htmlFor="register-email" className="mdi mdi-email-outline"></label>
			<input className='form-input' type="text" ref="email" id="register-email" onChange={this.changeRegisterState.bind(this)} value={this.props.registerStateData.registerEmail} placeholder="Email" autoComplete="off" onFocus={this.highlight.bind(this)} />
			</div>
			<br/>
			<div className="form-input-wrapper">
			<label htmlFor="register-password" className="mdi mdi-lock-outline"></label>
			<input className='form-input' type="password" ref="password" id="register-password" onChange={this.changeRegisterState.bind(this)} value={this.props.registerStateData.registerPassword} placeholder="Password" autoComplete="off" onFocus={this.highlight.bind(this)}/>
			</div>

			<br/>
			<div className="form-input-wrapper">
			<label htmlFor="register-username" className="mdi mdi-account-circle"></label>
			<input className='form-input' type="text"  id="register-username" onChange={this.changeRegisterState.bind(this)} value={this.props.registerStateData.registerUsername} ref="username" placeholder="Username"  onFocus={this.highlight.bind(this)} />
			</div>
			<br/>
			<div style={{textAlign: "center", color: "#FFF", margin: 0}}> What time do you usually go to bed? {'\u00A0'}<span onClick={()=>{swal("Bed Time?", "This will help Tadu optimize your schedule when you're most awake and productive.")}} style={{color: '#1de9b6'}}>Why?</span></div>
			<div className="form-input-wrapper">
			<label htmlFor="register-bedHour" className="mdi mdi-hotel"></label>
			<input className='form-input' type="time" id="register-bedHour" onChange={this.changeRegisterState.bind(this)} value={this.props.registerStateData.registerBedHour} ref="bedHour" placeholder="12:00 PM"  onFocus={this.highlight.bind(this)}/>
			</div>

			<div className="privacy-policy">
			By clicking "Register" you agree to our 
			<a href="#" onClick={this.showPolicy.bind(this)}> Privacy Policy </a> 
			and that you are at least 13 years of age.
			</div>
			<p className="login-register-button"><input className="button" type="submit" value="Register" /></p>
			<p onClick={this.props.handleChangeForm.bind(this)} className="toggle-login pulse">Already registered? <span>Log in</span></p>

			</form>


			</div>
			);
	}
}

