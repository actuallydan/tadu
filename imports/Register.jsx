import React from 'react';

export default class Register extends React.Component {
	highlight(e){
		let elements = document.getElementsByClassName('form-input-wrapper');
		for (let i in elements) {
		  if (elements.hasOwnProperty(i)) {
		    elements[i].style.borderBottom  = '1px solid #424242';
		  }
		}
		e.target.parentElement.style.borderBottom = "1px solid #1de9b6";
	}
render(){
return (
	<div className={this.props.showLogin ? 'container animated fadeOut' : 'container animated zoomIn'} id="register-form">
				
				<form onSubmit={this.props.tryRegister.bind(this)} autoComplete="off">
				<div className='logo-login'>
				<img className="logo-img" src="../img/tadu_logo.png"/>
				<div className="logo-text">TADU</div>
				</div>
				<div className="form-input-wrapper">
				<label htmlFor="register-email" className="mdi mdi-email-outline"></label>
				<input className='form-input' type="text" ref="email" id="register-email" placeholder="Email" autoComplete="off" onFocus={this.highlight.bind(this)}/>
				</div>
				<br/>
				<div className="form-input-wrapper">
				<label htmlFor="register-password" className="mdi mdi-lock-outline"></label>
				<input className='form-input' type="password" ref="password" id="register-password" placeholder="Password" autoComplete="off" onFocus={this.highlight.bind(this)}/>
								</div>

				<br/>
				<div className="form-input-wrapper">
				<label htmlFor="register-username" className="mdi mdi-account-circle"></label>
				<input className='form-input' type="text"  id="register-username" ref="username" placeholder="Username"  onFocus={this.highlight.bind(this)}/>
								</div>

				<p className="login-register-button"><input className="button" type="submit" value="Register" /></p>
								<p onClick={this.props.handleChangeForm.bind(this)} className="toggle-login">Already registered?</p>

				</form>


				</div>
	);
}
}

