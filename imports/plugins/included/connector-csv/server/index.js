import { Meteor } from "meteor/meteor";
import "./i18n";
import "./collections";
import "./conversionMaps";
import generateProcessJobItemsJob from "./jobs";
import "./jobFileCollections";
import "./methods";
import "./publications";
import security from "./security";

Meteor.startup(security);
generateProcessJobItemsJob();
