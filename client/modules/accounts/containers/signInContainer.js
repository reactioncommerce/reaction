import React, { Component } from "react";
import { composeWithTracker } from "/lib/api/compose";
import { SignIn } from "../components";

class SignInContainer extends Component {
  constructor(props) {
    super(props);

    this.handleFormSubmit = this.handleFormSubmit.bind(this);
  }

  handleFormSubmit = (event, email, password) => {
    event.preventDefault();
  }

  render() {
    return (
      <SignIn
        {...this.props}
        onFormSubmit={this.handleFormSubmit}
      />
    );
  }
}

function composer(props, onData) {
  onData(null, {});
}

export default composeWithTracker(composer)(SignInContainer);
