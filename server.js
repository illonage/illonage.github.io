var express = require("express");
var cookieParser = require("cookie-parser");
var request = require('request');


const app = express();

app.use(cookieParser());
// make all the files in 'public' available
// https://expressjs.com/en/starter/static-files.html
app.use(express.static("public"));

// -------------------------------------------------- //
// Variables
// -------------------------------------------------- //
var clientID = process.env.clientID;
var redirectURI = process.env.redirectURI;
var clientSecret = process.env.clientSecret;



// https://expressjs.com/en/starter/basic-routing.html
app.get("/", (request, response) => {
  console.log("got here");
  //response.redirect('views/index.html');
  response.sendFile(__dirname + "/views/index.html");
});

app.get("/redirect", function(req, res) {
  // get our authorization code
  authCode = req.query.code;
  console.log(authCode);
  // Set up a request for an long-lived Access Token now that we have a code
  var requestObject = {
      'client_id': clientID,
      'redirect_uri': redirectURI,
      'client_secret': clientSecret,
      'code': authCode,
      'scope': 'instagram_basic, pages_show_list, instagram_manage_insights, pages_read_engagement, pages_show_list, ads_management, business_management'
  };
  
  var token_request_header = {
      'Content-Type': 'application/x-www-form-urlencoded'
  };
  
  // Build the post request for the OAuth endpoint
  var options = {
      method: 'POST',
      url: 'https://graph.facebook.com/v8.0/oauth/access_token?',
      form: requestObject,
      headers: token_request_header
  };
  
  // Make the request
  request(options, function (error, response, body) {
    if (!error) {
      // We should receive  { access_token: ACCESS_TOKEN }
      // if everything went smoothly, so parse the token from the response
      
      body = JSON.parse(body);
      console.log(body);
      var accessToken = body.access_token;
      console.log('accessToken: ' + accessToken);

      // Set the token in cookies so the client can access it
      res.cookie('accessToken', accessToken, { });

      // Head back to the WDC page
      res.sendFile(__dirname + "/views/index.html");
    } else {
      console.log(error);
    }
  });

  
  
});

// -------------------------------------------------- //
// Create and start our server
// -------------------------------------------------- //
const listener = app.listen(process.env.PORT, () => {
  console.log("Your app is listening on port " + listener.address().port);
});
