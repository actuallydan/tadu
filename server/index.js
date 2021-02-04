import bodyParser from 'body-parser';
import moment from 'moment';

const twilioClient = new Twilio({
	from: Meteor.settings.TWILIO.FROM,
	sid: Meteor.settings.TWILIO.SID,
	token: Meteor.settings.TWILIO.TOKEN
});

Picker.middleware(bodyParser.urlencoded({ extended: true }));
/* Listen for SMS HTTP requests */
Picker.route('/sms', (params, req, res, next) => {
	// console.log("Received text", req.DateSent, req.body);

	// Meteor.wrapAsync(()=>{
	// 	twilioClient.sms.messages(req.body.Body.SmsMessageSid).get((err, sms)=>{
	// 		console.log(sms.body);
	// 	});
	// });

	let xml = 'You said: ' + req.body.Body;

	/* Send off message to be parsed 
	Take in the user's request, the userObj, (found from searching through the DB by phone number), and the local time a a moment().
	To accurately parse a SMS request for a task we need the client time.
	For now, this will just have to be the server time until I can get the user's time or timezone from the SMS being sent to Twilio.
	*/
	let messageTime = moment();
	/* Get User by phone number */
	let userObj = Meteor.users.findOne({profile: {phone : req.body.From.replace("+", "")}});
	/* If the user doesn't exist send them some sort of response */
	if(userObj === undefined){
		Meteor.apply("sendSMS", [req.body.From, "Hey there! Thanks for using Tadu! Unfortunately, we don't recognize this number. Please make an account at https://tadu.herokuapp.com."]);
		res.writeHead(200, {"Content-Type": "text/xml"});
		res.end();
		return null;
	}
	/* User exists */
	Meteor.apply("parse", [req.body.Body, thisUser, messageTime], (err, data)=>{
		if(err){
			Meteor.apply("sendSMS", [req.body.From, "Thanks for using Tadu! Unfortunately, There was an error processing your request. Please try again later"]);
			res.writeHead(200, {"Content-Type": "text/xml"});
			res.end();
			return null;
		} else {
			Meteor.apply("sendSMS", [req.body.From, "Okay! I have " +  data.text + " scheduled for " + moment(data.dateStart + "T" + data.timeStart).format("MMM dd YYYY @ hh:mm a")]);
			res.writeHead(200, {"Content-Type": "text/xml"});
			res.end();
			return null;
		}
	});
});

/*
req.body looks like this :
{ 
	ToCountry: 'US',
	ToState: 'MD',
	SmsMessageSid: 'SMbe4eac40df32888728d7b6ea43357101',
	NumMedia: '0',
	ToCity: 'WESTMINSTER',
	FromZip: '17360',
	SmsSid: 'SMbe4eac40df32888728d7b6ea43357101',
	FromState: 'PA',
	SmsStatus: 'received',
	FromCity: 'YORK',
	Body: 'Hsudjd',
	FromCountry: 'US',
	To: '+14437323133',
	ToZip: '21102',
	NumSegments: '1',
	MessageSid: 'SMbe4eac40df32888728d7b6ea43357101',
	AccountSid: 'AC8632c118830ff24091b3f214e5af547f',
	From: '+17177936991',
	ApiVersion: '2010-04-01' 
}
*/