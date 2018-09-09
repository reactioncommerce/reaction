import React, { Component } from "react";
import { compose } from "recompose";
import PropTypes from "prop-types";
import Radium from "radium";
import classnames from "classnames";
import { registerComponent, withCSSTransition } from "@reactioncommerce/reaction-components";

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
    CSSTransition: PropTypes.func,
    children: PropTypes.node,
    isVisible: PropTypes.bool,
    onClick: PropTypes.func
  };

  render() {
    const { CSSTransition, isVisible } = this.props;
    if (CSSTransition === undefined) {
      return null;
    }

    const baseClassName = classnames({
      rui: true,
      overlay: true
    });

    return (
      <CSSTransition
        in={isVisible}
        unmountOnExit
        classNames="fade-in-out"
        timeout={200}
      >
        <div
          aria-hidden={true}
          className={baseClassName}
          style={styles.base}
          onClick={this.props.onClick}
          key="overlay"
        />
      </CSSTransition>
    );
  }
}

registerComponent("Overlay", Overlay, [
  withCSSTransition,
  Radium
]);

export default compose(
  withCSSTransition,
  Radium
)(Overlay);
