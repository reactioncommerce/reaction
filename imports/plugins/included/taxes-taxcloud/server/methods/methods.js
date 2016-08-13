import { Meteor } from "meteor/meteor";
import { Match, check } from "meteor/check";
import { HTTP } from "meteor/http";
import { EJSON } from "meteor/ejson";
import { Logger } from "/server/api";
import Reaction from "../../core/taxes/server/api";

Meteor.methods({
  /**
   * taxes/fetchTIC
   * Tax Code fixture data.
   * We're using https://taxcloud.net
   * just to get an intial import data set
   * this service doesn't require taxcloud id
   * but other services need authorization
   * use TAXCODE_SRC  to override source url
   * @param  {String} url alternate url to fetch TaxCodes from
   * @return {undefined}
   */
  "taxes/fetchTIC": function (url) {
    check(url, Match.Optional(String));
    // check(url, Match.Optional(SimpleSchema.RegEx.Url));

    // pretty info
    if (url) {
      Logger.info("Fetching TaxCodes from source: ", url);
    }
    // allow for custom taxCodes from alternate sources
    const TAXCODE_SRC = url || "https://taxcloud.net/tic/?format=json";
    const taxCodes = HTTP.get(TAXCODE_SRC);

    if (taxCodes.data && Reaction.Import.taxCode) {
      for (json of taxCodes.data.tic_list) {
        // transform children and flatten
        // first level of tax children
        // TODO: is there a need to go further
        if (json.tic.children) {
          const children = json.tic.children;
          delete json.tic.children; // remove child levels for now
          // process chilren
          for (json of children) {
            delete json.tic.children; // remove child levels for now
            const taxCode = EJSON.stringify([json.tic]);
            Reaction.Import.process(taxCode, ["id", "label"], Reaction.Import.taxCode);
          }
        }
        // parent code process
        const taxCode = EJSON.stringify([json.tic]);
        Reaction.Import.process(taxCode, ["id", "label"], Reaction.Import.taxCode);
      }
      // commit tax records
      Reaction.Import.flush();
    } else {
      throw new Meteor.error("unable to load taxcodes.");
    }
  }
});
