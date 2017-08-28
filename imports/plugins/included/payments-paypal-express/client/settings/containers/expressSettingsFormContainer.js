import { compose, withProps } from "recompose";
import { registerComponent, composeWithTracker } from "@reactioncommerce/reaction-components";
import { Meteor } from "meteor/meteor";
import { Packages } from "/lib/collections";
import { Reaction, i18next } from "/client/api";
import { ExpressSettingsForm } from "../components";
import { PaypalExpressPackageConfig } from "/imports/plugins/included/payments-paypal-express/lib/collections/schemas/paypal";


const handlers = {
  handleChange(e) {
    e.preventDefault();
    this.setState({ apiKey: e.target.value });
  },
  handleSubmit(settings) {
    const packageId = this.props.packageData._id;
    const settingsKey = this.props.packageData.registry[0].settingsKey;

    const fields = [{
      property: "apiKey",
      value: settings.apiKey
    }, {
      property: "support",
      value: settings.support
    }];

    this.saveUpdate(fields, packageId, settingsKey);
  },
  saveUpdate(fields, id, settingsKey) {
    Meteor.call("registry/update", id, settingsKey, fields, (err) => {
      if (err) {
        return Alerts.toast(i18next.t("admin.settings.saveFailed"), "error");
      }
      return Alerts.toast(i18next.t("admin.settings.saveSuccess"), "success");
    });
  }
};


const composer = ({}, onData) => {
  const subscription = Meteor.subscribe("Packages", Reaction.getShopId());
  if (subscription.ready()) {
    const packageData = Packages.findOne({
      name: "reaction-paypal-express",
      shopId: Reaction.getShopId()
    });
    onData(null, {
      packageSchema: PaypalExpressPackageConfig,
      packageData
    });
  }
};

export default compose(
  withProps(handlers),
  composeWithTracker(composer)
)(ExpressSettingsForm);
