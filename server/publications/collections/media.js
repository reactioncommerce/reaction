import { Meteor } from "meteor/meteor";
import { Media } from "/lib/collections";

/**
 * CollectionFS - Brand asset publication
  */
Meteor.publish("BrandAssets", () => Media.find({ "metadata.type": "brandAsset" }));
