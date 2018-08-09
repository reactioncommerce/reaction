import React, { Component } from "react";
import PropTypes from "prop-types";
import Radium from "radium";
import classnames from "classnames";
import { registerComponent } from "@reactioncommerce/reaction-components";
import Logger from "@reactioncommerce/logger";

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
    children: PropTypes.node,
    isVisible: PropTypes.bool,
    onClick: PropTypes.func
  };

  state = {
    CSSTransitionGroup: undefined,
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
    const { CSSTransitionGroup } = this.state;
    if (CSSTransitionGroup === undefined) {
      import("react-transition-group")
        .then((module) => {
          this.setState({
            CSSTransitionGroup: module.CSSTransitionGroup
          });
          return module;
        })
        .catch((error) => {
          Logger.error(error.message, "Unable to load react-transition-group");
        });

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

registerComponent("Overlay", Overlay, Radium);

export default Radium(Overlay);
