import moment from 'moment';

export default class Parser {
	constructor(userTime){
		/* Task template */
		this._protoTask = {
			"what": null,
			"month" : null,
			"day" : null,
			"year" : null,
			"hour" : null,
			"minute": null
		};
		this.finishedTask = {
			text: null,
			dateStart: null,
			timeStart: null,
			dateEnd: null,
			timeEnd: null,
			tag: "Errands",
			completed: false,
			createdAt: null,
			userId : null,
			desc : null,
			alarm: null,
			timeUTC: null,
			timeUTCEnd: null,
			sharingWith: null
		};
		this.userTime = userTime;
		/* Identifiers */
		this.taskMessage = null;
		this._days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"]
		this._months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
		this._relDates = ["tomorrow", "this", "next", "in", "at", "on", "for"];
		/* Dictionaries */
		this._timeFormatDict = {2 : "h", 3 : "hha", 4 : "hh a", 5 : "hh:mm", 6 : "hh:mma"};
		this._onDateFormatDict = {3: "MM", 6: "MM DD ", 10 : "MM DD YYYY"};
		this._ignoreDict = { "remind" : false, "me" : false, "schedule" : false, "to" : false, "an" : false,
		"set" : false, "a" : false, "Sunday" : false, "Monday" : false, "Tuesday" : false, "Wednesday" : false,
		"Thursday" : false, "Friday" : false, "Saturday" : false, "January" : false, "February" : false, "March" : false,
		"April" : false, "May" : false, "June" : false, "July" : false, "August" : false, "September" : false,
		"October" : false, "November" : false, "December" : false, "sunday" : false, "monday" : false, "tuesday" : false,
		"wednesday" : false, "thursday" : false, "friday" : false, "saturday" : false, "january" : false, "february" : false,
		"march" : false, "april" : false, "may" : false, "june" : false, "july" : false, "august" : false, "september" : false,
		"october" : false, "november" : false, "december" : false, "also" : false, "I" : false, "need": false, "can" : false,
		"you" : false, "minutes" : false, "hours" : false, "days" : false, "weeks" : false, "years" : false };
		/* Helper variables */
		this._indicatorsToTry = [];
		this._tempReqArray = null;
		this._reqArray = null;
	}
	clearProtoTask(){
		this._protoTask = {
			"what": null,
			"month" : null,
			"day" : null,
			"year" : null,
			"hour" : null,
			"minute": null
		};
		this.finishedTask = {
			text: null,
			dateStart: null,
			timeStart: null,
			dateEnd: null,
			timeEnd: null,
			tag: "Errands",
			completed: false,
			createdAt: null,
			userId : null,
			desc : null,
			alarm: null,
			timeUTC: null,
			timeUTCEnd: null,
			sharingWith: null
		};
	}
	addWhatToProtoTask(string){
		this._protoTask.what = string;
	}
	addDayToProtoTask(string){
		this._protoTask.month = string.substring(5,7);
		this._protoTask.day = string.substring(8,10);
		this._protoTask.year = string.substring(0,4);
	}

