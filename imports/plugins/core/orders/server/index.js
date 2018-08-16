import { Meteor } from "meteor/meteor";
import "./startup";
import "./i18n";
import methods from "./methods";

Meteor.methods(methods);
