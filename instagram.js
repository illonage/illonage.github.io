(function () {
    var myConnector = tableau.makeConnector();

    myConnector.getSchema = function (schemaCallback) {
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

    myConnector.getData = function (table, doneCallback) {
    		var tickerSymbol = tableau.connectionData;
    	    $.getJSON('http://cors.io/?u=https://api.instagram.com/v1/tags/'+tickerSymbol+'/media/recent?access_token=347489561.021d6ed.bd716035076d4a24ac59f1e4fd486099', function(resp) {
        	
           tableau.log(resp);
           
        	var feat = resp.data,
           tableData = [];
           

        // Iterate over the JSON object
        for (var i = 0; i < feat.length; i++) {
        	for (var ii = 0; ii < 5; ii++) {
        		var date = new Date(parseInt(feat[i].created_time) * 1000);
        		var dateFinal = date.getDate()+"/"+ (date.getMonth()+1) +"/"+ date.getFullYear()+" "+date.getHours()+":"+date.getMinutes()+":"+date.getSeconds();
        		//var d = new Date (dateFinal);
        	}
        	if (feat[i].location && feat[i].location !== "null" && feat[i].location !== "undefined") {
        		var location = 	feat[i].location["name"];
        		var lon = feat[i].location.longitude;
        		var lat = feat[i].location.latitude;
        	}

        	else
        	{
        		var location = 	"";
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
    });

    };

    tableau.registerConnector(myConnector);

    $(document).ready(function () {

    $("#submitButton").click(function () {
    	var tickerSymbol = $('#ticker').val().trim();
    	tableau.connectionData = tickerSymbol;
        tableau.connectionName = "Results for " + tickerSymbol;
        tableau.submit();
    });
});
})();