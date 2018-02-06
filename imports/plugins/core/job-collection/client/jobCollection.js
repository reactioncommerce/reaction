/* eslint-disable no-console */
import { Meteor } from "meteor/meteor";
import JobCollectionBase from "../lib/jobCollectionBase";

class JobCollection extends JobCollectionBase {
  constructor(root = "queue", options = {}) {
    super(root, options);

    this._toLog = this._toLog.bind(this);

    if (!(this instanceof JobCollection)) {
      return new JobCollection(root, options);
    }

    this.logConsole = false;
    this.isSimulation = true;

    if (!options.connection) {
      Meteor.methods(this._generateMethods());
    } else {
      options.connection.methods(this._generateMethods());
    }
  }

  _toLog(userId, method, message) {
    if (this.logConsole) {
      return console.log(`${new Date()}, ${userId}, ${method}, ${message}\n`);
    }
  }
}

export default JobCollection;
