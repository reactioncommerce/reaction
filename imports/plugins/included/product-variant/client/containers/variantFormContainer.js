import React, { Component } from "react";
import { composeWithTracker } from "/lib/api/compose";
import { ReactionProduct } from "/lib/api";
import { Countries } from "/client/collections";
import VariantForm from "../components/variantForm";

class VariantFormContainer extends Component {
  render() {
    return (
      <VariantForm
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
