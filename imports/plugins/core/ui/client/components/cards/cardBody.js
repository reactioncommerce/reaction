import React, { Component } from "react";
import PropTypes from "prop-types";
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
    expanded: PropTypes.bool, // eslint-disable-line react/boolean-prop-naming
    padded: PropTypes.bool // eslint-disable-line react/boolean-prop-naming
  };

  state = {
    VelocityTransitionGroup: undefined
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
    const { VelocityTransitionGroup } = this.state;
    if (VelocityTransitionGroup === undefined) {
      import("velocity-react").then((module) => {
        this.setState({
          VelocityTransitionGroup: module.VelocityTransitionGroup
        });
      });
      return null;
    }
    
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
