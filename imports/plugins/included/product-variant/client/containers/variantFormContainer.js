import React, { Component } from "react";
import { composeWithTracker } from "/lib/api/compose";
import { ReactionProduct } from "/lib/api";
import { Packages } from "/lib/collections";
import { Countries } from "/client/collections";
import { Reaction } from "/client/api";
import { TaxCodes } from "/imports/plugins/core/taxes/lib/collections";
import VariantForm from "../components/variantForm";

class VariantFormContainer extends Component {
  constructor(props) {
    super(props);

    this.isProviderEnabled = this.isProviderEnabled.bind(this);
    this.fetchTaxCodes = this.fetchTaxCodes.bind(this);
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

  fetchTaxCodes = () => {
    const shopId = Reaction.getShopId();
    const provider = Packages.findOne({
      "shopId": shopId,
      "registry.provides": "taxCodes",
      "$where": function () {
        const providerName = _.filter(this.registry, (o) => o.provides === "taxCodes")[0].name.split("/")[2];
        return this.settings[providerName].enabled;
      }
    });
    const taxCodesArray = [];

    const codes = TaxCodes.find({
      shopId: shopId,
      taxCodeProvider: provider.name
    });

    codes.forEach(function (code) {
      taxCodesArray.push({
        value: code.taxCode,
        label: `${code.taxCode} | ${code.label}`
      });
    });
    return taxCodesArray;
  }

  render() {
    return (
      <VariantForm
        isProviderEnabled={this.isProviderEnabled}
        fetchTaxCodes={this.fetchTaxCodes}
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
    variant: selectedVariant
  });
}

export default composeWithTracker(composer)(VariantFormContainer);
