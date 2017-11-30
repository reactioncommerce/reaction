import { compose, withProps } from "recompose";
import { composeWithTracker, registerComponent } from "@reactioncommerce/reaction-components";
import { Meteor } from "meteor/meteor";
import { Reaction } from "/client/api";
import { AuthNetPackageConfig } from "../../lib/collections/schemas";
import { AuthnetSettingsForm } from "../components";

/**
 * @file This is a container for AuthnetSettingsForm.
 * @module authnetSettingsFormContainer
 */
const handlers = {
  /**
    * handleSubmit
    * @method
    * @summary event handler for when new Authnet settings are submitted.
    * @param {Object} event - event info.
    * @param {Object} changedInfo - info about the new Authnet settings.
    * @param {String} targetField - where to save the new settings in the
    * Authnet Package.
    * @since 1.5.2
    * @return {null} - returns nothing
  */
  handleSubmit(/* event, changedInfo , targetField */) {
    // console.log("changedInfo: ", changedInfo);
    // console.log("targetField: ", targetField);
  }
};

const composer = (props, onData) => {
  const shownFields = {
    ["settings.mode"]: AuthNetPackageConfig._schema["settings.mode"],
    ["settings.api_id"]: AuthNetPackageConfig._schema["settings.api_id"],
    ["settings.transaction_key"]: AuthNetPackageConfig._schema["settings.transaction_key"]
  };
  const packageSub = Meteor.subscribe("Packages", Reaction.getShopId());

  if (packageSub.ready()) {
    const packageData = Reaction.getPackageSettings("reaction-auth-net");
    onData(null, {
      schema: AuthNetPackageConfig,
      settings: packageData.settings,
      shownFields
    });
  }
};

registerComponent("AuthnetSettingsForm", AuthnetSettingsForm, [
  withProps(handlers), composeWithTracker(composer)
]);

export default compose(withProps(handlers), composeWithTracker(composer))(AuthnetSettingsForm);
