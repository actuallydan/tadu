import bodyParser from 'body-parser';


Picker.middleware(bodyParser.urlencoded({ extended: true }));
/* Listen for SMS HTTP requests */
Picker.route('/sms', (params, req, res, next) => {
  // if(req !== undefined && req.hasOwnProperty()){
  // console.log("Received text", req.body);
  // req.write();
  // req.end();
  let xml = 'You said: ' + req.body.Body;
    // return [200, {"Content-Type": "text/xml"}, xml];
    // res.write(xml, {"Content-Type": "text/xml"});
    Meteor.apply("sendSMS", [req.body.From, xml]);

    res.writeHead(200, {
	    "Content-Type": "text/xml",
	});
    res.end();
    return null;
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