import React, { Component } from "react";
import PropTypes from "prop-types";
import Button from "@reactioncommerce/components/Button/v1";


class SuccessScreen extends Component {
  handleOkButtonClick = () => {
    this.props.onChangeActiveScreen("initial");
  }

  render() {
    return (
      <div>
        <div className="row text-center">
          <h3>Your import job request has been added to the queue.</h3>
          <Button
            className="btn btn-primary"
            bezelStyle="solid"
            onClick={this.handleOkButtonClick}
          >
            Ok
          </Button>
        </div>
      </div>
    );
  }
}

SuccessScreen.propTypes = {
  onChangeActiveScreen: PropTypes.func
};

export default SuccessScreen;
