'use strict';

// Wrap everything in an anonymous function to avoid poluting the global namespace
(function () {
  // Use the jQuery document ready signal to know when everything has been initialized
  $(document).ready(function () {
    // Tell Tableau we'd like to initialize our extension
    tableau.extensions.initializeAsync().then(function () {
      // Once the extensions is initialized, ask the user to choose a sheet
      document.getElementById("location").addEventListener("click", getLocation());
      //getLocation();
      //showImage();
    });
  });

  /**
   * Shows the choose sheet UI. Once a sheet is selected, the data table for the sheet is shown
   */

   let unregisterEventHandlerFunction;

  
  function getLocation(){

    if (navigator.geolocation) {
        console.log('test');
        navigator.geolocation.getCurrentPosition(showPosition, error,{timeout:5000});
    } else {
        console.log("Geolocation is not supported by this browser.");
    }


  };


  function showPosition(position) {
    console.log("test");
    console.log(position.coords.latitude); 
};

function error(err) {
  console.log("test");
  console.warn(`ERROR(${err.code}): ${err.message}`);
};

  function returnURL(worksheetName, fieldName){

    if (unregisterEventHandlerFunction) {
      unregisterEventHandlerFunction();
    }
    const worksheet = getSelectedSheet(worksheetName);
    console.log(worksheet)
    var options = {
  maxRows: 0,
  ignoreAliases: false,
  ignoreSelection: true,
  includeAllColumns: false
};
    worksheet.getSelectedMarksAsync(options).then(function (marks) {
      console.log(marks);
      
      // Get the first DataTable for our selected marks (usually there is just one)
      
      const worksheetData = marks.data[0];
      var index = 0;
      var indexName;
      var indexPrice;
      for(var i =0; i<worksheetData.columns.length;i++){

          if (worksheetData.columns[i].fieldName==fieldName) {
              index = worksheetData.columns[i].index;
          }
          else if (worksheetData.columns[i].fieldName=="Product Name") {
              indexName = worksheetData.columns[i].index;
          }
          else if (worksheetData.columns[i].fieldName=="SUM(Price)") {
              indexPrice = worksheetData.columns[i].index;
          }
      }

      // Map our data into the format which the data table component expects it
      const data = worksheetData.data.map(function (row) {
         const rowData = row.map(function (cell) {

          return cell.formattedValue;

        });
        return ([rowData[index], rowData[indexName], rowData[indexPrice]]);
            

        ;
      });

      

      
      // Populate the data table with the rows and columns we just pulled out
      displayURL(data);



    });
    
    unregisterEventHandlerFunction = worksheet.addEventListener(tableau.TableauEventType.MarkSelectionChanged, function (selectionEvent) {
      
      returnURL(worksheetName,fieldName);
    });

  }

  function getSelectedSheet (worksheetName) {
    // go through all the worksheets in the dashboard and find the one we want
    return tableau.extensions.dashboardContent.dashboard.worksheets.find(function (sheet) {
      return sheet.name === worksheetName;
    });
  }


  function displayURL(results){
    $('#selected_marks').empty();
    for (var i = 0; i < results.length; i++) {
      var str = results[i][0]+" ";
      var names = results[i][1] +" ";
      var prices = results[i][2] +" ";
      var tableNames = names.split(",");
      var tableImages = str.split(",");
      var tablePrices = prices.split(",");
      const image = $(`<tr><td>${tableNames}    </td><td><img src="
      ${tableImages}"width="192" height="288"></td><td>${tablePrices}</td></</tr>`);
      $('#selected_marks').append(image);

   }

   
     
  }

  function createButton (buttonTitle) {
    const button =
    $(`<button type='button' class='btn btn-default btn-block'>
      ${buttonTitle}
    </button>`);
    return button;
  }

  // This variable will save off the function we can call to unregister listening to marks-selected events


 

  function initializeButtons () {
    $('#show_choose_sheet_button').click(showChooseSheetDialog);
  }

  function getSelectedSheet (worksheetName) {
    // go through all the worksheets in the dashboard and find the one we want
    return tableau.extensions.dashboardContent.dashboard.worksheets.find(function (sheet) {
      return sheet.name === worksheetName;
    });
  }
})();
