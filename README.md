# canvas-course-active-nav-tabs

## Process

This program simply utilizes a different module to retrieve specific courses from Canvas and then utilizes Google Puppeteer to go through and make sure that all of the active tabs are grouped together. Since Canvas already groups them up after pressing Save (even when there is no actions done and needed to be saved), this module goes to each course and presses the Save button.

## To Install

Execute `npm install git+https://github.com/byuitechops/canvas-course-active-nav-tabs.git`.

## Setup

To install and execute this tool, please do the following:

1. Clone the repository, `https://github.com/byuitechops/canvas-course-active-nav-tabs.git`.

2. Execute `cd canvas-course-active-nav-tabs`.

3. Execute `npm install`.

4. Execute `npm start` to execute the program.

Important notice: since Google Puppeteer is a headless tool, you will not be able to see the process so it will create a folder called `screenshots` and inject screenshots of the process in that folder. However, if you want to see the process as it is going on, simply inject `{headless: false}` inside [this line](https://github.com/byuitechops/canvas-course-active-nav-tabs/blob/a0327a2dcd9e71b2153bfa3983eb2aba4ccfa39c/index.js#L189). It is already set to that so if you don't want to see it, you can either remove it or set it `true`.