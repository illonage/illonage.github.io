'use strict';

// Wrap everything in an anonymous function to avoid poluting the global namespace
(function () {
  // Use the jQuery document ready signal to know when everything has been initialized
  $(document).ready(function () {
    // Tell Tableau we'd like to initialize our extension
    tableau.extensions.initializeAsync().then(function () {
      // Once the extensions is initialized, ask the user to choose a sheet
      const savedSheetName = tableau.extensions.settings.get('sheet');
      const savedFieldName = tableau.extensions.settings.get('field');
      if (savedSheetName && savedFieldName) {
        returnURL(savedSheetName,savedFieldName);
      }
      else {
        showChooseSheetDialog();
      }
      
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
    
    const textFormat2 = $('<h4><font color="white">Select your sheet with the URL of the image</font></h4>');
    $('#choose_sheet_buttons').append(textFormat2);
    const worksheets = tableau.extensions.dashboardContent.dashboard.worksheets;

    worksheets.forEach(function (worksheet) {
      // Declare our new button which contains the sheet name
      const button = createButton(worksheet.name);

      // Create an event handler for when this button is clicked
      button.click(function () {
        // Get the worksheet name which was selected
        const worksheetName = worksheet.name;
        tableau.extensions.settings.set('sheet', worksheetName);
        // Close the dialog and show the data table for this worksheet
        tableau.extensions.settings.saveAsync().then(function () {
          $('#choose_sheet_dialog').modal('toggle');
          showChooseSelectionDialog(worksheetName);
        });
        
        
      });

      // Add our button to the list of worksheets to choose from
      $('#choose_sheet_buttons').append(button);
    });

    // Show the dialog
    $('#choose_sheet_dialog').modal('toggle');

   }

   function showChooseSelectionDialog(worksheetName){
    const worksheet = getSelectedSheet(worksheetName);

    const text = "Select the URL of the image to display";
    const textFormat = $('<h4><font color="white">Select the field that indicated the URL of the image to display</font></h4>');
    
    $('#choose_image_buttons').append(textFormat);
    //$('#choose_image_dialog').text(worksheet.name);
    worksheet.getSummaryDataAsync().then(function(data) {
      const columnsTable = data.columns;
      
      columnsTable.forEach(function (name) {
        const button2 = createButton(name.fieldName);
        button2.click(function () {
          const fieldName = name.fieldName;
          tableau.extensions.settings.set('field', fieldName);
          tableau.extensions.settings.saveAsync().then(function () {
            $('#choose_image_dialog').modal('toggle');
            returnURL(worksheetName,fieldName);
            });
        });

        $('#choose_image_buttons').append(button2);
      });
    });
    
    $('#choose_image_dialog').modal('toggle');
    //returnURL(worksheetName);
   }


  

  function returnURL(worksheetName, fieldName){
    if (unregisterEventHandlerFunction) {
      unregisterEventHandlerFunction();
    }
    const worksheet = getSelectedSheet(worksheetName);
    
    // Set our title to an appropriate value
    worksheet.getSelectedMarksAsync().then(function (marks) {
      // Get the first DataTable for our selected marks (usually there is just one)
      const worksheetData = marks.data[0];
      var index, indexName = 0;
      for(var i =0; i<worksheetData.columns.length;i++){

          if (worksheetData.columns[i].fieldName==fieldName) {
              index = worksheetData.columns[i].index;
          }
          else if (worksheetData.columns[i].fieldName=="Product Name") {
              indexName = worksheetData.columns[i].index;
          }
      }

      // Map our data into the format which the data table component expects it
      const data = worksheetData.data.map(function (row) {
         const rowData = row.map(function (cell) {
          return cell.formattedValue;
        });

        return ([rowData[index], rowData[indexName]] );
            

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


  function displayURL(URL){
    $('#selected_marks').empty();
    console.log(URL);
    for (var i = 0; i < URL.length; i++) {
     var str = URL[i][0]+" ";
     var tableImages = str.split(",");
     const image = $(`<img style="margin: 20px 20px" src="
      ${tableImages}"width="25%" height="25%">`);

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
