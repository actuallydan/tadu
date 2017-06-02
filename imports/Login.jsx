import React, {Component} from 'react';

const Login = (props)=>{
	 const highlight = (e)=> {
		let elements = document.getElementsByClassName('form-input-wrapper');
		for (let i in elements) {
			if (elements.hasOwnProperty(i)) {
				elements[i].style.borderBottom  = '1px solid #FFF';
			}
		} 
		e.target.parentElement.style.borderBottom = "1px solid #1de9b6";
	};
	 const changeLoginState = (e)=> {
		let data = {
				'email': document.getElementById('login-email').value.trim(),
				'password': document.getElementById('login-password').value.trim(),
			};
		props.changeLoginState(data);
	};
		return (
			<div className={props.showLogin ? 'container animated fadeIn' : 'container animated fadeOut'} id="login-form">
				<form onSubmit={props.tryLogin} autoComplete="off">
					<div className="logo-text">TADU</div>
					<div className="form-input-wrapper">
						<label htmlFor="login-email" className="mdi mdi-email-outline"></label>
						<input className='form-input' id="login-email" type="text" value={props.loginStateData.loginEmail} placeholder="Email" autoComplete="off" onFocus={highlight} onChange={changeLoginState}/>
					</div>
					<br/>
					<div className="form-input-wrapper">
						<label htmlFor="login-password" className="mdi mdi-lock-outline"></label>
						<input className='form-input' id="login-password" type="password" value={props.loginStateData.loginPassword} placeholder="Password" autoComplete="off" onFocus={highlight} onChange={changeLoginState}/>
					</div>
					<p className="login-register-button"><input className="button" type="submit" value="Login" /></p>
					<p className="toggle-login">Need to register? <span onClick={props.handleChangeForm} >Sign Up</span></p>
				</form>
			</div>

			);
	
}
export default Login;

