import bunyan from "bunyan";
import { Logs } from "/lib/collections";

const level = "INFO";

class BunyanMongo {}


BunyanMongo.prototype.write = Meteor.bindEnvironment((logData) => {
  const avalog = { logType: "avalara", data: logData };
  Logs.insert(avalog);
});

const streams = [
  {
    type: "raw",
    stream: new BunyanMongo()
  }
];


const Avalogger = bunyan.createLogger({
  level,
  name: "Avalara",
  streams
});

export default Avalogger;
