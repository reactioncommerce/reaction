import { Meteor } from "meteor/meteor";
// Methods should be loaded before hooks
import methods from "./methods";

Meteor.methods(methods);
