import React, { Component } from "react";
import { composeWithTracker } from "/lib/api/compose";
import { SignUp } from "../components";

class SignUpContainer extends Component {
  constructor(props) {
    super(props);
  }

  render() {
    return (
      <SignUp />
    );
  }
}

function composer(props, onData) {
  onData(null, {});
}

export default composeWithTracker(composer)(SignUpContainer);
