AutomationTask – Quick‑Start Guide

Welcome! Follow the steps below on any fresh Windows 10/11, macOS or Linux box to install the tool‑chain, run the Selenium test‑suite, and view the results.


1. Prerequisites
Git version 2.40 or newer
Node.js (includes npm) version 18 LTS or 20 LTS
Chrome version v137
(optional) Firefox / Edge Latest releases


Tip (Windows): Use the official Node installer from https://nodejs.org – it adds node & npm to PATH automatically.


2. One‑time setup
# clone the repo
$ git clone https://github.com/AmarLjajic/AutomationTask.git
$ cd AutomationTask/signup-selenium

# install all Node dependencies
$ npm install

That command pulls selenium‑webdriver, chromedriver, mocha, chai, mochawesome, etc. If your corporate proxy blocks downloads, configure npm config set proxy first.


3. Running the tests
3.1 Default (Chrome)
$ npm test

The script in package.json expands to:
mocha tests --reporter mochawesome
Mocha starts Chrome via chromedriver and executes TC‑01 → TC‑12.

3.2 Cross‑browser (Firefox or Edge)
# Firefox example
$ set BROWSER=firefox   # Windows PowerShell / CMD
$ BROWSER=firefox npm test  # macOS / Linux

The repo already includes geckodriver; Edge needs the Microsoft WebDriver on PATH.


4. Where do the results live?
After every run Mocha + Mochawesome create:

signup-selenium/
 └─ mochawesome-report/
      ├─ mochawesome.html   ← open this in your browser
      └─ assets/…

Double‑click mochawesome.html to view a coloured dashboard: pass/fail counts, screenshots (if present), and stack traces.


6. Next steps
- Add new test‑cases by copying any it() block in tests/signUp.test.js.
- Push your branch and open a Pull Request – the project CI will replay the suite.