	addTimeToProtoTask(string){
		this._protoTask.hour = string.substring(11,13);
		this._protoTask.minute = string.substring(14,16);
	}
	findNextDayOfWeek(day){
		let dayToCheck;
		let i;
		for(i = 1; i < 12; ++i){
			dayToCheck = moment().add(i, 'days').format("dddd");
			if(dayToCheck === day){
				break;
			}
		}
		return moment().add(i, 'days').format();
	}
	parse(req){
		this.clearProtoTask();
		req = req.trim();

		/* Check to see if user is issuing a command directly or needs text parsed (default behavior is to simply try and parse the whole thing) */
		switch(this.checkCommand(req)){
			case "/remind" :
			return this.commandToTask(req);
			break;
			case "/task" : 
			return "";
			break;
			default:
			return this.textToTask(req);
		}
	}
	/* See which commands if any the user is trying to execute */
	checkCommand(req){
		return req.split(" ")[0];
	}
	commandToTask(req){
		/* To create a task from a command we require the /remind "<Task Title>" when syntax. Check to see if we have a <Task Title> in quotes */ 
		if( /".*"|'.*'/.test(req) ){
			/* Get the task title  and add it to our object */
	    	let task = /".*"|'.*'/.exec(req)[0].replace('\'', "").replace("\"", "");
	    	this.addWhatToProtoTask(task);

	    	/* remove the task title from our request string, split it into an array, remove the command delineator and commas when imploding, and send the rest to the textToTask method */
			req = req.replace(task, "");
			let inputArray = req.split(" ");
			inputArray.splice(0, 1);
			let newInput = inputArray.toString().replace(",", " ");
			console.log(task, req, inputArray, newInput);
			return this.textToTask(newInput)
		}
	}
	textToTask(req){
		this._reqArray = req.split(" ");

		/* get date and time */
		this._indicatorsToTry = [];
		this._tempReqArray = this._reqArray.slice();

		this._relDates.map((string)=>{
			if(new RegExp(" " + string).test(req)){
				this._indicatorsToTry.push(string);
				this._tempReqArray.splice(this._tempReqArray.indexOf(string), 1)
			} 
			return;
		})
		let parsedDay = null, parsedTime = null;
		this._indicatorsToTry.map((string)=>{
			switch(string){
				case "tomorrow": 
				parsedDay = moment().add(1, 'days').format();
				this.addDayToProtoTask(parsedDay);
				break;
				case "this": 
				/*Find a week day string in */
				this.processThisAndNext(req);
				break;
				case "next": 
				/* Same as above but add an extra 7 days */
				this.processThisAndNext(req);
				break;
				case "in": 
				/* if the index after "in" is a number get it and the next one and add it to right now */
				if(isNaN(parseInt(this._reqArray[this._reqArray.indexOf("in") + 1], 10)) === false){
					let addend = parseInt(this._reqArray[this._reqArray.indexOf("in") + 1], 10);
					let units = "hours";
					if(this._reqArray[this._reqArray.indexOf("in") + 2] !== undefined){

						units = this._reqArray[this._reqArray.indexOf("in") + 2] 
						console.log(this._reqArray, units, addend)
					}
					parsedDay = moment().add(addend, units).format();
					if(parsedDay !== null && parsedDay !== undefined) {
						this.addDayToProtoTask(parsedDay);
						this.addTimeToProtoTask(parsedDay)
					}
				}
				break;
				case "at": 
				this.processAt(req);
				break;
				case "on": 
				parsedDay = this.processForAndOn(req);
				if(parsedDay !== null && parsedDay !== undefined) {
					this.addDayToProtoTask(parsedDay);
				}
				break;
				case "for": 
				parsedDay = this.processForAndOn(req);
				if(parsedDay !== null && parsedDay !== undefined) {
					this.addDayToProtoTask(this.findNextDayOfWeek(parsedDay));
				}
				break;
				default:
				break;
			}
		});
		this._tempReqArray = this._tempReqArray.filter((word)=>{return this._ignoreDict[word] === undefined });
		this._tempReqArray = this._tempReqArray.filter((word)=>{ return /\d{1,2}:\d{1,2}|\d{1,4}(AM|PM)|\d{1,2}:\d{1,2}(AM|PM)|\d{1,2}/i.test(word) === false});
		this._protoTask.what === null ? this._tempReqArray.toString().replace(/,/g, " ") : this._protoTask.what;
		// this.taskMessage = "Does this look right? <br/> Title: " + this._protoTask.what + "<br/> Date: " + this._protoTask.year + "-" +  this._protoTask.month + "-" +  this._protoTask.day 
		// this.taskMessage += "<br/> Time: " + this._protoTask.hour + ":" +  this._protoTask.minute;
		/* Return the actual message the user will see */
		return this._cleanUpProto();
	}
	_cleanUpProto(){
	this.finishedTask = {
			text: this._protoTask.what,
			dateStart: this._protoTask.year !== null ? this._protoTask.year + "-" + this._protoTask.month + "-" + this._protoTask.day : moment(this.userTime).add(1, "hours").format("YYYY-MM-DD"),
			timeStart: this._protoTask.hour !== null ? this._protoTask.hour + "-" + this._protoTask.minute : moment(this.userTime).add(1, "hours").format("HH:mm"),
			tag: "Errands",
			completed: false,
			createdAt: new Date(new Date().getTime() - (new Date().getTimezoneOffset() * 60000)).getTime(),
			userId : null,
			desc : null,
			alarm: 5,
			sharingWith: []
		};
		this.finishedTask.dateEnd = moment(this.finishedTask.dateStart + "T" + this.finishedTask.timeStart,  "YYYY-MM-DDTHH:mm").add(1, "hours").format("YYYY-MM-DD");
		this.finishedTask.timeEnd = moment(this.finishedTask.timeStart, "HH:mm").add(1, "hours").format("HH:mm");
		this.finishedTask.timeUTC = moment(this.finishedTask.dateStart + "T" +  this.finishedTask.timeStart, "YYYY-MM-DDTHH:mm").utc().subtract( this.finishedTask.alarm, 'minutes').format().substring(0, 16);
		this.finishedTask.timeUTCEnd = moment(this.finishedTask.dateEnd + "T" +  this.finishedTask.timeEnd, "YYYY-MM-DDTHH:mm").utc().format().substring(0, 16);

		return this.finishedTask;
			}
	processThisAndNext(req) {
		let parsedDay = this._days.filter((day)=>{return req.toLowerCase().indexOf(day.toLowerCase()) !== -1})[0];
		this.addDayToProtoTask(this.findNextDayOfWeek(parsedDay));
	}
	processAt(req){
		let parsedTime;
		if(/\d{1,2}:\d{1,2}|\d{1,4}(AM|PM)|\d{1,2}:\d{1,2}(AM|PM)/i.test(req)){
			parsedTime = /\d{1,2}:\d{1,2}|\d{1,4}(AM|PM)|\d{1,2}:\d{1,2}(AM|PM)/i.exec(req)[0].toLowerCase() 
			if(/AM|PM/i.test(this._reqArray[this._reqArray.indexOf("at") + 1]) && parsedTime.length > 4){
				if(/AM|PM/i.exec(this._reqArray[this._reqArray.indexOf("at") + 1])[0].toLowerCase() === "pm" ){
					parsedTime = parseInt(parsedTime.substring(0,2), 10) + 12 + parsedTime.substring(2,5);
				} 
			}
			this.addTimeToProtoTask(moment(parsedTime, this._timeFormatDict[parsedTime.length]).format());
		} else {
			parsedTime = parseInt(this._reqArray[this._reqArray.indexOf("at") + 1], 10)
			if(isNaN(parsedTime) === false){
				parsedTime = moment().format("HH") >= parsedTime ? parsedTime + 12 : parsedTime;
				if(parsedTime !== null && parsedTime !== undefined) {
					this.addTimeToProtoTask(moment(parsedTime, "HH").format());
				}
			}
		}
	}
	processForAndOn(req){
		/* Check if they're providing a day of week */
		let parsedDay = /on\s(\D{3,7}day)/i.test(req) ? /on\s(\D{3,7}day)/i.exec(req)[1] : null;
		if(parsedDay === null){
			let dayBuilder = "";
			/* Input is something like "on August 29th" get the month and see if there is a following day and year */
			for(var i = 0; i < 12; ++i){
				let regexp = new RegExp("on\\s(" + this._months[i] + ")", "i");
				if(regexp.test(req)){
					/* add month */
					let monthResult = regexp.exec(req)[1];
					dayBuilder += moment(monthResult, "MMMM").format("MM") + " " ;
					if(/(\d{1,2})(st|nd|rd|th)/.test(this._reqArray[this._reqArray.indexOf(monthResult) + 1])){
						/* add day if exists */
						dayBuilder += moment(/(\d{1,2})(st|nd|rd|th)/.exec(this._reqArray[this._reqArray.indexOf(monthResult) + 1])[1], "DD").format("DD") + " " ;
						if(/\d{4}/.test(this._reqArray[this._reqArray.indexOf(monthResult) + 2])){
							/* add year if exists after date */
							dayBuilder += /\d{4}/.exec(this._reqArray[this._reqArray.indexOf(monthResult) + 2])[0];
						}
					}
					if(/\d{4}/.test(this._reqArray[this._reqArray.indexOf(monthResult) + 1])){
						/* add year if exists */
						dayBuilder += /\d{4}/.exec(this._reqArray[this._reqArray.indexOf(monthResult) + 1]);
					}
					return moment(dayBuilder, this.onDateFormatDict[dayBuilder.length]).format();
				}
			}
		} else {
			/* If the user specifies a day of the week add it to the task. If the week day has already passed for this week, use next week*/
			return moment(parsedDay, "dddd").format("e") <= moment().format("e") ? moment(parsedDay, "dddd").add(7, 'days').format() : moment(parsedDay, "dddd").format();
		}
	}
}