export default class httpError extends Error {
  status: Number;
  route: any;
  constructor(status: Number, message, route = null) {
    super(message);
    this.status = status;
    this.route = route;
  }
}
