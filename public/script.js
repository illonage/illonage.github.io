var res;
var accessToken;
var userPage;

 var config = {
      appId: '2639168876413775',
      redirectUri: 'https://insta-wdc.glitch.me/redirect',
      authUrl: 'https://www.facebook.com/v8.0/dialog/oauth?'
  }; 

$(document).ready(function() {
  
  var accessToken = Cookies.get("accessToken");
  var hasAuth = accessToken && accessToken.length > 0;
  updateUIWithAuthState(hasAuth);
  if (accessToken !== "undefined" && hasAuth) {
    userPage = getUserPage(accessToken);
  }
  
  $("#connectbutton").click(function() {
      doAuthRedirect();
  });
  
  $("#submitButton").click(function() {
          tableau.connectionData = getPageId();
          tableau.connectionName = "Instagram Data";
          tableau.submit();
      });

  });

function doAuthRedirect() {
      var appId = config.appId;
      if (tableau.authPurpose === tableau.authPurposeEnum.ephemerel) {
        appId = config.appId;  // This should be Desktop
      } else if (tableau.authPurpose === tableau.authPurposeEnum.enduring) {
        appId = config.appId; // This should be the Tableau Server appID
      }
      var url = config.authUrl + 'client_id=' + appId +
              '&redirect_uri=' + config.redirectUri;
      window.location.href = url;
  } 

 function updateUIWithAuthState(hasAuth) {
      if (hasAuth) {
        $(".notsignedin").css('display', 'none');
        $(".connectbutton").css('display', 'block');
        
      } else {
          $(".notsignedin").css('display', 'block');
          $(".connectbutton").css('display', 'none');
      }
  }

function updateUIWithPage(pageToReturn){
  var myDiv = document.getElementById("pages");
  var h = document.getElementById("h");
  var text = document.createTextNode("Select your Facebook Page:");
  h.appendChild(text); 
  
  h.appendChild(text); 
    for (var i = 0; i< pageToReturn.length; i++){
      var checkbox = document.createElement('input');
      checkbox.type = "checkbox"; 
      checkbox.name = "table";
      checkbox.value = pageToReturn[0][i].id; 
      checkbox.id = "checkbox";
      var label = document.createElement('label'); 
      label.htmlFor = pageToReturn[i].name; 
      label.appendChild(document.createTextNode(pageToReturn[0][i].name)); 
      var space = 
      myDiv.appendChild(checkbox); 
      myDiv.appendChild(label); 
    }
}

function getUserPage(accessToken){
  var connectionUri = "https://graph.facebook.com/v8.0/me/accounts?access_token="+accessToken;
  var pageToReturn = [];
  var xhr = $.ajax({
    url: connectionUri,
    dataType: 'json',
          success: function (resp) {
            console.log(resp.data);
              if (resp.data) {
                var ii;
                for (ii = 0; ii < resp.data.length; ++ii) {
                  pageToReturn.push(resp.data);
                  updateUIWithPage(pageToReturn);
                  
                }
              }
              else {
                    tableau.abortWithError("No results found");
                }
          },
          error: function (xhr, ajaxOptions, thrownError) {
              // WDC should do more granular error checking here
              // or on the server side.  This is just a sample of new API.
              tableau.abortForAuth("Invalid Access Token");
          }
  })
  console.log(pageToReturn);
  return pageToReturn;
}

async function getInstagramId(accessToken,pageId){
  var connectionUri = "https://graph.facebook.com/v8.0/"+pageId+"?fields=instagram_business_account&access_token="+accessToken;
  var pageToReturn = [];
  var id;
  var xhr = await $.ajax({
    url: connectionUri,
    dataType: 'json',
          success: function (resp) {
            console.log(resp);
              if (resp) {
                console.log(resp);
                id = resp.instagram_business_account.id;
                
              }
              else {
                    tableau.abortWithError("No results found");
                }
          },
          error: function (xhr, ajaxOptions, thrownError) {
              // WDC should do more granular error checking here
              // or on the server side.  This is just a sample of new API.
              tableau.abortForAuth("Invalid Access Token");
          }
  })
  return id;
}

