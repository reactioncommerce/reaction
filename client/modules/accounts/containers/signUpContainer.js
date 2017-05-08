import React, { Component } from "react";
import { composeWithTracker } from "/lib/api/compose";
import { SignUp } from "../components";

class SignUpContainer extends Component {
  constructor(props) {
    super(props);

    this.handleFormSubmit = this.handleFormSubmit.bind(this);
  }

  handleFormSubmit = (event, email, password) => {
    event.preventDefault();
  }

  render() {
    return (
      <SignUp
        {...this.props}
        onFormSubmit={this.handleFormSubmit}
      />
    );
  }
}

function composer(props, onData) {
  onData(null, {});
}

export default composeWithTracker(composer)(SignUpContainer);
