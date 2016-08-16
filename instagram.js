(function () {
    var myConnector = tableau.makeConnector();

    myConnector.getSchema = function (schemaCallback) {
    var cols = [
        { id : "username", alias : "username", dataType : tableau.dataTypeEnum.string},
       	 {  id : "filter", alias : "filter", dataType : tableau.dataTypeEnum.string },
       	 {  id : "count", alias : "count", dataType : tableau.dataTypeEnum.float },
       	 {  id : "tags", alias : "tags", dataType : tableau.dataTypeEnum.string },
       	 
    ];

    var tableInfo = {
        id : "instagramFeed",
        alias : "Hashtag Foodporn",
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
            tableData.push({
                "username": feat[i].user.username,
                "filter": feat[i].filter,
                "count": feat[i].likes.count,
                "tags": feat[i].tags

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