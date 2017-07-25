/* Listen for SMS HTTP requests */
Picker.route('/sms', (params, req, res, next) => {
  // if(req !== undefined && req.hasOwnProperty()){
  res.writeHead(200);
  console.log("Received text", req.body);
  res.end("Hello world from: " + Meteor.release);
// }
});