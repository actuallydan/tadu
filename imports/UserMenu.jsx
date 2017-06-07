import React, {Component} from 'react';
import	{renderToStaticMarkup} from 'react-dom/server';
import Menu from './Menu.jsx';
import FileUpload from './FileUpload.jsx';

/* Left aligned popout menu for general user stuff, uses the Menu component API with modified style and animation */
const UserMenu = (props)=>{
	const editPic = ()=>{
		
		swal({
			title: "Edit Profile Picture",
			html: true,
			text: renderToStaticMarkup(<FileUpload />),
			showCancelButton: true,
			confirmButtonText: "Upload",
			closeOnConfirm: false,
		},(inputValue)=>{
			if(!inputValue || inputValue === ""){
				swal.showInputError("Please upload an image");
				return false;
			} else {
				let img = document.getElementById("uploadPic").files[0];
				let reader  = new FileReader();
				reader.addEventListener("load", ()=>{
					let imgString = reader.result;
					Meteor.call("updateProfilePic", imgString, (err, res)=>{
						if(err){
							swal("Sorry", "There was an error updating your profile, please try again later.", "error");
						} else {
							swal("Updated Image", "Your profile changes have been saved", "success");
						}
					});
				});
				reader.readAsDataURL(img);

			}
		});
	};
	const editUsername = ()=>{
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
				Meteor.call("updateUsername", inputValue, (err, res)=>{
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
	};
	return(
		<Menu show={props.showMenu} toggleMenu={props.toggleMenu} className="menu-slide-in">
		<div className="wrapper">
		<div className="menu-header" onClick={editUsername}>{Meteor.user().username}</div>
	{/* Menu Items go here */}
	{Meteor.user().profile.pic === undefined || Meteor.user().profile.pic === null || Meteor.user().profile.pic === "" 
	?
	<div className="mdi mdi-account-circle" onClick={editPic}></div>
	:
	<div className="profilePic" onClick={editPic} style={{background: 'url(' + Meteor.user().profile.pic + ') no-repeat center', margin: '0 auto', backgroundSize: 'cover', width: '4em', height: '4em', borderRadius: '100%', border: '3px solid #1de9b6', 'cursor': 'pointer'}}></div>
}
<div className="menu-item" onClick={props.loggedInChange} style={{marginTop: '0.5em'}}>
<div className="menu-icon mdi mdi-exit-to-app"></div>
<div className="menu-text">Logout</div>
</div>
</div>
</Menu>
)
}
export default UserMenu;