const fs = require('fs');
const prompt = require('prompt');
const puppeteer = require('puppeteer');
const coursesGenerator = require('canvas-course-list-generator');

/**
 * promptUser(promptUserCallback)
 * @param {callback} promptUserCallback the callback to pass the data object to
 * 
 * This function prompts the user for the username and password to use
 * for the program.
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
 * createAuthedPuppeteer
 * @param {Array} data        - username and password given to us by user
 * @param {Puppeteer} browser - browser of Puppeteer
 * 
 * This function simply creates a new page and then does
 * the authentication on that page. It returns the browser
 * because we don't want anything else to use the authentication
 * tab so the browser stays authenticated with Canvas. This leads
 * the program hvaing to authenticate only once.
 */
async function createAuthedPuppeteer(data, browser) {
  const page = await browser.newPage();

  await authenticate(page, data);

  return browser;
}

/**
 * authenticate(page, data)
 * @param {Page} page the current page we are on
 * @param {object} data username and password given to us by user
 * 
 * This function goes through the authentication phase.
 **/
async function authenticate(page, data) {
  console.log('Authenticating...');

  await page.goto('https://byui.instructure.com/login/canvas');
  await page.waitForSelector('#content');

  //insert information submitted by user
  await page.evaluate(data => {
    document.querySelector('#login_form input[type=text]').value = data.user;
    document.querySelector('#login_form input[type=password]').value = data.password;
    document.querySelector('#login_form button[type=submit]').click();
  }, data);

  await page.waitForSelector('#DashboardCard_Container');

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
  await getScreenshot(page);
  await page.close();

}

/**
 * createFixTab
 * @param {Puppeteer} browser - Puppeteer browser object
 * @param {Int} id            - course id 
 * @param {Array} data        - username and password given to us by user
 * 
 * This function creates a new tab and goes to the correct page. After setting up
 * the page, it calls fixTabs()
 */
async function createFixTab(browser, id, data) {
  let url = `https://byui.instructure.com/courses/${id}`;
  const page = await browser.newPage();

  page.setViewport({
    height: 1600,
    width: 1080
  });

  await page.goto(url)

  return await fixTabs(page, url, data);
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

/**
 * chunkify -- destructive
 * @param {Array} courses - array of canvas courses
 * 
 * This function splits the array into chunks of arrays. 
 */
function chunkify(courses) {
  const size = 5; //split array into an array with subarrays of size 5

  return courses.reduce((chunks, ele, i) => {
    (i % size) ? chunks[chunks.length - 1].push(ele): chunks.push([ele]);

    return chunks;
  }, []);
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

    const courses = chunkify(await coursesGenerator.retrieve());
    const browser = await puppeteer.launch({
      headless: false
    });
    const authedBrowser = await createAuthedPuppeteer(data, browser);

    //iterate through each chunk sequentially
    for (const course of courses) {
      //perform async operations on the chunk
      await Promise.all(course.map(async courseItem => {
        await createFixTab(authedBrowser, courseItem.id, data);
      }));
    }

    authedBrowser.close();
  });
})();