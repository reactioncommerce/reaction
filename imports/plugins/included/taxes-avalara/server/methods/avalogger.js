import bunyan from "bunyan";
import { Meteor } from "meteor/meteor";
import { Logs } from "/lib/collections";
import { Reaction } from "/server/api";

const level = "INFO";

class BunyanMongo {
  levelToName = {
    10: "trace",
    20: "debug",
    30: "info",
    40: "warn",
    50: "error",
    60: "fatal"
  };

  write = Meteor.bindEnvironment((logData) => {
    const avalog = {
      logType: "avalara",
      shopId: Reaction.getShopId(),
      data: logData,
      level: this.levelToName[logData.level]
    };
    Logs.insert(avalog);
  });
}

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
