const { By } = require('selenium-webdriver');

class SignUpPage {
  constructor(driver) {
    this.driver = driver;
    this.url = 'https://qa-assessment.pages.dev/';
  }

  /* ---------- navigation ---------- */
  async open() { await this.driver.get(this.url); }

  /* ---------- element getters ---------- */
  get firstName()       { return this.driver.findElement(By.id('firstName')); }
  get lastName()        { return this.driver.findElement(By.id('lastName')); }
  get email()           { return this.driver.findElement(By.id('email')); }
  get password()        { return this.driver.findElement(By.id('password')); }
  get confirmPassword() { return this.driver.findElement(By.id('confirmPassword')); }

  // optional fields
  get dob()        { return this.driver.findElement(By.id('dob')); }
  get phone()      { return this.driver.findElement(By.id('phone')); }
  get address()    { return this.driver.findElement(By.id('address')); }
  get linkedIn()   { return this.driver.findElement(By.id('linkedIn')); }
  get github()     { return this.driver.findElement(By.id('github')); }
  get genderMale() { return this.driver.findElement(By.id('male')); }

  // submit control  <input type="submit" value="Submit">
  get submitBtn()  { return this.driver.findElement(By.css('input[type="submit"]')); }

  /* ---------- reusable actions ---------- */
  async fillMandatory({ first, last, email, pw }) {
    if (first !== undefined)  await this.firstName.sendKeys(first);
    if (last  !== undefined)  await this.lastName.sendKeys(last);
    if (email !== undefined)  await this.email.sendKeys(email);
    if (pw    !== undefined) {
      await this.password.sendKeys(pw);
      await this.confirmPassword.sendKeys(pw);
    }
  }

  async fillAll(data) {
    await this.fillMandatory(data);            // first, last, email, pw

    // Some <input type="date"> controls ignore sendKeys — fallback to JS
    try { await this.dob.sendKeys(data.dob); } catch (_) { /* ignore */ }
    await this.driver.executeScript(
      'arguments[0].value = arguments[1]',
      this.dob,
      data.dob
    );

    await this.phone.sendKeys(data.phone);
    await this.address.sendKeys(data.address);
    await this.linkedIn.sendKeys(data.linkedIn);
    await this.github.sendKeys(data.github);
    await this.genderMale.click();
  }

  async submit() { await this.submitBtn.click(); }

  /* ---------- helpers ---------- */
  successBanner() { return this.driver.findElement(By.css('.alert-success')); }
  errorBanner()   { return this.driver.findElement(By.css('.alert-danger, .error')); }

  // returns true if First-Name field is empty (alternate success check)
  async formCleared() {
    return (await this.firstName.getAttribute('value')) === '';
  }
}

module.exports = SignUpPage;
