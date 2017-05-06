import React, { Component } from "react";
import { composeWithTracker } from "/lib/api/compose";
import { Forgot } from "../components";

class ForgotContainer extends Component {
  constructor(props) {
    super(props);
  }

  render() {
    return (
      <Forgot
        {...this.props}
      />
    );
  }
}

function composer(props, onData) {
  onData(null, {});
}

export default composeWithTracker(composer)(ForgotContainer);
