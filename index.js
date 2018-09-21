const canvas = require('canvas-api-wrapper');
const coursesGenerator = require('../canvas-course-list-generator');

(() => {
  const courses = coursesGenerator.retrieve();

  console.log(courses);
})();