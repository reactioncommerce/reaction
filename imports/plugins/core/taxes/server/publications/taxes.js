import { Meteor } from "meteor/meteor";
import { Match, check } from "meteor/check";
import { Security } from "meteor/ongoworks:security";
import { Counts } from "meteor/tmeasday:publish-counts";
import { Taxes, TaxCodes } from "../../lib/collections";
import { Reaction } from "/server/api";

//
// Security
// import "/server/security/collections";
// Security definitions
//
Security.permit(["insert", "update", "remove"]).collections([
  Taxes,
  TaxCodes
]).ifHasRole({
  role: "admin",
  group: Reaction.getShopId()
});
/**
 * taxes
 */
Meteor.publish("Taxes", function (query, options) {
  check(query, Match.Optional(Object));
  check(options, Match.Optional(Object));

  // check shopId
  const shopId = Reaction.getShopId();
  if (!shopId) {
    return this.ready();
  }

  const select = query || {};
  // append shopId to query
  // taxes could be shared
  // if you disregarded shopId
  select.shopId = shopId;

  // appends a count to the collection
  // we're doing this for use with griddleTable
  Counts.publish(this, "taxes-count", Taxes.find(
    select,
    options
  ));

  return Taxes.find(
    select,
    options
  );
});

/**
 * tax codes
 */
Meteor.publish("TaxCodes", function (query, params) {
  check(query, Match.Optional(Object));
  check(params, Match.Optional(Object));

  // check shopId
  const shopId = Reaction.getShopId();
  if (!shopId) {
    return this.ready();
  }

  const select = query || {};

  // for now, not adding shopId to query
  // taxCodes are reasonable shared??
  //  select.shopId = shopId;

  const options = params || {};
  // const options = params || {
  //   fields: {
  //     id: 1,
  //     label: 1
  //   },
  //   sort: {
  //     label: 1
  //   }
  // };

  // appends a count to the collection
  // we're doing this for use with griddleTable
  Counts.publish(this, "taxcode-count", TaxCodes.find(
    select,
    options
  ));

  return TaxCodes.find(
    select,
    options
  );
});
