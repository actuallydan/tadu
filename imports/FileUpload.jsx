import React, {Component} from 'react';

export default class FileUpload extends Component{
	constructor(){
		super();
		this.state ={
			labelText: ""
		}
	}
	changeLabel(){
		let startIndex = Math.max(document.getElementById('uploadPic').value.lastIndexOf('\\'), document.getElementById('uploadPic').value.lastIndexOf('/')) + 1;
		this.setState({
			labelText: document.getElementById('uploadPic').value.substring(startIndex, document.getElementById('uploadPic').value.length)
		});
	}
	render(){
	return (
		<div>
		<div>Your photo will be centered and cropped. Square images work best.</div>
		<br/>
		<label id='labelForUploadPic' htmlFor='uploadPic'>Choose Image</label>
		<span>{this.state.labelText}</span>
		<input onChange={this.changeLabel.bind(this)} id='uploadPic' type='file' accept='image/*' />
		</div>
		)
}
}
