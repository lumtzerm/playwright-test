class Helpers {
  getNextMonday() {
    var nextMonday = new Date();
    nextMonday.setDate(
      nextMonday.getDate() + ((1 + 7 - nextMonday.getDay()) % 7 || 7)
    );
    return nextMonday;
  }

  //TODO: refactor, remove
  getNextMondayDayDate(nextMonday) {
    return nextMonday.getUTCDate();
  }

  calculateTravelTime(departureTime, arrivalTime) {
    var travelTimeTotal = Math.abs(
      Math.round((arrivalTime - departureTime) / 1000) / 60
    );
    var travelHours =
      Math.floor(travelTimeTotal / 60) < 10
        ? `0${Math.floor(travelTimeTotal / 60).toString()}`
        : Math.floor(travelTimeTotal / 60).toString();

    var travelMinutes =
      travelTimeTotal % 60 < 10
        ? `0${(travelTimeTotal % 60).toString()}`
        : (travelTimeTotal % 60).toString();

    return `${travelHours}:${travelMinutes}`;
  }

  calculateTravelMinutes(travelTime) {
    return (
      parseInt(travelTime.split(":")[0]) * 60 +
      parseInt(travelTime.split(":")[1])
    );
  }
}
module.exports = { Helpers };
