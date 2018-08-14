import React, { Component } from "react";
import { compose } from "recompose";
import PropTypes from "prop-types";
import Radium from "radium";
import classnames from "classnames";
import { registerComponent, withAnimateHeight } from "@reactioncommerce/reaction-components";

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
    AnimateHeight: PropTypes.func,
    children: PropTypes.node,
    expanded: PropTypes.bool, // eslint-disable-line react/boolean-prop-naming
    padded: PropTypes.bool // eslint-disable-line react/boolean-prop-naming
  };

  render() {
    const { AnimateHeight } = this.props;
    if (!AnimateHeight) {
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

registerComponent("CardBody", CardBody, [
  withAnimateHeight,
  Radium
]);

export default compose(
  withAnimateHeight,
  Radium
)(CardBody);
