import React, { Component } from "react";
import { composeWithTracker } from "/lib/api/compose";
import { ReactionProduct } from "/lib/api";
import { Packages } from "/lib/collections";
import { Countries } from "/client/collections";
import { Reaction } from "/client/api";
import VariantForm from "../components/variantForm";

class VariantFormContainer extends Component {
  constructor(props) {
    super(props);

    this.isProviderEnabled = this.isProviderEnabled.bind(this);
  }

  isProviderEnabled = () => {
    const shopId = Reaction.getShopId();

    const provider = Packages.findOne({
      "shopId": shopId,
      "registry.provides": "taxCodes",
      "$where": function () {
        const providerName = this.name.split("-")[1];
        return this.settings[providerName].enabled;
      }
    });

    if (provider) {
      return true;
    }
    return false;
  }
  render() {
    return (
      <VariantForm
        isProviderEnabled={this.isProviderEnabled}
        {...this.props}
      />
    );
  }
}

function composer(props, onData) {
  const countries = Countries.find({}).fetch();
  const selectedVariant = ReactionProduct.selectedVariant();

  onData(null, {
    countries,
    selectedVariant
  });
}

export default composeWithTracker(composer)(VariantFormContainer);
