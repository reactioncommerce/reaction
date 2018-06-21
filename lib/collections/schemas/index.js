import { check } from "meteor/check";
import { Tracker } from "meteor/tracker";
import * as schemas from "imports/collections/schemas";

Object.values(schemas).forEach((schema) => {
  schema._constructorOptions.check = check;
  schema._constructorOptions.tracker = Tracker;
});

module.exports = schemas;
