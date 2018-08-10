import React, { Component } from "react";
import { compose } from "recompose";
import PropTypes from "prop-types";
import Radium from "radium";
import classnames from "classnames";
import { registerComponent, withVelocityTransitionGroup } from "@reactioncommerce/reaction-components";

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
    padded: PropTypes.bool, // eslint-disable-line react/boolean-prop-naming
    VelocityTransitionGroup: PropTypes.func
  };

  constructor(props) {
    super(props);
  }

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
    const { VelocityTransitionGroup } = this.props;
    if (VelocityTransitionGroup === undefined) {
      return null;
    }

    return (
      <VelocityTransitionGroup
        enter={{ animation: "slideDown", duration: 200 }}
        leave={{ animation: "slideUp", duration: 200 }}
      >
        {this.renderCard()}
      </VelocityTransitionGroup>
    );
  }
}

registerComponent("CardBody", CardBody, [
  withVelocityTransitionGroup,
  Radium
]);

export default compose(
  withVelocityTransitionGroup,
  Radium
)(CardBody);
