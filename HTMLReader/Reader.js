'use strict';

// Wrap everything in an anonymous function to avoid poluting the global namespace
(function () {

  const defaultIntervalInMin = '5';
  let savedInfo;
  let unregisterHandlerFunctions = [];
  // Use the jQuery document ready signal to know when everything has been initialized
  $(document).ready(function () {
    // Tell Tableau we'd like to initialize our extension
    tableau.extensions.initializeAsync({'configure': configure}).then(function() {    
      // Once the extensions is initialized, ask the user to choose a sheet
      let currentSettings = tableau.extensions.settings.getAll();
      fetchFilter();
      fetchFilter2();
      fetchCurrentSettings();
      //fetchFilter();
      //fetchCurrentSettings();
      if (typeof currentSettings.sheet !== "undefined") {
        $('#inactive').hide();
        console.log('test');
        getHTML(currentSettings);
        //updateExtensionBasedOnSettings(currentSettings.newSettings);
        
        
               
      }
      
      //getLocation();
      //showImage();
    });
  });

  /**
   * Shows the choose sheet UI. Once a sheet is selected, the data table for the sheet is shown
   */

   let unregisterEventHandlerFunction;


  function getHTML(settings){
    
    var worksheetsName = settings.sheet;
    const worksheet = getSelectedSheet(worksheetsName);
    var index = settings.selectedColumns[1];
    worksheet.getSummaryDataAsync().then(function(marks){
    console.log(marks.data);
    for (var j = 0; j<marks.data.length;j++){
      if (j == 0) {
        var start = $(`<tr><td>`);
        $('#selected_marks').append(start); 
        var html = marks.data[j][index].value;
        $('#selected_marks').append(html);
        var end = $(`</td>`);
        $('#selected_marks').append(end);
      }
      else if (j%3 ==0){        
        var start3 = $(`</tr><tr><td>`);
        $('#selected_marks').append(start3); 
        var html3 = marks.data[j][index].value;
        $('#selected_marks').append(html3);
        var end3 = $(`</td>`);
        $('#selected_marks').append(end3);

      } 
      else {
        var start2 = $(`<td>`);
        $('#selected_marks').append(start2); 
        var html2 = marks.data[j][index].value;
        $('#selected_marks').append(html2);
        var end2 = $(`</td>`);
        $('#selected_marks').append(end2);
      }
    }
      
    });
  }


      
    




  function getSelectedSheet (worksheetName) {
    // go through all the worksheets in the dashboard and find the one we want
    return tableau.extensions.dashboardContent.dashboard.worksheets.find(function (sheet) {
      return sheet.name === worksheetName;
    });
  }

     function fetchCurrentSettings() {
        // While performing async task, show loading message to user.
        //$('#loading').addClass('show');

        // Whenever we restore the filters table, remove all save handling functions,
        // since we add them back later in this function.
        unregisterHandlerFunctions.forEach(function(unregisterHandlerFunction) {
            unregisterHandlerFunction();
        });

        // Since filter info is attached to the worksheet, we will perform
        // one async call per worksheet to get every filter used in this
        // dashboard.  This demonstrates the use of Promise.all to combine
        // promises together and wait for each of them to resolve.
        let filterFetchPromises = [];

        // List of all filters in a dashboard.
        let dashboardfilters = [];

        // To get filter info, first get the dashboard.
        const dashboard = tableau.extensions.dashboardContent.dashboard;

        tableau.extensions.settings.addEventListener(tableau.TableauEventType.SettingsChanged, (settingsEvent) => {
            //console.log(settingsEvent);
            //updateExtensionBasedOnSettings(settingsEvent.newSettings);
            getHTML(settingsEvent.newSettings);
        });
    }

  function fetchFilter() {
        // While performing async task, show loading message to user.
        //$('#loading').addClass('show');

        // Whenever we restore the filters table, remove all save handling functions,
        // since we add them back later in this function.
        unregisterHandlerFunctions.forEach(function(unregisterHandlerFunction) {
            unregisterHandlerFunction();
        });

        // Since filter info is attached to the worksheet, we will perform
        // one async call per worksheet to get every filter used in this
        // dashboard.  This demonstrates the use of Promise.all to combine
        // promises together and wait for each of them to resolve.
        let filterFetchPromises = [];

        // List of all filters in a dashboard.
        let dashboardfilters = [];

        // To get filter info, first get the dashboard.
        const dashboard = tableau.extensions.dashboardContent.dashboard;

        // Then loop through each worksheet and get its filters, save promise for later.
        dashboard.worksheets.forEach(function(worksheet) {
            //filterFetchPromises.push(worksheet.getFiltersAsync());

            // Add filter event to each worksheet.  AddEventListener returns a function that will
            // remove the event listener when called.
            let unregisterHandlerFunction = worksheet.addEventListener(tableau.TableauEventType.MarkSelectionChanged, filterChangedHandler);
            //let unregisterHandlerFunction = worksheet.addEventListener(tableau.TableauEventType.FilterChanged, filterChangedHandler);
            //unregisterHandlerFunctions.push(unregisterHandlerFunction);
        });
    }
    function fetchFilter2() {
        // While performing async task, show loading message to user.
        //$('#loading').addClass('show');

        // Whenever we restore the filters table, remove all save handling functions,
        // since we add them back later in this function.
        unregisterHandlerFunctions.forEach(function(unregisterHandlerFunction) {
            unregisterHandlerFunction();
        });

        // Since filter info is attached to the worksheet, we will perform
        // one async call per worksheet to get every filter used in this
        // dashboard.  This demonstrates the use of Promise.all to combine
        // promises together and wait for each of them to resolve.
        let filterFetchPromises = [];

        // List of all filters in a dashboard.
        let dashboardfilters = [];

        // To get filter info, first get the dashboard.
        const dashboard = tableau.extensions.dashboardContent.dashboard;

        // Then loop through each worksheet and get its filters, save promise for later.
        dashboard.worksheets.forEach(function(worksheet) {
            //filterFetchPromises.push(worksheet.getFiltersAsync());

            // Add filter event to each worksheet.  AddEventListener returns a function that will
            // remove the event listener when called.
            //let unregisterHandlerFunction = worksheet.addEventListener(tableau.TableauEventType.MarkSelectionChanged, filterChangedHandler);
            let unregisterHandlerFunction = worksheet.addEventListener(tableau.TableauEventType.FilterChanged, filterChangedHandler);
            //unregisterHandlerFunctions.push(unregisterHandlerFunction);
        });
    }

    function filterChangedHandler(filterEvent) {    
        $('#selected_marks').empty(); 
        const settingsSaved = tableau.extensions.settings.getAll();
        getHTML(settingsSaved);
    }


  function configure() { 
      const popupUrl = `${window.location.origin}/HTMLReader/extensionDialog.html`;
    
      tableau.extensions.ui.displayDialogAsync(popupUrl, defaultIntervalInMin, { height: 500, width: 500 }).then((closePayload) => {
        $('#inactive').hide();
        $('#active').show();

        // The close payload is returned from the popup extension via the closeDialog method.
        

    }).catch((error) => {
      //  ... 
      // ... code for error handling
      
    });
  }

})();
