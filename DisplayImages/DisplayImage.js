'use strict';

// Wrap everything in an anonymous function to avoid poluting the global namespace
(function () {
  // Use the jQuery document ready signal to know when everything has been initialized
  $(document).ready(function () {
    // Tell Tableau we'd like to initialize our extension
    tableau.extensions.initializeAsync().then(function () {
      // Once the extensions is initialized, ask the user to choose a sheet
      showChooseSheetDialog();
      initializeButtons ();
      //showImage();
    });
  });

  /**
   * Shows the choose sheet UI. Once a sheet is selected, the data table for the sheet is shown
   */

   let unregisterEventHandlerFunction;

   function showChooseSheetDialog(){
    $('#choose_sheet_buttons').empty();
    const dashboardName = tableau.extensions.dashboardContent.dashboard.name;
    $('#choose_sheet_title').text(dashboardName);
    const worksheets = tableau.extensions.dashboardContent.dashboard.worksheets;
    worksheets.forEach(function (worksheet) {
      // Declare our new button which contains the sheet name
      const button = createButton(worksheet.name);

      // Create an event handler for when this button is clicked
      button.click(function () {
        // Get the worksheet name which was selected
        const worksheetName = worksheet.name;

        // Close the dialog and show the data table for this worksheet
        $('#choose_sheet_dialog').modal('toggle');
        returnURL(worksheetName);
      });

      // Add our button to the list of worksheets to choose from
      $('#choose_sheet_buttons').append(button);
    });

    // Show the dialog
    $('#choose_sheet_dialog').modal('toggle');

   }



  function showImage () {
    // Clear out the existing list of sheets
    $('#choose_sheet_buttons').empty();

    // Set the dashboard's name in the title
    const dashboardName = tableau.extensions.dashboardContent.dashboard.name;
    


    // The first step in choosing a sheet will be asking Tableau what sheets are available
    const worksheets = tableau.extensions.dashboardContent.dashboard.worksheets;
    
    // Next, we loop through all of these worksheets add add radio buttons for each one
    worksheets.forEach(function (worksheet) {
      // Declare our new button which contains the sheet name
      if (worksheet.name == "Collection Sales") {

        returnURL(worksheet.name);

      }
      
    });

     

    // Show the dialog
    
  }


  function returnURL(worksheetName){
    if (unregisterEventHandlerFunction) {
      unregisterEventHandlerFunction();
    }
    const worksheet = getSelectedSheet(worksheetName);
    
    // Set our title to an appropriate value
    worksheet.getSelectedMarksAsync().then(function (marks) {
      // Get the first DataTable for our selected marks (usually there is just one)
      const worksheetData = marks.data[0];
      

      // Map our data into the format which the data table component expects it
      const data = worksheetData.data.map(function (row) {
         const rowData = row.map(function (cell) {
          return cell.formattedValue;
        });

         for(var i =0; i<rowData.length;i++){
            if (rowData[i].includes("http")){
              return (rowData[i]);
            }
          }

        ;
      });

      const name = worksheetData.data.map(function (row) {
         const rowData = row.map(function (cell) {
          return cell.formattedValue;
        });
        
          return (rowData[0]);

      });

      

      // Populate the data table with the rows and columns we just pulled out
      displayURL(data,name);


    });
    
    unregisterEventHandlerFunction = worksheet.addEventListener(tableau.TableauEventType.MarkSelectionChanged, function (selectionEvent) {
      
      returnURL(worksheetName);
    });

  }

  function getSelectedSheet (worksheetName) {
    // go through all the worksheets in the dashboard and find the one we want
    return tableau.extensions.dashboardContent.dashboard.worksheets.find(function (sheet) {
      return sheet.name === worksheetName;
    });
  }


  function displayURL(URL,name){
    $('#selected_marks').empty();
    var str = URL+" ";
    var names = name +" ";
    var tableNames = names.split(",");
    var tableImages = str.split(",");
    console.log(tableNames);
    for (var i = 0; i < tableImages.length; i++) {
     const image = $(`<center><img src="
      ${tableImages[i]}"width="15%" height="15%"></center>`);

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
