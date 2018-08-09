import React, { Component } from "react";
import PropTypes from "prop-types";
import Radium from "radium";
import classnames from "classnames";
import Logger from "@reactioncommerce/logger";
import { registerComponent } from "@reactioncommerce/reaction-components";

const styles = {
  noPadding: {
    padding: 0
  }
};

class CardBody extends Component {
  static defaultProps = {
    expandable: false,
    expanded: true
  };

  static propTypes = {
    children: PropTypes.node,
    expanded: PropTypes.bool, // eslint-disable-line react/boolean-prop-naming
    padded: PropTypes.bool // eslint-disable-line react/boolean-prop-naming
  };

  state = {
    AnimateHeight: undefined
  };

  render() {
    const { AnimateHeight } = this.state;
    if (AnimateHeight === undefined) {
      import("react-animate-height")
        .then((module) => {
          this.setState({
            AnimateHeight: module.default
          });
          return module;
        })
        .catch((error) => {
          Logger.error(error.message, "Unable to load react-animate-height");
        });
      return null;
    }

    const baseClassName = classnames({
      "rui": true,
      "panel-body": true,
      "no-padding": this.props.padded === false
    });
    const height = this.props.expanded && "auto" || 0;

    return (
      <AnimateHeight
        duration={200}
        height={height}
      >
        <div
          className={baseClassName}
          style={[
            this.props.padded === false ? styles.noPadding : undefined
          ]}
        >
          {this.props.children}
        </div>
      </AnimateHeight>
    );
  }
}

registerComponent("CardBody", CardBody, Radium);

export default Radium(CardBody);
