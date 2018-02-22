import { Meteor } from "meteor/meteor";
import { getTemplateByName } from "./templates";

export function registerMethods() {
  Meteor.methods({
    getTemplateByName
  });
}

export { getTemplateByName };
