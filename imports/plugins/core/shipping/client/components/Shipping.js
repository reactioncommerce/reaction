import React, { Component } from "react";
import Blaze from "meteor/gadicc:blaze-react-component";

export default class Shipping extends Component {
  render() {
    return (
      <div>
        <h4>Shipping</h4>
        <Blaze template="shippingSettings" {...this.props} />
      </div>
    );
  }
}
