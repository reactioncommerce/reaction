import React, { Component } from "react";
import { compose } from "recompose";
import PropTypes from "prop-types";
import Radium from "radium";
import classnames from "classnames";
import { registerComponent, withCSSTransitionGroup } from "@reactioncommerce/reaction-components";

const styles = {
  base: {
    position: "fixed",
    top: 0,
    left: 0,
    width: "100%",
    height: "100%",
    backgroundColor: "rgba(0, 0, 0, 0.7)",
    zIndex: 1040,
    padding: 0
  }
};

class Overlay extends Component {
  static defaultProps = {
    isVisible: true
  };

  static propTypes = {
    CSSTransitionGroup: PropTypes.func,
    children: PropTypes.node,
    isVisible: PropTypes.bool,
    onClick: PropTypes.func
  };

  state = {
    enterAnimation: {
      animation: { opacity: 1 },
      duration: 200
    },
    leaveAnimation: {
      animation: { opacity: 0 },
      duration: 200
    }
  }

  renderOverlay() {
    if (this.props.isVisible) {
      const baseClassName = classnames({
        rui: true,
        overlay: true
      });

      return (
        <div
          aria-hidden={true}
          className={baseClassName}
          style={styles.base}
          onClick={this.props.onClick}
          key="overlay"
        />
      );
    }

    return null;
  }

  render() {
    const { CSSTransitionGroup } = this.props;
    if (CSSTransitionGroup === undefined) {
      return null;
    }

    return (
      <CSSTransitionGroup
        transitionName="fade-in-out"
        transitionEnterTimeout={200}
        transitionLeaveTimeout={200}
      >
        {this.renderOverlay()}
      </CSSTransitionGroup>
    );
  }
}

registerComponent("Overlay", Overlay, [
  withCSSTransitionGroup,
  Radium
]);

export default compose(
  withCSSTransitionGroup,
  Radium
)(Overlay);
