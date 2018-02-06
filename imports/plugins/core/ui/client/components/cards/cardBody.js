import React, { Component } from "react";
import PropTypes from "prop-types";
import { VelocityTransitionGroup } from "velocity-react";
import Radium from "radium";
import classnames from "classnames";
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
    expanded: PropTypes.bool,
    padded: PropTypes.bool
  };

  renderCard() {
    if (this.props.expanded) {
      const baseClassName = classnames({
        "rui": true,
        "panel-body": true,
        "no-padding": this.props.padded === false
      });

      return (
        <div
          className={baseClassName}
          style={[
            this.props.padded === false ? styles.noPadding : undefined
          ]}
        >
          {this.props.children}
        </div>
      );
    }

    return null;
  }

  render() {
    return (
      <VelocityTransitionGroup
        enter={{ animation: "slideDown" }}
        leave={{ animation: "slideUp" }}
      >
        {this.renderCard()}
      </VelocityTransitionGroup>
    );
  }
}

registerComponent("CardBody", CardBody, Radium);

export default Radium(CardBody);
