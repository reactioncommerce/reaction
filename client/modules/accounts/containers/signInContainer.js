import React, { Component } from "react";
import { composeWithTracker } from "/lib/api/compose";
import { SignIn } from "../components";

class SignInContainer extends Component {
  constructor(props) {
    super(props);
  }

  render() {
    return (
      <SignIn />
    );
  }
}

function composer(props, onData) {
  onData(null, {});
}

export default composeWithTracker(composer)(SignInContainer);
