import React from 'react';

const Register = (props)=> {
	const highlight = (e)=>{
		let elements = document.getElementsByClassName('form-input-wrapper');
		for (let i in elements) {
			if (elements.hasOwnProperty(i)) {
				elements[i].style.borderBottom  = '1px solid #FFF';
			}
		}
		e.target.parentElement.style.borderBottom = "1px solid #1de9b6";
	}
	const showPolicy = ()=>{
		props.showPolicy();
	}
	const changeRegisterState = ()=>{
		let data = {
			'email': document.getElementById('register-email').value.trim(),
			'password': document.getElementById('register-password').value.trim(),
			username :document.getElementById("register-username").value.trim(),
			bedHour: document.getElementById("register-bedHour").value.trim()
		};
		props.changeRegisterState(data);
	}
		return (
			<div className={props.showLogin ? 'container animated fadeOut' : 'container animated fadeIn'} id="register-form">
			
			<form onSubmit={props.tryRegister} autoComplete="off">
			<div className="logo-text">TADU</div>
			<div className="form-input-wrapper">
			<label htmlFor="register-email" className="mdi mdi-email-outline"></label>
			<input className='form-input' type="text" id="register-email" onChange={changeRegisterState} value={props.registerStateData.registerEmail} placeholder="Email" autoComplete="off" onFocus={highlight} />
			</div>
			<br/>
			<div className="form-input-wrapper">
			<label htmlFor="register-password" className="mdi mdi-lock-outline"></label>
			<input className='form-input' type="password"  id="register-password" onChange={changeRegisterState} value={props.registerStateData.registerPassword} placeholder="Password" autoComplete="off" onFocus={highlight}/>
			</div>

			<br/>
			<div className="form-input-wrapper">
			<label htmlFor="register-username" className="mdi mdi-account-circle"></label>
			<input className='form-input' type="text"  id="register-username" onChange={changeRegisterState} value={props.registerStateData.registerUsername} placeholder="Username"  onFocus={highlight} />
			</div>
			<br/>
			<div style={{textAlign: "center", color: "#FFF", margin: 0}}> What time do you usually go to bed? {'\u00A0'}<span onClick={()=>{swal("Bed Time?", "This will help Tadu optimize your schedule when you're most awake and productive.")}} style={{color: '#1de9b6'}}>Why?</span></div>
			<div className="form-input-wrapper">
			<label htmlFor="register-bedHour" className="mdi mdi-hotel"></label>
			<input className='form-input' type="time" id="register-bedHour" onChange={changeRegisterState} value={props.registerStateData.registerBedHour} placeholder="12:00 PM"  onFocus={highlight}/>
			</div>

			<div className="privacy-policy">
			By clicking "Register" you agree to our 
			<span onClick={showPolicy} style={{textDecoration : 'underline'}}> Privacy Policy </span> 
			and that you are at least 13 years of age.
			</div>
			<p className="login-register-button"><input className="button" type="submit" value="Register" /></p>
			<p className="toggle-login pulse">Already registered? <span onClick={props.handleChangeForm} >Log in</span></p>

			</form>


			</div>
			);
}

export default Register;

