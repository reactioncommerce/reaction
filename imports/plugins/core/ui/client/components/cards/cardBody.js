import React, { Component, PropTypes } from "react";
import { VelocityTransitionGroup } from "velocity-react";

class CardBody extends Component {

  renderCard() {
    if (this.props.expanded) {
      return (
        <div className="panel-body">
          {this.props.children}
        </div>
      );
    }

    return null;
  }

  render() {
    return (
      <VelocityTransitionGroup
        enter={{animation: "slideDown"}}
        leave={{animation: "slideUp"}}
      >
        {this.renderCard()}
      </VelocityTransitionGroup>
    );
  }
}

CardBody.defaultProps = {
  expandable: false,
  expanded: true
};

CardBody.propTypes = {
  children: PropTypes.node,
  expanded: PropTypes.bool
};

export default CardBody;
