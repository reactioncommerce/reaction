import React, { Component, PropTypes } from "react";

class CardGroup extends Component {
  render() {
    return (
      <div className="panel-group">
        {this.props.children}
      </div>
    );
  }
}

CardGroup.propTypes = {
  children: PropTypes.node
};

export default CardGroup;
