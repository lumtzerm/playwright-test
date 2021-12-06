const { expect } = require("@playwright/test");
const { Helpers } = require("../helpers/helper");
const { Connection } = require("../dataObjects/connection");
const helpers = new Helpers();

//exports.PlaywrightDevPage = class PlaywrightDevPage {
class LandingPage {
  /**
   * @param {import('@playwright/test').Page} page
   */
  constructor(page) {
    this.page = page;
  }

  async open() {
    //TODO: point to svk
    await this.page.goto("https://novy.regiojet.cz/");
  }

  async acceptCookies() {
    //TODO: Prijmout vse move to variable
    await this.page.click('button:has-text("Přijmout vše")');
  }

  async fillFrom(fromStation) {
    //TODO: move odkud to variable
    await this.page.fill('[aria-label="Odkud"]', fromStation);
    await this.page.press('[aria-label="Odkud"]', "Enter");
  }

  async fillTo(toStation) {
    //TODO: move Kam to variable
    await this.page.fill('[aria-label="Kam"]', toStation);
    await this.page.press('[aria-label="Kam"]', "Enter");
  }

  async fillFromTo(from, to) {
    await this.fillFrom(from);
    await this.fillTo(to);
  }

  //TODO create separate class from date picker
  async clickDate() {
    await this.page.click('[data-id="departure-date"]');
  }

  async pickNextMonday() {
    await this.page.click(
      '.CalendarDay__firstDayOfWeek:text-is(" ' +
        helpers.getNextMondayDayDate(helpers.getNextMonday()) +
        ' ")'
    );
  }

  async clickSearch() {
    //TODO: move Hledat to variabel
    await this.page.click("text=Hledat");
  }

  //TODO: break
  async getConnectionCards() {
    await this.page.waitForSelector("ul > li > div");
    const list = await this.page.$$("ul > li > div");

    const connections = [];

    for (const element of list) {
      //const is block scoped
      let departureAndArrivalTime = (
        await (await element.$(" * > h2")).innerText()
      ).split(" - ");

      let travelTimeArray = (
        await (await element.$(" * > span")).innerText()
      ).split(/(\s+)/);

      let priceArray = (
        await (await element.$(" * > button")).innerText()
      ).split(/(\s+)/);

      let price = "NotInitialized";
      //TODO: extract to function, rewrite as ternary

      if (priceArray.length === 3) {
        price = priceArray[0];
      } else {
        price = priceArray[2];
      }

      let isDirect = (await element.innerText()).includes("Přímý");

      let connection = new Connection(
        departureAndArrivalTime[0],
        departureAndArrivalTime[1],
        travelTimeArray[0],
        price,
        isDirect
      );

      connections.push(connection);
    }

    return connections;
  }
}
module.exports = { LandingPage };
