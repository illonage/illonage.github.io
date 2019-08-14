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
      max_iteration: 20,
  };

  // Called when web page first loads and when
  // the OAuth flow returns to the page
  //
  // This function parses the access token in the URI if available
  // It also adds a link to the foursquare connect button
  $(document).ready(function() {

      //script to get the access Token
      if((window.location.href).indexOf('#') != -1) {
        var queryString = (window.location.href).substr((window.location.href).indexOf('?') + 1); 
        var value = (queryString.split('='))[1];
        var accessToken = decodeURIComponent(value);
      }

      var hasAuth = accessToken && accessToken.length > 0;
      updateUIWithAuthState(hasAuth);

      $("#connectbutton").click(function() {
          doAuthRedirect();
      });

      $("#submitButton").click(function() {
        if (document.getElementById('gg') !== null && document.getElementById('gg')  !== '') {
          var type = document.getElementById('gg').textContent;
          var variable = $('#ticker').val().trim();
        }
        else{ var type = "empty";
        var variable = "empty";}
          //var type = document.getElementById('gg').textContent;
          
          tableau.connectionData = JSON.stringify({'type':type,'variable': variable});
          tableau.connectionName = "Results for " + type +" "+ variable;
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
              '&redirect_uri=' + config.redirectUri +'&response_type=token&scope=basic';
      window.location.href = url;
  }

  //------------- OAuth Helpers -------------//
  // This helper function returns the URI for the venueLikes endpoint
  // It appends the passed in accessToek to the call to personalize the call for the user
  function getHashtag(accessToken, tickerSymbol) {
    
      return "https://api.instagram.com/v1/tags/"+ tickerSymbol +"/media/recent?count=5&access_token=" +
              accessToken;
  }


  function getUser(accessToken, tickerSymbol) {
      
     return "https://api.instagram.com/v1/users/search?q="+ tickerSymbol +"&access_token=" +
              accessToken;

  }



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
        var accessToken = decodeURIComponent(value);
      }
      
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

  myConnector.getSchema = function(schemaCallback) {
      var cols = [
        { id : "username", alias : "username", dataType : tableau.dataTypeEnum.string},
         {  id : "filter", alias : "filter", dataType : tableau.dataTypeEnum.string },
         {  id : "likes", alias : "Number of likes", dataType : tableau.dataTypeEnum.float },
         {  id : "tags", alias : "tags", dataType : tableau.dataTypeEnum.string },
         {  id : "created_time", alias : "Created Time", dataType : tableau.dataTypeEnum.datetime },
         {  id : "link", alias : "Link", dataType : tableau.dataTypeEnum.string },
         {  id : "location", alias : "location", dataType : tableau.dataTypeEnum.string },
         { id : "lat", alias : "latitude", dataType : tableau.dataTypeEnum.float },
         { id : "lon", alias : "longitude", dataType : tableau.dataTypeEnum.float },
         { id : "nb_comments", alias : "number of Comments", dataType : tableau.dataTypeEnum.float },
         { id : "text", alias : "Text", dataType : tableau.dataTypeEnum.string },
         { id : "image_url", alias : "Image URL", dataType : tableau.dataTypeEnum.string },

         
    ];

    var tableInfo = {
        id : "instagramFeed",
        alias : "Instagram Feed",
        columns : cols
    };

    schemaCallback([tableInfo]);
  };

  function getHistory(table, doneCallback,connectionUri,count ) {
      var dataToReturn = [];
      var hasMoreData = false;
      var new_url = connectionUri;
      if (count == 0) {
        var iteration = count;
      }
      

      var getPage= function(connectionUri){
      var xhr = $.ajax({
        
          url: connectionUri,
          type: "GET",
          crossDomain: true,
          dataType: 'jsonp',
          success: function (data) {
            var feat = data.data;
            var tableData = [];
            for (var i = 0; i < feat.length; i++) {
                      var date = new Date(parseInt(feat[i].created_time) * 1000);
              // Hours part from the timestamp
              //var hours = date.getHours();
                      // Minutes part from the timestamp
                      //var minutes = date.getMinutes();
                      // Seconds part from the timestamp
                      //var seconds = date.getSeconds();

              //var dateFinal =  (date.getMonth()+1) +"/"+date.getDate()+"/"+ date.getFullYear()+" "+hours+":"+"0" +minutes+":"+"0" + date.getSeconds();
                      
            //var d = new Date (dateFinal);
          
              if (feat[i].caption ) {
                var text = feat[i].caption.text.toString();
              }
              else var text = " ";

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
                "created_time": date,
                "link": feat[i].link,
                "nb_comments": feat[i].comments.count,
                "location": location,
                "lon": lon,
                "lat": lat,
                "text": text,
                "image_url": feat[i].images.low_resolution.url,
            

            });
          }
        



         connectionUri = data.pagination.next_url;
         table.appendRows(tableData);
          if (connectionUri && iteration < 20) {
            iteration++;
            getPage(connectionUri);
          }
          else{
            doneCallback();
          } 
        
             
          },

      });


   }
    getPage(new_url)
 }

   // function getUserID(username,accessToken,cb){
   //    var xhr = $.ajax({
   //        url: getUser(accessToken, username) ,

   //        type: "GET",
   //        crossDomain: true,
   //        dataType: 'jsonp',

   //        success: function (data) {
            
   //            var user_id = data.data[0].id;
   //            cb(user_id);
      
   //          }

   //        })


   // }

   function getHistoryWithUserID(table, doneCallback,connectionUri,accessToken,count){

      var dataToReturn = [];
      var hasMoreData = false;
      var new_url = "https://api.instagram.com/v1/users/self/media/recent/?access_token="+accessToken;
      if (count == 0) {
        var iteration = count;
      }

      
      var getPage = function(url){
      var xhr = $.ajax({
          url: url,
          type: "GET",
          crossDomain: true,
          dataType: 'jsonp',
          success: function (data2) {
            var feat = data2.data;
            var tableData = [];
            for (var i = 0; i < feat.length; i++) {
              var date = new Date(parseInt(feat[i].created_time) * 1000);
            if (feat[i].caption ) {
              var text = feat[i].caption.text.toString();
            }
            else var text = " ";
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
              "created_time": date,
              "link": feat[i].link,
              "nb_comments": feat[i].comments.count,
              "location": location,
              "lon": lon,
              "lat": lat,
              "text": text,
              "image_url": feat[i].images.low_resolution.url,
            });
          }
         
          connectionUri = data2.pagination.next_url;
          table.appendRows(tableData);
          if (connectionUri &&  iteration < 20) {
            iteration++;
            getPage(connectionUri,count);
          }
          else{
            doneCallback();
          }    
        },
      });
    }
   getPage(new_url)
  }

   function getHistory3(username, table, doneCallback,connectionUri,accessToken,count){
    

      getHistoryWithUserID(table, doneCallback,connectionUri,accessToken,count)
      

   }


  
  // This function acutally make the foursquare API call and
  // parses the results and passes them back to Tableau
  myConnector.getData = function(table, doneCallback) {
      var lastId = parseInt(table.incrementValue || -1);
      var accessToken = tableau.password;

      //var variable = JSON.parse(tableau.connectionData).variable;
      var type = JSON.parse(tableau.connectionData).type;
      
      if (type == "Hashtag"){

        var variable = JSON.parse(tableau.connectionData).variable;
        var connectionUri = getHashtag(accessToken,variable);
        var count = 0;
        getHistory(table, doneCallback,connectionUri, count);
      }
      else{
        
        var connectionUri = getUser(accessToken,variable);
        var count = 0;
        getHistoryWithUserID(table, doneCallback,connectionUri,accessToken,count);

      }
      
    
  };

  // Register the tableau connector, call this last
  tableau.registerConnector(myConnector);
})();
