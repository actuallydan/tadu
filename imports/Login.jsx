import React from 'react';

export default class Login extends React.Component {
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
			<div className={this.props.showLogin ? 'container animated zoomIn' : 'container animated fadeOut'} id="login-form">
				<form onSubmit={this.props.tryLogin.bind(this)} autoComplete="off">
					<div className="logo-text">TADU</div>
					<div className="form-input-wrapper">
						<label htmlFor="login-email" className="mdi mdi-email-outline"></label>
						<input className='form-input' id="login-email" type="text" ref="email" placeholder="Email" autoComplete="off" onFocus={this.highlight.bind(this)}/>
					</div>
					<br/>
					<div className="form-input-wrapper">
						<label htmlFor="login-password" className="mdi mdi-lock-outline"></label>
						<input className='form-input' id="login-password" type="password" ref="password" placeholder="Password" autoComplete="off" onFocus={this.highlight.bind(this)}/>
					</div>
					<p className="login-register-button"><input className="button" type="submit" value="Login" /></p>
					<p onClick={this.props.handleChangeForm.bind(this)} className="toggle-login">Need to register?</p>
				</form>
			</div>

			);
	}
}

