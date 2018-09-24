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
  //home and settings cannot be modified so we are going to just skip over them
  tabs = tabs.filter(tab => !['home', 'settings'].includes(tab.id));

  let hiddenTabs = tabs.filter(tab => tab.hidden);
  let visibleTabs = tabs.filter(tab => !tab.hidden);

  //connect arrays and then ensure position value is in order
  return visibleTabs.concat(hiddenTabs).map(tab => ({ ...tab,
    position: tab.position + 1
  }));
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
  asyncLib.each(tabs, (tab, cb) => {
    canvas.put(`/api/v1/courses/${id}/tabs/${tab.id}`, {
      'position': tab.position
    }, (putErr) => {
      if (putErr) {
        cb(putErr);
        return;
      }

      cb(null);
    });

  }, (err) => {
    if (err) {
      console.log(`Err: ${err}.`);
      return;
    }

    console.log(`Successfully ordered tabs`);
    return;
  });
}

//start here
(async () => {
  const courses = await coursesGenerator.retrieve();
  let exampleCourse = courses[0];
  let tabs = await canvas.get(`/api/v1/courses/${exampleCourse.id}/tabs`);
  let sortedTabs = sortByVisibility(tabs);
  console.log(sortedTabs);

  // organizeClassTabs(exampleCourse.id, sortedTabs);
})();