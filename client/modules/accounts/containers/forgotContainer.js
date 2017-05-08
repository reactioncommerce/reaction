import React, { Component } from "react";
import { composeWithTracker } from "/lib/api/compose";
import { Forgot } from "../components";

class ForgotContainer extends Component {
  constructor(props) {
    super(props);

    this.handleFormSubmit = this.handleFormSubmit.bind(this);
  }

  handleFormSubmit = (event, email) => {
    event.preventDefault();
  }

  render() {
    return (
      <Forgot
        {...this.props}
        onFormSubmit={this.handleFormSubmit}
      />
    );
  }
}

function composer(props, onData) {
  onData(null, {});
}

export default composeWithTracker(composer)(ForgotContainer);
