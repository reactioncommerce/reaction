import React, { Component, PropTypes } from "react";
import { VelocityTransitionGroup } from "velocity-react";
import Radium from "radium";
import classnames from "classnames";

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
            this.props.padded === false ? styles.noPadding : void 0
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

export default Radium(CardBody);
