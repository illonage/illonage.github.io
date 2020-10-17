function statusChangeCallback(response) {  // Called with the results from FB.getLoginStatus().
    console.log('statusChangeCallback');
    var accessToken = response.authResponse.accessToken;
    console.log(accessToken);
    console.log(response);                   // The current login status of the person.
    if (response.status === 'connected') {   // Logged into your webpage and Facebook.
      testAPI();  
    } else {                                 // Not logged into your webpage or we are unable to tell.
      document.getElementById('status').innerHTML = 'Please log ' +
        'into this webpage.';
    }
  }


  function checkLoginState() {               // Called when a person is finished with the Login Button.
    FB.getLoginStatus(function(response) {   // See the onlogin handler
      statusChangeCallback(response);
    });
  }


  window.fbAsyncInit = function() {
    FB.init({
      appId      : '2639168876413775',
      cookie     : true,                     // Enable cookies to allow the server to access the session.
      xfbml      : true,                     // Parse social plugins on this webpage.
      version    : 'v8.0'           // Use this Graph API version for this call.
    });


    FB.getLoginStatus(function(response) {   // Called after the JS SDK has been initialized.
      statusChangeCallback(response);        // Returns the login status.
    });
  };
 
  function testAPI() {                      // Testing Graph API after login.  See statusChangeCallback() for when this call is made.
    console.log('Welcome!  Fetching your information.... ');
    FB.api('/me', function(response) {
      console.log('Successful login for: ' + response.name);
      document.getElementById('status').innerHTML =
        'Thanks for logging in, ' + response.name + '!';
    });
  }

  (function(){
    'use strict';
    $(document).ready(function() {
      var hasAuth = accessToken && accessToken.length > 0;
      let pageId = await getPageId();
      console.log(pageId);
      $("#submitButton").click(function() { 
          tableau.connectionName = "Results for Instagram";
          tableau.submit();
      });
    });

   async function getPageId(){
     let url = 'https://graph.facebook.com/v8.0/me/accounts?access_token=' + accessToken;
     try {
       let res = await fetch(url);
       return await res.data[0].id;
     } catch(error){
       console.log(error);
     }
    }
    
  })
