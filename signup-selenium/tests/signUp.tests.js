/* ------------------------------------------------------------------ */
/*  prerequisites                                                     */
/* ------------------------------------------------------------------ */

require('chromedriver');              // add geckodriver if you run Firefox
// require('geckodriver');

const { Builder, Browser, By, until } = require('selenium-webdriver');
const { expect } = require('chai');
const SignUpPage = require('../pageobjects/signUpPage');

/* ------------------------------------------------------------------ */
/*  helpers                                                           */
/* ------------------------------------------------------------------ */

const buildBaseData = () => ({
  first:   'John',
  last:    'Doe',
  email:   `john${Date.now()}@example.com`,
  pw:      'Qwerty#123',
  dob:     '1990-05-15',
  phone:   '0701234567',
  address: '1 Main St',
  linkedIn:'https://www.linkedin.com/in/johndoe',
  github:  'https://github.com/johndoe',
});

/* ------------------------------------------------------------------ */
/*  test-suite                                                        */
/* ------------------------------------------------------------------ */

describe('Sign-up page', function () {
  this.timeout(60_000);

  let driver, page;

  /* ---------- lifecycle ---------- */
  before(async () => {
    const browser = process.env.BROWSER || Browser.CHROME;
    driver = await new Builder().forBrowser(browser).build();
    page   = new SignUpPage(driver);
  });

  beforeEach(async () => page.open());
  after(async () => driver && driver.quit());

  /* ---------- TC-01 ---------- */
  it('TC-01 – happy path (mandatory only)', async () => {
    await page.fillMandatory(buildBaseData());
    const firstField = page.firstName;          // element before refresh
    await page.submit();

    await driver.wait(until.stalenessOf(firstField), 10_000);
    expect(await page.firstName.getAttribute('value')).to.equal('');
  });

  /* ---------- TC-02 ---------- */
  it('TC-02 – happy path (all fields)', async () => {
    await page.fillAll(buildBaseData());
    const firstField = page.firstName;
    await page.submit();

    await driver.wait(until.stalenessOf(firstField), 10_000);
    expect(await page.firstName.getAttribute('value')).to.equal('');
  });

  /* ---------- negative paths (TC-03 → TC-12) ---------- */

  const negativeCases = [
    { id: 3,  desc: 'First name missing',         mutate: d => ({ ...d, first: '' }),                 msg: 'first'     },
    { id: 4,  desc: 'Last name missing',          mutate: d => ({ ...d, last: '' }),                  msg: 'last'      },
    { id: 5,  desc: 'Email missing',              mutate: d => ({ ...d, email: '' }),                 msg: 'email'     },
    { id: 6,  desc: 'Password missing',           mutate: d => ({ ...d, pw: undefined }),             msg: 'password'  },
    { id: 7,  desc: 'Confirm password missing',   mutate: d => d,             skipConfirm: true,      msg: 'confirm'   },
    { id: 8,  desc: 'Email invalid format',       mutate: d => ({ ...d, email: 'john.doe@@example' }), msg: ''          },
    { id: 9,  desc: 'Password mismatch',          mutate: d => ({ ...d, pw: 'Qwerty#123' }),          msg: 'match'     },
    { id:10,  desc: 'Phone invalid chars',        mutate: d => ({ ...d, phone: 'abcd1234' }),         msg: 'phone'     },
    { id:11,  desc: 'DOB wrong format',           mutate: d => ({ ...d, dob: '15-05-1990' }),         msg: 'date'      },
    { id:12,  desc: 'GitHub invalid URL',         mutate: d => ({ ...d, github: 'github.com/johndoe' }), msg: 'url'    },
  ];

  for (const tc of negativeCases) {
    it(`TC-${String(tc.id).padStart(2, '0')} – ${tc.desc}`, async () => {
      /* ---------- data ---------- */
      let data = tc.mutate ? tc.mutate(buildBaseData()) : buildBaseData();

      /* ---------- populate form ---------- */
      if (tc.id === 7) {
        await page.fillMandatory({ ...data, pw: 'Qwerty#123' });
        await page.confirmPassword.clear();
      } else if (tc.id === 9) {
        await page.fillMandatory({ ...data, pw: data.pw });
        await page.confirmPassword.clear();
        await page.confirmPassword.sendKeys('Qwerty#124');
      } else if (tc.id < 8) {
        await page.fillMandatory(data);
      } else {
        await page.fillAll(data);
      }

      await page.submit();

      /* ---------- capture validation ---------- */
      let errorText = '';

      try {
        // A) JavaScript alert
        await driver.wait(until.alertIsPresent(), 2_000);
        const alertBox = await driver.switchTo().alert();
        errorText = (await alertBox.getText()).toLowerCase();
        await alertBox.accept();
      } catch {
        try {
          // B) inline error node
          const error = await driver.wait(
            until.elementLocated(By.css('.alert-danger, .error')), 2_000
          );
          errorText = (await error.getText()).toLowerCase();
        } catch {
          // C) HTML-5 bubble (form never posted)
          await driver.sleep(500);
          errorText = await page.firstName.getAttribute('value')
            ? 'html5 block'
            : '';
        }
      }

      /* ---------- assertions ---------- */
      expect(errorText).to.not.equal(''); // some blocker appeared
      if (errorText !== 'html5 block' && tc.msg) {
        expect(errorText).to.include(tc.msg);
      }
    });
  }
});
