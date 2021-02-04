import React from 'react';

const Register = (props)=> {
	const highlight = (e)=>{
		let elements = document.getElementsByClassName('form-input-wrapper');
		for (let i in elements) {
			if (elements.hasOwnProperty(i)) {
				elements[i].style.borderBottom  = '1px solid #FFF';
			}
		}
		e.target.parentElement.style.borderBottom = "1px solid #33FFCC";
	}
	const showPolicy = ()=>{
		props.showPolicy();
	}
	const changeRegisterState = ()=>{
		let data = {
			password: document.getElementById('register-password').value.trim(),
			username :document.getElementById("register-username").value.trim(),
			bedHour: document.getElementById("register-bedHour").value.trim(),
			phone : document.getElementById("register-phone").value.trim()
		};
		props.changeRegisterState(data);
	}
		return (
			<div className={props.showLogin ? 'container animated fadeOut' : 'container animated fadeIn'} id="register-form">
			
			<form onSubmit={props.tryRegister} autoComplete="off">
			<div className="logo-text">
				<img src="../img/tadu-brand-white-large.png" style={{height: "100%"}}/>
			</div>
			<div className="form-input-wrapper">
			<label htmlFor="register-username" className="mdi mdi-account-circle"></label>
			<input className='form-input' type="text"  id="register-username" onChange={changeRegisterState} value={props.registerStateData.registerUsername} placeholder="Username"  onFocus={highlight} />
			</div>
			<br/>
			<div className="form-input-wrapper">
			<label htmlFor="register-password" className="mdi mdi-lock-outline"></label>
			<input className='form-input' type="password"  id="register-password" onChange={changeRegisterState} value={props.registerStateData.registerPassword} placeholder="Password" autoComplete="off" onFocus={highlight}/>
			</div>
			<div className="form-input-wrapper">
			<label htmlFor="register-phone" className="mdi mdi-phone"></label>
			<input className='form-input' type="phone"  id="register-phone" onChange={changeRegisterState} value={props.registerStateData.registerPhone} placeholder="12223334444" autoComplete="off" onFocus={highlight}/>
			</div>
			<br/>
			<div style={{textAlign: "center", color: "#FFF", margin: 0}}> What time do you usually go to bed? {'\u00A0'}<span onClick={()=>{swal("Bed Time?", "This will help Tadu optimize your schedule when you're most awake and productive.")}} style={{color: '#33FFCC'}}>Why?</span></div>
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

