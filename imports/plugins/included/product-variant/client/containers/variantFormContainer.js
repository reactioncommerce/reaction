import React, { Component } from "react";
import { composeWithTracker } from "/lib/api/compose";
import VariantForm from "../components/variantForm";

class VariantFormContainer extends Component {
  render() {
    return (
      <VariantForm/>
    );
  }
}

function composer(props, onData) {
  onData(null, {});
}

export default composeWithTracker(composer)(VariantFormContainer);
