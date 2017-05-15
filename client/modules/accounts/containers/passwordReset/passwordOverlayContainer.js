import React, { Component, PropTypes } from "react";
import { composeWithTracker } from "/lib/api/compose";
import { UpdatePasswordOverlay } from "../../components";
import { MessagesContainer } from "../helpers";

class UpdatePasswordOverlayContainer extends Component {
  constructor(props) {
    super(props);

    console.log("PROPS in UpdatePasswordOverlayContainer", props);

    this.state = {
      formMessages: props.formMessages
    };

    this.formMessages = this.formMessages.bind(this);
    this.hasError = this.hasError.bind(this);
  }

  formMessages = () => {
    return (
      <MessagesContainer
        messages={this.state.formMessages}
      />
    );
  }

  hasError = (error) => {
    // True here means the field is valid
    // We're checking if theres some other message to display
    if (error !== true && typeof error !== "undefined") {
      return true;
    }

    return false;
  }

  render() {
    return (
      <UpdatePasswordOverlay
        {...this.props}
        loginFormMessages={this.formMessages}
        onError={this.hasError}
        messages={this.state.formMessages}
      />
    );
  }
}

function composer(props, onData) {
  const uniqueId = Random.id();
  const formMessages = {};

  onData(null, {
    uniqueId,
    formMessages
  });
}

UpdatePasswordOverlayContainer.propTypes = {
  formMessages: PropTypes.object
};

export default composeWithTracker(composer)(UpdatePasswordOverlayContainer);
