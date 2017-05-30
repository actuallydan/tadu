import React, {Component} from 'react';
import Loader from './Loader.jsx';

export default class AddTaskStage1 extends Component {
	render(){
		let myTags = TagTypes.findOne();
		const tags = ["Homework", "Study", "Doctor", "Exercise", "Meeting", "Groceries", "Errands", "Music Practice", "Cleaning"];
		const globalTags = [{name: 'Homework',icon: 'mdi-pencil'}, {name: 'Study',icon: 'mdi-book-open-variant'}, {name: 'Doctor',icon: 'mdi-stethoscope'}, {name: 'Exercise',icon: 'mdi-run'}, {name: 'Meeting',icon: 'mdi-account-multiple'}, {name: 'Groceries',icon: 'mdi-food-apple'}, {name: 'Errands',icon: 'mdi-car'}, {name: 'Music Practice',icon: 'mdi-music-note'}, {name: 'Cleaning',icon: 'mdi-cup-water'}];

		let n = 0;

		return (
			<div>
			<div id="search-wrapper">
			<i id="search-icon" className="mdi mdi-magnify"></i>
			<input id="search" type="text" value={this.props.search} onChange={this.props.updateSearch.bind(this)} placeholder="Select Category or Search"/>
			</div>
			{	this.props.showLoader
				?
				<Loader width={"100%"}/>
				:
				/* If the user hasn't started searching give them the dialpad, otherwise show them the most used results */
				this.props.search !== "" ? "" :
				<div id="global-tags">

				{globalTags.map((tag)=>{
					return (
						<p className="global-tag-wrapper" data-tag={tag.name} onClick={this.props.taskStage2.bind(this)} key={tag.name}>
						<i className={"tag-icon mdi " + tag.icon}></i>
						<span className="global-tag-label">{tag.name}</span>
						</p>
						)
				})}

				<p className="global-tag-wrapper no-tags" style={{width: '100%', "margin": "0 auto"}} onClick={this.props.createNewTag.bind(this)}>
				<i className="tag-icon mdi mdi-tag"></i>
				<span className="global-tag-label">New Tag</span>
				</p>

				</div>
			}
			{
				myTags === undefined ? "" :
					// TODO: clean up A LOT
					myTags.tags.filter((tag)=>{ 
						if(this.props.search.trim() === ""){
							// return if not in array
							return !tags.includes(tag.type);
						} else {
							return tag.type.toLowerCase().indexOf(this.props.search.toLowerCase()) !== -1;
						}
					}).sort((a, b)=> {return a.uses < b.uses; })
					.map((tag)=>{
						n++;
						let colorClass = "green";
						switch(Math.floor(Math.random() * 3)){
							case 0:
							colorClass = "green";
							break;
							case 1:
							colorClass = "dark-green";
							break;
							case 2:
							colorClass = "light-green";
							break;
						}
						return (
							<div className={"event-tag-tile " + colorClass} key={tag.type} data-uses={tag.uses} data-id={tag._id} data-tag={tag.type} onClick={this.props.taskStage2.bind(this)}>
							{tag.type}
							</div>
							)
					}
					)
				}
				{
					n === 0 && this.props.search !== "" ? 
					<p className="global-tag-wrapper no-tags" onClick={this.props.createNewTag.bind(this)}>
					<label>Looking for something else? Create a new tag for next time!</label>
					<i className="tag-icon mdi mdi-tag"></i>
					<span className="global-tag-label">Create New Tag</span>
					</p>
					: 
					""
				}
				</div>
				)
	}
}