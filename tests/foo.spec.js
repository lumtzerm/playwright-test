//$env:PWDEBUG=1
const { test, expect } = require("@playwright/test");
const { Helpers } = require("../src/helpers/helper");
const { LandingPage } = require("../src/pageObjects/landingPage");
const helpers = new Helpers();

test("basic test", async ({ page }) => {
  const landingPage = new LandingPage(page);

  await landingPage.open();

  await landingPage.acceptCookies();

  await landingPage.fillFromTo("Ostrava", "Brno");

  await landingPage.clickDate();

  await landingPage.pickNextMonday();

  await landingPage.clickSearch();

  const connections = await landingPage.getConnectionCards();
  console.log(connections);

  /*sort by travel time, ascending
  console.log(
    connections.sort(
      (a, b) =>
        helpers.calculateTravelMinutes(a.travelTime) -
        helpers.calculateTravelMinutes(b.travelTime)
    )
  );*/

  //sort by price, ascending | does not need parseInt because we are deducting in sort
  //console.log(connections.sort((a, b) => a.price - b.price));

  //verify displayed travel time equals actual travel time
  for (const connection of connections) {
    let arrivalDateTime = helpers
      .getNextMonday()
      .setHours(
        connection.arrivalTime.split(":")[0],
        connection.arrivalTime.split(":")[1],
        0
      );

    let departureDateTime = helpers
      .getNextMonday()
      .setHours(
        connection.departureTime.split(":")[0],
        connection.departureTime.split(":")[1],
        0
      );

    expect(
      helpers.calculateTravelTime(departureDateTime, arrivalDateTime)
    ).toBe(connection.travelTime);
  }
});
