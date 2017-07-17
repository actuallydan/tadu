import React, {Component} from 'react';
import	{renderToStaticMarkup} from 'react-dom/server';
import Menu from './Menu.jsx';
import FileUpload from './FileUpload.jsx';

/* Left aligned popout menu for general user stuff, uses the Menu component API with modified style and animation */
export default class UserMenu  extends Component {
	constructor(props){
		super();

		this.state = {
			showPicEditor: false
		};
	}
	toggleShowPicEditor(){
		this.setState({
			showPicEditor: !this.state.showPicEditor
		});
	}
	editPic(){
		let img = document.getElementById("uploadPic").files[0];
		if(!img || img.length > 250000){
			return false;
		}
		let reader  = new FileReader();
		reader.addEventListener("load", ()=>{
			let imgString = reader.result;
			Meteor.apply("updateProfilePic", [imgString, Meteor.user()], (err, res)=>{
				if(err){
					swal("Sorry", "There was an error updating your profile, please try again later.", "error");
				} else {
					swal("Updated Image", "Your profile changes have been saved", "success");
					this.setState({
						showPicEditor: !this.state.showPicEditor
					}, ()=>{
						document.querySelector(".profilePic").style.backgroundSize = 'cover';
					});
				}
			});
		});
		reader.readAsDataURL(img);
	}
	editUsername(){
		swal({
			title: "Edit Username",
			text: "Enter a new username",
			showCancelButton: true,
			type: 'input',
			inputPlaceholder: "RickSanchez",
			confirmButtonText: "Update",
			closeOnConfirm: false,
		},(inputValue)=>{
			if(!inputValue || inputValue === ""){
				swal.showInputError("Please enter a username");
				return false;
			} if(inputValue.length > 20){
				swal.showInputError("Please limit username length to 20 characters");
				return false;
			} else {
				Meteor.apply("updateUsername", [inputValue, Meteor.user()], (err, res)=>{
					if(err){
						swal("Error", "There was an error updating your username", "error");
					} else if(res === "403"){
						swal.showInputError("Sorry, this username is already taken.");
						return false;
					} else {
						swal("Updated Username", "Your profile changes have been saved", "success");
					}
				});
			}
		});
	}
	render(){
		return(
			<Menu show={this.props.showMenu} toggleMenu={this.props.toggleMenu} className="menu-slide-in">
			<div className="wrapper">
			<div className="menu-header" onClick={this.editUsername.bind(this)} style={{marginTop: '0.5em', cursor: 'pointer'}}>{Meteor.user().username}</div>
		{/* Menu Items go here */}
		{Meteor.user().profile.pic === undefined || Meteor.user().profile.pic === null || Meteor.user().profile.pic === "" 
		?
		<div className="mdi mdi-account-circle" onClick={this.toggleShowPicEditor.bind(this)} style={{fontSize: '4em', borderRadius: '100%', border: '3px solid #1de9b6', 'cursor': 'pointer', filter: "drop-shadow(0 6px 10px rgba(0,0,0,0.5))"}}></div>
		:
		<div className="profilePic" onClick={this.toggleShowPicEditor.bind(this)} style={{background: 'url(' + Meteor.user().profile.pic + ') no-repeat center', margin: '0 auto', backgroundSize: 'cover', width: '4em', height: '4em', borderRadius: '100%', border: '3px solid #1de9b6', 'cursor': 'pointer', filter: "drop-shadow(0 6px 10px rgba(0,0,0,0.5))"}}></div>
	}
	<div className="menu-item" onClick={this.props.loggedInChange} style={{marginTop: '0.5em'}}>
	<div className="menu-icon mdi mdi-exit-to-app"></div>
	<div className="menu-text">Logout</div>
	</div>
	</div>
	<Menu show={this.state.showPicEditor} toggleMenu={this.toggleShowPicEditor.bind(this)} className="pic-editor">
	<FileUpload editPic={this.editPic.bind(this)} toggleMenu={this.toggleShowPicEditor.bind(this)}/>
	</Menu>
	</Menu>
	)
	}
}

