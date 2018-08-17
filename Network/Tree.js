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
      fetchCurrentSettings();
      if (typeof currentSettings.sheet !== "undefined") {
        $('#inactive').hide();
        drawtree(currentSettings);
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
function drawtree(settings){
    console.log(settings);
    var worksheetsName = settings.sheet;
    const worksheet = getSelectedSheet(worksheetsName);
    var index1 = settings.selectedImage[1];
    var index2= settings.selectedColumns[1];
    worksheet.getSummaryDataAsync().then(function (marks){
      //console.log(marks);
      var tiers1 = [];
      var tiers2 = [];
      //var tiers3 = [];
      for (var j = 0; j<marks.data.length;j++){
        //console.log(marks);
        tiers1.push(marks.data[j][index1]);
        tiers2.push(marks.data[j][index2]);
        //tiers3.push(marks.data[j][index3]);
      }
      display(tiers1,tiers2);
      
    }); 

    }



    
    function display(tiers1,tiers2){

      var newArray = [];
      newArray = convertArray(tiers1,tiers2);
      
      console.log(tiers1.length);
      let enfants = {};
      let enfantsList = [];
      let family = {};
      let familyList = [];
      let treeD = {};
      let treeData = [];
      var j;
      var k;
      console.log(tiers2);
      for (var i = 0; i < tiers1.length; i++) {
        
        if (i == 0 || j == i ) {
          //enfants [i] = i;
          enfants = {"name": newArray[i].tiers2, "parent": newArray[i].tiers1}
          enfantsList.push(enfants);
          
        }
        else if (i == tiers1.length - 1){


          enfants = {"name": newArray[i].tiers2, "parent": newArray[i].tiers1};
          enfantsList.push(enfants);
          
          family = {"name" : newArray[i].tiers1, "parent" : "root", "children" : enfantsList}
          familyList.push(family);
        }
        else if (newArray[i-1].tiers1 == newArray[i].tiers1) {
          
          //enfants [i] = i;
          enfants = {"name": newArray[i].tiers2, "parent": newArray[i].tiers1}
          enfantsList.push(enfants);
          console.log(i);
        }
        else 
        {

          family = {"name" : newArray[i-1].tiers1, "parent" : "root", "children" : enfantsList}
          familyList.push(family);
          enfantsList = [];
          enfants = {"name": newArray[i].tiers2, "parent": newArray[i+1].tiers1}
          enfantsList.push(enfants);
          j = i;          
        }
        console.log(i);

      }
    treeD = {"name" : "root", "parent":null, "children": familyList}
    treeData.push(treeD);
    console.log(treeData);



      
      

var margin = {top: 20, right: 120, bottom: 20, left: 120},
  width = 960 - margin.right - margin.left,
  height = 500 - margin.top - margin.bottom;
  
var i = 0,
  duration = 750,
  root;

var tree = d3.layout.tree()
  .size([height, width]);

var diagonal = d3.svg.diagonal()
  .projection(function(d) { return [d.y, d.x]; });

var svg = d3.select("body").append("svg")
  .attr("width", width + margin.right + margin.left)
  .attr("height", height + margin.top + margin.bottom)
  .append("g")
  .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

root = treeData[0];
root.x0 = height / 2;
root.y0 = 0;
  
update(root);

d3.select(self.frameElement).style("height", "500px");

function update(source) {

  // Compute the new tree layout.
  var nodes = tree.nodes(root).reverse(),
    links = tree.links(nodes);

  // Normalize for fixed-depth.
  nodes.forEach(function(d) { d.y = d.depth * 180; });

  // Update the nodes…
  var node = svg.selectAll("g.node")
    .data(nodes, function(d) { return d.id || (d.id = ++i); });

  // Enter any new nodes at the parent's previous position.
  var nodeEnter = node.enter().append("g")
    .attr("class", "node")
    .attr("transform", function(d) { return "translate(" + source.y0 + "," + source.x0 + ")"; })
    .on("click", click);

  nodeEnter.append("circle")
    .attr("r", 1e-6)
    .style("fill", function(d) { return d._children ? "lightsteelblue" : "#fff"; });

  nodeEnter.append("text")
    .attr("x", function(d) { return d.children || d._children ? -13 : 13; })
    .attr("dy", ".35em")
    .attr("text-anchor", function(d) { return d.children || d._children ? "end" : "start"; })
    .text(function(d) { return d.name; })
    .style("fill-opacity", 1e-6);

  // Transition nodes to their new position.
  var nodeUpdate = node.transition()
    .duration(duration)
    .attr("transform", function(d) { return "translate(" + d.y + "," + d.x + ")"; });

  nodeUpdate.select("circle")
    .attr("r", 10)
    .style("fill", function(d) { return d._children ? "lightsteelblue" : "#fff"; });

  nodeUpdate.select("text")
    .style("fill-opacity", 1);

  // Transition exiting nodes to the parent's new position.
  var nodeExit = node.exit().transition()
    .duration(duration)
    .attr("transform", function(d) { return "translate(" + source.y + "," + source.x + ")"; })
    .remove();

  nodeExit.select("circle")
    .attr("r", 1e-6);

  nodeExit.select("text")
    .style("fill-opacity", 1e-6);

  // Update the links…
  var link = svg.selectAll("path.link")
    .data(links, function(d) { return d.target.id; });

  // Enter any new links at the parent's previous position.
  link.enter().insert("path", "g")
    .attr("class", "link")
    .attr("d", function(d) {
    var o = {x: source.x0, y: source.y0};
    return diagonal({source: o, target: o});
    });

  // Transition links to their new position.
  link.transition()
    .duration(duration)
    .attr("d", diagonal);

  // Transition exiting nodes to the parent's new position.
  link.exit().transition()
    .duration(duration)
    .attr("d", function(d) {
    var o = {x: source.x, y: source.y};
    return diagonal({source: o, target: o});
    })
    .remove();

  // Stash the old positions for transition.
  nodes.forEach(function(d) {
  d.x0 = d.x;
  d.y0 = d.y;
  });
}

// Toggle children on click.
function click(d) {
  if (d.children) {
  d._children = d.children;
  d.children = null;
  } else {
  d.children = d._children;
  d._children = null;
  }
  update(d);
}

      
    
  }
  function getSelectedSheet (worksheetName) {
    // go through all the worksheets in the dashboard and find the one we want
    return tableau.extensions.dashboardContent.dashboard.worksheets.find(function (sheet) {
      return sheet.name === worksheetName;
    });
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

  function convertArray (tiers1,tiers2) {
    var array = [];
      for (var i = 0; i < tiers1.length; i++) {
        array.push({"tiers1" :tiers1[i].value, "tiers2" : tiers2[i].value})
      }
    return array;
  }

  function getSelectedSheet (worksheetName) {
    // go through all the worksheets in the dashboard and find the one we want
    return tableau.extensions.dashboardContent.dashboard.worksheets.find(function (sheet) {
      return sheet.name === worksheetName;
    });
  }

  function convert(array){
    var map = {};
    for(var i = 0; i < array.length; i++){
        var obj = array[i];
        obj.items= [];

        map[obj.Id] = obj;

        var parent = obj.Parent || '-';
        if(!map[parent]){
            map[parent] = {
                items: []
            };
        }
        map[parent].items.push(obj);
    }

    return map['-'].items;

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
            //unregisterHandlerFunctions.push(unregisterHandlerFunction);
        });
    }

  function filterChangedHandler(filterEvent) {
        // Just reconstruct the filters table whenever a filter changes.
        // This could be optimized to add/remove only the different filters.
        //fetchFilters();
        //reload gauge
        d3.select("svg").remove();
        const settingsSaved = tableau.extensions.settings.getAll();
        drawtree(settingsSaved);
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
            drawtree(settingsEvent.newSettings);
        });
    }


  function configure() { 
      const popupUrl = `${window.location.origin}/Network/extensionDialog.html`;
    
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
