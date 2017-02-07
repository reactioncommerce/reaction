import React, { Component, PropTypes } from "react";
import { VelocityTransitionGroup } from "velocity-react";
import Radium from "radium";
import classnames from "classnames";

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
        rui: true
      });

      return (
        <div
          className={baseClassName}
          style={styles.base}
          onClick={this.props.onClick}
        />
      );
    }

    return null;
  }

  render() {
    return (
      <VelocityTransitionGroup
        enter={this.state.enterAnimation}
        leave={this.state.leaveAnimation}
      >
        {this.renderOverlay()}
      </VelocityTransitionGroup>
    );
  }
}

export default Radium(Overlay);
