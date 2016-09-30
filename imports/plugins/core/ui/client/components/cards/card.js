import React, { Component, PropTypes } from "react";

class Card extends Component {
  render() {
    return (
      <div className="panel panel-default">
        {this.props.children}
      </div>
    );
  }
}

Card.propTypes = {
  children: PropTypes.node
};

export default Card;
