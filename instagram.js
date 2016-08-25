(function() {
  'use strict';

  // This config stores the important strings needed to
  // connect to the foursquare API and OAuth service
  //
  // Storing these here is insecure for a public app
  // See part II. of this tutorial for an example of how
  // to do a server-side OAuth flow and avoid this problem
  var config = {
      clientId: '021d6ed7e5604c33924542e62a3d0a2e',
      redirectUri: 'https://illonage.github.io/',
      authUrl: 'https://api.instagram.com',
  };

  // Called when web page first loads and when
  // the OAuth flow returns to the page
  //
  // This function parses the access token in the URI if available
  // It also adds a link to the foursquare connect button
  $(document).ready(function() {
      if((window.location.href).indexOf('#') != -1) {
        var queryString = (window.location.href).substr((window.location.href).indexOf('?') + 1); 
        var value = (queryString.split('='))[1];

    // "value" will now contain fdasdas%20ad%20asd%20ad%20asdas

          var accessToken = decodeURIComponent(value);

    // "value" will now contain fdasdas ad asd ad asdas (unescaped value)
}
      var hasAuth = accessToken && accessToken.length > 0;
      updateUIWithAuthState(hasAuth);

      $("#connectbutton").click(function() {
          doAuthRedirect();
      });

      $("#submitButton").click(function() {
          var tickerSymbol = $('#ticker').val().trim();
          tableau.connectionData = tickerSymbol;
          tableau.connectionName = "Results for " + tickerSymbol;
          tableau.submit();
      });
  });

  // An on-click funcion for the connect to foursquare button,
  // This will redirect the user to a foursquare login
  function doAuthRedirect() {
      var appId = config.clientId;
      if (tableau.authPurpose === tableau.authPurposeEnum.ephemerel) {
        appId = config.clientId;
      } else if (tableau.authPurpose === tableau.authPurposeEnum.enduring) {
        appId = config.clientId; // This should be the Tableau Server appID
      }

      var url = config.authUrl + '/oauth/authorize/?client_id=' + appId +
              '&redirect_uri=' + config.redirectUri +'&response_type=token';
      window.location.href = url;
  }

  //------------- OAuth Helpers -------------//
  // This helper function returns the URI for the venueLikes endpoint
  // It appends the passed in accessToek to the call to personalize the call for the user
  function getHashtag(accessToken, tickerSymbol,next_max_tag_id) {
      return "https://api.instagram.com/v1/tags/"+ tickerSymbol +"/media/recent?access_token=" +
              accessToken+"&max_tag_id="+next_max_tag_id+"count=100";
  }

  // This function togglels the label shown depending
  // on whether or not the user has been authenticated
  function updateUIWithAuthState(hasAuth) {
      if (hasAuth) {
          $(".notsignedin").css('display', 'none');
          $(".signedin").css('display', 'block');
      } else {
          $(".notsignedin").css('display', 'block');
          $(".signedin").css('display', 'none');
      }
  }

  //------------- Tableau WDC code -------------//
  // Create tableau connector, should be called first
  var myConnector = tableau.makeConnector();

  // Init function for connector, called during every phase but
  // only called when running inside the simulator or tableau
      myConnector.init = function(initCallback) {
      tableau.authType = tableau.authTypeEnum.custom;

      // If we are in the auth phase we only want to show the UI needed for auth
      if (tableau.phase == tableau.phaseEnum.authPhase) {
        $("#getvenuesbutton").css('display', 'none');
      }

      if (tableau.phase == tableau.phaseEnum.gatherDataPhase) {
        // If API that WDC is using has an enpoint that checks
        // the validity of an access token, that could be used here.
        // Then the WDC can call tableau.abortForAuth if that access token
        // is invalid.
      }
       if((window.location.href).indexOf('#') != -1) {
        var queryString = (window.location.href).substr((window.location.href).indexOf('?') + 1); 
        var value = (queryString.split('='))[1];

    // "value" will now contain fdasdas%20ad%20asd%20ad%20asdas

    var accessToken = decodeURIComponent(value);

    // "value" will now contain fdasdas ad asd ad asdas (unescaped value)
}
      console.log("Access token is '" + accessToken + "'");
      var hasAuth = (accessToken && accessToken.length > 0) || tableau.password.length > 0;
      updateUIWithAuthState(hasAuth);

      initCallback();

      // If we are not in the data gathering phase, we want to store the token
      // This allows us to access the token in the data gathering phase
      if (tableau.phase == tableau.phaseEnum.interactivePhase || tableau.phase == tableau.phaseEnum.authPhase) {
          if (hasAuth) {
              tableau.password = accessToken;

              if (tableau.phase == tableau.phaseEnum.authPhase) {
                // Auto-submit here if we are in the auth phase
                tableau.submit()
              }

              return;
          }
      }
  };

  // Declare the data to Tableau that we are returning from Foursquare
  myConnector.getSchema = function(schemaCallback) {
      var cols = [
        { id : "username", alias : "username", dataType : tableau.dataTypeEnum.string},
         {  id : "filter", alias : "filter", dataType : tableau.dataTypeEnum.string },
         {  id : "likes", alias : "likes", dataType : tableau.dataTypeEnum.float },
         {  id : "tags", alias : "tags", dataType : tableau.dataTypeEnum.string },
         {  id : "created_time", alias : "created_time", dataType : tableau.dataTypeEnum.datetime },
         {  id : "link", alias : "link", dataType : tableau.dataTypeEnum.string },
         {  id : "location", alias : "location", dataType : tableau.dataTypeEnum.string },
         { id : "lat", alias : "latitude", dataType : tableau.dataTypeEnum.float },
         { id : "lon", alias : "longitude", dataType : tableau.dataTypeEnum.float },
         
    ];

    var tableInfo = {
        id : "instagramFeed",
        alias : "Hashtag Feed",
        columns : cols
    };

    schemaCallback([tableInfo]);
  };

  // This function acutally make the foursquare API call and
  // parses the results and passes them back to Tableau
  myConnector.getData = function(table, doneCallback) {
      var dataToReturn = [];
      var hasMoreData = false;
      var next_max_tag_id = 0;
      for (var i = 0; i < 10; i++) {
          var accessToken = tableau.password;
          var tickerSymbol = tableau.connectionData;
          var connectionUri = getHashtag(accessToken,tickerSymbol,next_max_tag_id);

          var xhr = $.ajax({
            url: connectionUri,
            type: "GET",
            crossDomain: true,
            dataType: 'jsonp',
          success: function (data) {
            var feat = data.data;
            next_max_tag_id = data.pagination.next_max_tag_id;
            var tableData = [];
                  for (var i = 0; i < feat.length; i++) {
                    for (var ii = 0; ii < 5; ii++) {
                      var date = new Date(parseInt(feat[i].created_time) * 1000);
                      var dateFinal = date.getDate()+"/"+ (date.getMonth()+1) +"/"+ date.getFullYear()+" "+date.getHours()+":"+date.getMinutes()+":"+date.getSeconds();
            //var d = new Date (dateFinal);
          }
              if (feat[i].location && feat[i].location !== "null" && feat[i].location !== "undefined") {
                var location =  feat[i].location["name"];
                var lon = feat[i].location.longitude;
                var lat = feat[i].location.latitude;
          }

              else{
                var location =  "";
                var lon = "";
                var lat = "";
                  }

            tableData.push({
                "username": feat[i].user.username,
                "filter": feat[i].filter,
                "likes": feat[i].likes.count,
                "tags": feat[i].tags.toString(),
                "created_time": dateFinal,
                "link": feat[i].link,
                "location": location,
                "lon": lon,
                "lat": lat
            

            });
        }

        table.appendRows(tableData);
        doneCallback();

             
          },
          error: function (xhr, ajaxOptions, thrownError) {
              // WDC should do more granular error checking here
              // or on the server side.  This is just a sample of new API.
              tableau.abortForAuth("Invalid Access Token");
          }
      });
  };}

  // Register the tableau connector, call this last
  tableau.registerConnector(myConnector);
})();
