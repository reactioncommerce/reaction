import React, { Component } from "react";
import PropTypes from "prop-types";
import Button from "@reactioncommerce/components/Button/v1";

class MappingScreen extends Component {
  handleClickBack = () => {
    this.props.onSetActiveScreen("detail");
  };

  handleClickDone = () => {
    this.props.onDone();
  };

  render() {
    return (
      <div>
        <div className="row pull-right mt20 mb20">
          <Button actionType="secondary" onClick={this.handleClickBack} className="mr20">Back</Button>
          <Button onClick={this.handleClickDone}>Done</Button>
        </div>
      </div>
    );
  }
}

MappingScreen.propTypes = {
  onDone: PropTypes.func,
  onSetActiveScreen: PropTypes.func
};

export default MappingScreen;
