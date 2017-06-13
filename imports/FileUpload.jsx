import React, {Component} from 'react';

export default class FileUpload extends Component{
	constructor(){
		super();
		this.state ={
			labelText: ""
		}
	}
	hasExtension() {
		const exts = ['.jpg', '.png', '.gif'];
	    let fileName = document.getElementById('uploadPic').value;
	    return (new RegExp('(' + exts.join('|').replace(/\./g, '\\.') + ')$', "i")).test(fileName);
	}
	changePreview(){
		if(!this.hasExtension()){
			swal("File Error", "Please upload a valid picture file. We accept .jpg, .png, and .gif", "error");
			return false;
		}
		let preview = document.getElementById('editPicPreview');
		let file    = document.getElementById('uploadPic').files[0];
		let reader  = new FileReader();

		reader.addEventListener("load", ()=>{
			preview.style.backgroundImage = 'url(' + reader.result + ')';
		});

		if (file) {
			reader.readAsDataURL(file);
		}
	}
	render(){
		return (
			<div>
			<div style={{fontSize: '1.1em'}}>Upload Photo</div>
			<div style={{color: '#616161', fontSize: '0.8em'}}>Your photo will be centered.<br/> Square images work best.</div>
			<br/>
			<div style={{height: 'auto'}}>
			<label id='labelForUploadPic' htmlFor='uploadPic' style={{display: 'inline-block', verticalAlign: 'middle', marginRight: '1em'}}>Choose Image</label>
			<div id="editPicPreview" className="profilePic" style={{display: 'inline-block', verticalAlign: 'middle', background: 'url(' + Meteor.user().profile.pic + ') no-repeat center', margin: '0 auto', backgroundSize: 'cover', width: '6em', height: '6em', borderRadius: '100%', border: '3px solid #1de9b6', 'cursor': 'pointer'}}></div>
			</div>
			<input onChange={this.changePreview.bind(this)} id='uploadPic' type='file' accept='image/*' />
			<button className="cancel-button" onClick={this.props.toggleMenu.bind(this)}>Cancel</button> 
			<button className="submit-button" onClick={this.props.editPic.bind(this)}>Update</button> 
			</div>
			)
	}
}