function getPageId(){
  var cbs = document.forms[0];
  for(var i=0,cbLen=cbs.length;i<cbLen;i++){
    if(cbs[i].checked){
      console.log(cbs[i].value);
      return cbs[i].value;
    } 
  }
}

  var myConnector = tableau.makeConnector();

  // Init function for connector, called during every phase but
  // only called when running inside the simulator or tableau
  myConnector.init = function(initCallback) {
      tableau.authType = tableau.authTypeEnum.custom;
      
      // If we are in the auth phase we only want to show the UI needed for auth
      if (tableau.phase == tableau.phaseEnum.authPhase) {
        $("#submitButton").css('display', 'none');
      }

      if (tableau.phase == tableau.phaseEnum.gatherDataPhase) {
        // If API that WDC is using has an endpoint that checks
        // the validity of an access token, that could be used here.
        // Then the WDC can call tableau.abortForAuth if that access token
        // is invalid.
      }

      var accessToken = Cookies.get("accessToken");


      console.log("Access token is '" + accessToken + "'");
      var hasAuth = (accessToken && accessToken.length > 0) || tableau.password.length  > 0;
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
      var schema = [];

      var col1 = { id: "mediaUrl", dataType: "string"};
      var col2 = { id: "likes", dataType: "int"};
      var col3 = { id: "comments_count", alias: "Number of Comments" ,dataType: "int"};
      var col4 = { id: "timestamp", alias: "Publication date" ,dataType: "datetime"};
      var col5 = { id: "caption", dataType: "string"};
      var cols = [col1,col2,col3, col4, col5];

      var tableInfo = {
        id: "InstagramTable",
        columns: cols
      }

      schema.push(tableInfo);

      schemaCallback(schema);
  };

myConnector.getData = function(table, doneCallback) {
      var dataToReturn = [];
      var hasMoreData = false;
      var iteration = 0;
      var dateFormat = "Y-MM-DD HH:mm:ss";

      
      var pageId = tableau.connectionData;
      var accessToken = tableau.password;
      console.log(accessToken);
      console.log(pageId);
      var InstragramId;
      getInstagramId(accessToken, pageId).then(function(result) {
      InstragramId = result;
      
      var connectionUri = "https://graph.facebook.com/v8.0/"+InstragramId+"/media?fields=like_count,comments_count,media_url,timestamp,caption&access_token="+accessToken;
      
      var getPage = function(url){
        var xhr = $.ajax({
            url: connectionUri,
            dataType: 'json',
            success: function (resp) {
                if (resp.data) {
                    var ii;
                    for (ii = 0; ii < resp.data.length; ++ii) {
                        var createdDate = moment(resp.data[ii].timestamp).format(dateFormat);
                        //var engagement = getInsights(resp.data[ii].id,accessToken);
                        var post = {'mediaUrl': resp.data[ii].media_url,
                                   'likes': resp.data[ii].like_count,
                                   'comments_count': resp.data[ii].comments_count,
                                   'timestamp': createdDate,
                                   'caption': resp.data[ii].caption
                                   };
                        dataToReturn.push(post);
                    }
                    connectionUri = resp.paging.next;
                    table.appendRows(dataToReturn);
                    if (connectionUri && iteration < 20) {
                      iteration++;
                      getPage(connectionUri);
                    }
                    else{
                      doneCallback();
                    }
                }
                else {
                    tableau.abortWithError("No results found");
                }
            },
            error: function (xhr, ajaxOptions, thrownError) {
                // WDC should do more granular error checking here
                // or on the server side.  This is just a sample of new API.
                tableau.abortForAuth("Invalid Access Token2");
            }
        });
      }
      getPage(connectionUri);
  });
  
  };

  // Register the tableau connector, call this last
  tableau.registerConnector(myConnector);
