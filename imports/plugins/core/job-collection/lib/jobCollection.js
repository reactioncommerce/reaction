/* eslint-disable import/no-mutable-exports */
import { Meteor } from "meteor/meteor";

let JobCollection;

if (Meteor.isServer) {
  JobCollection = require("../server/jobCollection").default;
} else {
  JobCollection = require("../client/jobCollection").default;
}

export default JobCollection;
