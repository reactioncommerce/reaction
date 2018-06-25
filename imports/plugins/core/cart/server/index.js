import { Meteor } from "meteor/meteor";
// Methods should be loaded before hooks
import methods from "./methods";
import "./hooks";

Meteor.methods(methods);
