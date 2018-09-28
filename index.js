const canvas = require('canvas-api-wrapper');
const asyncLib = require('async');
const prompt = require('prompt');
const puppeteer = require('puppeteer');
const fs = require('fs');
const coursesGenerator = require('canvas-course-list-generator');
var isAuthenticated = false;

/**
 * promptUser(promptUserCallback)
 * @param {callback} promptUserCallback the callback to pass the data object to
 * 
 * This function prompts the user for the username and password to use
 * for the program.
 * 
 * TODO
 * - Add checking for environment variables so user doesn't have to insert
 * multiple times
 **/
function promptUser(promptUserCallback) {
  let schema = {
    properties: {
      user: {
        pattern: /[a-zA-Z\d]+/,
        default: 'cct_allstars67',
        message: 'user must be only letters, and numbers.',
        required: true
      },
      password: {
        pattern: /[a-zA-Z\d]+/,
        message: 'password must be only letters, and numbers.',
        replace: '*',
        hidden: true,
        required: true
      }
    }
  };

  prompt.start();

  prompt.get(schema, (err, results) => {
    if (err) promptUserCallback(err);

    promptUserCallback(null, results);
  });
}

/**
 * launchPuppeteer(data, url)
 * @param {object} data username and password given to us by user
 * @param {int} url the course id
 * 
 * This function goes through and call different functions to get
 * the job done
 **/
async function launchPuppeteer(data, url) {
  let newUrl = `https://byui.instructure.com/courses/${url.id}`;
  const browser = await puppeteer.launch();
  const page = await browser.newPage();

  page.setViewport({
    height: 1600,
    width: 1080
  });

  if (!isAuthenticated) await authenticate(page, data);

  await page.goto(newUrl);
  await fixTabs(page, newUrl, data);
  await getScreenshot(page);
  await browser.close();
}

/**
 * authenticate(page, data)
 * @param {Page} page the current page we are on
 * @param {object} data username and password given to us by user
 * 
 * This function goes through the authentication phase.
 * 
 * TODO: 
 * - Error handling -> wrong user information (timeout??)
 **/
async function authenticate(page, data) {
  console.log('Authenticating...');

  await page.goto('https://byui.instructure.com/login/canvas');
  await page.waitForSelector('#content');

  //insert information submitted by user
  await page.evaluate(data => {
    let buttonSelector = '#login_form > div.ic-Login__actions > div.ic-Form-control.ic-Form-control--login > button';

    document.querySelector('#pseudonym_session_unique_id').value = data.user;
    document.querySelector('#pseudonym_session_password').value = data.password;
    document.querySelector(buttonSelector).click();
  }, data);

  //TODO: add error handling here!
  await page.waitForSelector('#DashboardCard_Container > div');
  isAuthenticated = true;
  console.log('Authenticated.');
}

/**
 * fixTabs
 * @param {Page} page  - puppeteer's page object 
 * @param {string} url - url for page 
 * @param {obj} data   - user's input for username/password
 * 
 * This function simply goes to the navigation part of settings and simply
 * clicks save. This allows the active tabs to grouped up together on the top,
 * which makes it super simple.
 */
async function fixTabs(page, url, data) {
  //$('#nav_disabled_list + p button[type=submit]')
  //settings#tab-navigation
  let newUrl = url.concat('/settings#tab-navigation');

  //ensure that tab-navigation
  await page.goto(newUrl);
  await page.waitForSelector('#tab-navigation');

  await page.evaluate(data => {
    document.querySelector('#nav_disabled_list + p button[type=submit]').click();
  }, data);

  //prepping the page for the screenshot.
  await page.waitForSelector('#tab-navigation');
  await page.goto(url);
  await page.waitForSelector('#content');
}

/**
 * getScreenshot(page)
 * @param {Page} page the current page we are on
 * 
 * This function calls the puppeteer api to take 
 * a screenshot.
 **/
async function getScreenshot(page) {
  let name = await page.title();

  await page.screenshot({
    path: `screenshots/${name}_screenshot.png`
  });
  console.log(`${name} completed. screenshot inserted`);
}

//start here
(async () => {
  let folder = './screenshots';

  //puppeteer will throw an error if folder doesn't exists
  //so this one just takes care of the issue before puppeteer sees it
  if (!fs.existsSync(folder)) {
    fs.mkdirSync(folder);
  }

  promptUser(async (err, data) => {
    if (err) {
      console.log(err);
      return;
    }

    const courses = await coursesGenerator.retrieve();

    //to test on one course
    // let courses = [
    //   21050,
    // ];
    const results = await courses.map(async course => await launchPuppeteer(data, course));

    Promise.all(results).then(course => console.log('Job succeeeded. Please refer to /screenshots for screenshots.'));
  });
})();