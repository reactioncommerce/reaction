import { Meteor } from "meteor/meteor";
import "./i18n";
import methods from "./methods";

import "../lib/extendShopSchema";

Meteor.methods(methods);
