(function () {
  /**
   * This extension collects the IDs of each datasource the user is interested in
   * and stores this information in settings when the popup is closed.
   */
  const imageSettingsKey = 'selectedImage';
  const columnsSettingsKey = 'selectedColumns';
  let selectedImage = [];
  let selectedColumns = [];
  let selectedSheet = [];

  $(document).ready(function () {

    // The only difference between an extension in a dashboard and an extension 
    // running in a popup is that the popup extension must use the method
    // initializeDialogAsync instead of initializeAsync for initialization.
    // This has no affect on the development of the extension but is used internally.
    tableau.extensions.initializeDialogAsync().then(function (openPayload) {
      // The openPayload sent from the parent extension in this sample is the 
      // default time interval for the refreshes.  This could alternatively be stored
      // in settings, but is used in this sample to demonstrate open and close payloads.
      $('#interval').val(openPayload);
      $('#closeButton').click(closeDialog);

      let dashboard = tableau.extensions.dashboardContent.dashboard;
      let visibleDatasources = [];

      // Loop through datasources in this sheet and create a checkbox UI 
      // element for each one.  The existing settings are used to 
      // determine whether a datasource is checked by default or not.
      dashboard.worksheets.forEach(function (worksheet) {
        const button = createButton(worksheet.name);
        button.click(function () {
          $('#images').empty();
          $('#columns').empty();
          // Get the worksheet name which was selected
          let worksheetName = worksheet.name;
          tableau.extensions.settings.set('sheet', worksheetName);
          // Close the dialog and show the data table for this worksheet
          
          showChooseSelection(worksheetName);
          
      });
        $('#buttons').append(button);
    });
  });
    });

  /**
   * Helper that parses the settings from the settings namesapce and 
   * returns a list of IDs of the datasources that were previously
   * selected by the user.
   */

  function showChooseSelection(worksheetName){
    const worksheet = getSelectedSheet(worksheetName);
    
    
    const textFormat = $('<h5>Select the field that indicated the URL of the image to display</h5>');
    const textFormat2 = $('<h5>Select the columns of your table</h5>');
    
    $('#images').append(textFormat);
    $('#columns').append(textFormat2);

    worksheet.getSummaryDataAsync().then(function(data) {
      const columnsTable = data.columns;
      columnsTable.forEach(function (name) {
        //addFieldItemToUI(name.fieldName);

        const option = createOption(name);
        const option2 = createOptionColumns(name);
      });
    });


  }

  /**
   * Helper that updates the internal storage of datasource IDs
   * any time a datasource checkbox item is toggled.
   */
  function updateURL(id) {
    
    let idIndex = selectedImage.indexOf(id);

    if (idIndex < 0) {
      selectedImage.push(id);
    } else {
      selectedImage.splice(idIndex, 1);
    }
  }

  function updateData(id) {
    let idIndex = selectedSheet.indexOf(id);
    if (idIndex < 0) {
      selectedSheet.push(id);
    } else {
      selectedSheet.splice(idIndex, 1);
    }
  }

  function updateColumns(id) {
    let idIndex = selectedColumns.indexOf(id);
    if (idIndex < 0) {
      selectedColumns.push(id);
    } else {
      selectedColumns.splice(idIndex, 1);
    }
  }

  
  function closeDialog() {
    let currentSettings = tableau.extensions.settings.getAll();
    tableau.extensions.settings.set(imageSettingsKey, JSON.stringify(selectedImage));
    tableau.extensions.settings.set(columnsSettingsKey, JSON.stringify(selectedColumns));

    tableau.extensions.settings.saveAsync().then((newSavedSettings) => {
      tableau.extensions.ui.closeDialog("test");
    });
  }

  function createButton (buttonTitle) {
    const button =
    $(`<button type='button' class='btn btn-default btn-block'>
      ${buttonTitle}
    </button>`);
    return button;
  }

  function createOption (buttonTitle) {
    let containerDiv = $('<div />');

    $('<input />', {
      type: 'radio',
      id: buttonTitle.index,
      value: buttonTitle.fieldName,
      click: function() { updateURL(buttonTitle.index) }
    }).appendTo(containerDiv);

    $('<label />', {
      'for': buttonTitle.index,
      text: buttonTitle.fieldName,
    }).appendTo(containerDiv);

    $('#images').append(containerDiv);
  }

  function createOptionColumns (buttonTitle) {
    let containerDiv = $('<div />');

    $('<input />', {
      type: 'checkbox',
      id: buttonTitle.index,
      value: buttonTitle.fieldName,
      click: function() { updateColumns(buttonTitle.index) }
    }).appendTo(containerDiv);

    $('<label />', {
      'for': buttonTitle.index,
      text: buttonTitle.fieldName,
    }).appendTo(containerDiv);

    $('#columns').append(containerDiv);
  }

  function getSelectedSheet (worksheetName) {
    // go through all the worksheets in the dashboard and find the one we want
    return tableau.extensions.dashboardContent.dashboard.worksheets.find(function (sheet) {
      return sheet.name === worksheetName;
    });
  }


}) ();