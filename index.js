const canvas = require('canvas-api-wrapper');
const asyncLib = require('async');
const coursesGenerator = require('canvas-course-list-generator');

/** 
 * sortByVisibility
 * @param {array of obj} tabs - each tab in a specific canvas course
 * 
 * This function organizes the array into the correct order to ensure that
 * the tabs are in the correct order before putting them in the correct order
 * in the actual course.
 */
function sortByVisibility(tabs) {
  tabs = tabs.filter(tab => !['home', 'settings'].includes(tab.id));

  // let hiddenTabs = tabs.filter(tab => tab.hidden);
  let visibleTabs = tabs.filter(tab => !tab.hidden);

  //connect arrays and then ensure position value is in order
  return stripHomeSetting(visibleTabs.map((tab, index) => ({
    ...tab,
    position: index + 2
  })));
}

function stripHomeSetting(arr) {
  //home and settings cannot be modified so we are going to just skip over them
  return arr.filter(ele => !['home', 'settings'].includes(ele.id));
}

function filterUnneeded(unsorted, sorted) {
  return sorted.filter((ele, sPosition) => unsorted.findIndex(uEle => uEle.id === ele.id && uEle.position === ele.position) !== sPosition);
}

/**
 * organizeClassTabs
 * 
 * @param {int} id 
 * @param {array of obj} tabs 
 * 
 * Since the Canvas api only allows for one tab to modified at a time, this function
 * does each one of the elements in the tabs array asynchronously. 
 */
function organizeClassTabs(id, tabs) {

  canvas.put(`/api/v1/courses/${id}/tabs/context_external_tool_1079`, {
    'position': 10,
    'hidden': false
  });

  //$('#nav_disabled_list + p button[type=submit]')




  // asyncLib.eachSeries(tabs, (tab, eachCallback) => {
  //   canvas.put(`/api/v1/courses/${id}/tabs/context_external_tool_255`, {
  //     'position': 8,
  //     'hidden': false
  //   }, (putErr) => {
  //     if (putErr) {
  //       eachCallback(putErr);
  //       return;
  //     }

  //     eachCallback(null);
  //   });
  // }, (err) => {
  //   if (err) {
  //     console.log(`Err: ${err}.`);
  //     return;
  //   }

  //   console.log(`Successfully ordered tabs`);
  //   return;
  // });
}

//start here
(async () => {
  //const courses = await coursesGenerator.retrieve();
  let exampleCourse = {
    id: 21050
  };

  let tabs = stripHomeSetting(await canvas.get(`/api/v1/courses/${exampleCourse.id}/tabs`));
  organizeClassTabs(exampleCourse.id, [tabs[2]])
  // let sortedTabs = sortByVisibility(tabs);
  // let updateCanvasTabArray = filterUnneeded(tabs, sortedTabs);

  // organizeClassTabs(exampleCourse.id, sortedTabs);
})();