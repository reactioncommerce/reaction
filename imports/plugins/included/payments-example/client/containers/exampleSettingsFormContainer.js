import { composeWithTracker } from "/lib/api/compose";
import { ExampleSettingsForm } from "../components";
import { Packages } from "/lib/collections";
import { Reaction } from "/client/api";

const composer = ({}, onData) => {
  const subscription = Meteor.subscribe("Packages");
  if (subscription.ready()) {
    const packageData = Packages.findOne({
      name: "example-paymentmethod",
      shopId: Reaction.getShopId()
    });
    onData(null, { packageData });
  }
};

const ExampleSettingsFormContainer = composeWithTracker(composer)(ExampleSettingsForm);

export default ExampleSettingsFormContainer;
