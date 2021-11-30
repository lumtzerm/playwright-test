class Connection {
  constructor(departureTime, arrivalTime, travelTime, price, isDirect) {
    this.departureTime = departureTime;
    this.arrivalTime = arrivalTime;
    this.travelTime = travelTime;
    this.price = price;
    this.isDirect = isDirect;
  }
}

module.exports = { Connection };
