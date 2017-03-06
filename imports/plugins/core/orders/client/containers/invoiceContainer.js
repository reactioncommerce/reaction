import React, { Component } from "react";
import { composeWithTracker } from "/lib/api/compose";
// import { Reaction } from "/client/api";
import { Loading } from "/imports/plugins/core/ui/client/components";
import { TranslationProvider } from "/imports/plugins/core/ui/client/providers";
import { Orders } from "/lib/collections";
import Invoice from "../components/invoice.js";

class InvoiceContainer extends Component {
  render() {
    return (
      <TranslationProvider>
        <Invoice />
      </TranslationProvider>
    );
  }
}

const composer = ({}, onData) => {
  const subscription = Meteor.subscribe("Orders");

  if (subscription.ready()) {
    const order = Orders.find();
    onData(null, { order });
  }
};

export default composeWithTracker(composer, Loading)(InvoiceContainer);
