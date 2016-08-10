import { Meteor } from "meteor/meteor";
import { check } from "meteor/check";
import { Packages } from "/lib/collections";
import { Reaction, Logger } from "/server/api";
import Launchdock from "../lib/launchdock";

Meteor.methods({
  /**
   * Sets custom domain name, confirms SSL key/cert exists.
   * @param  {Object} opts - custom SSL cert details
   * @return {Boolean} - returns true on successful update
   */
  "launchdock/setCustomSsl"(opts) {
    if (!Reaction.hasAdminAccess()) {
      const err = "Access denied";
      Logger.error(err);
      throw new Meteor.Error("auth-error", err);
    }

    if (!process.env.LAUNCHDOCK_USERID) {
      const err = "Launchdock credentials not found";
      Logger.error(err);
      throw new Meteor.Error("launchdock-credential-error", err);
    }

    check(opts, {
      domain: String,
      privateKey: String,
      publicCert: String
    });

    this.unblock();

    const ldConnect = Packages.findOne({
      name: "reaction-connect"
    });

    // save everything locally
    try {
      Packages.update(ldConnect._id, {
        $set: {
          "settings.ssl.domain": opts.domain,
          "settings.ssl.privateKey": opts.privateKey,
          "settings.ssl.certificate": opts.publicCert
        }
      });
    } catch (e) {
      Logger.error(e);
      throw new Meteor.Error(e);
    }

    // build args for method on Launchdock side
    const stackId = process.env.LAUNCHDOCK_STACK_ID;
    const ldArgs = {
      name: opts.domain,
      key: opts.privateKey,
      cert: opts.publicCert
    };

    const launchdock = Launchdock.connect(ldUrl);

    if (!launchdock) {
      const err = "Unable to connect to Launchdock";
      Logger.error(err);
      throw new Meteor.Error(err);
    }

    const result = launchdock.call("rancher/updateStackSSLCert", stackId, ldArgs);

    launchdock.disconnect();

    return result;
  },


  "launchdock/getDefaultDomain"() {
    if (!Reaction.hasAdminAccess()) {
      const err = "Access denied";
      Logger.error(err);
      throw new Meteor.Error("auth-error", err);
    }

    return process.env.LAUNCHDOCK_DEFAULT_DOMAIN;
  },


  "launchdock/getLoadBalancerEndpoint"() {
    if (!Reaction.hasAdminAccess()) {
      const err = "Access denied";
      Logger.error(err);
      throw new Meteor.Error("auth-error", err);
    }

    return process.env.LAUNCHDOCK_BALANCER_ENDPOINT;
  }

});
