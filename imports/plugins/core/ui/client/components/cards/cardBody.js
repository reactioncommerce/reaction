import React, { Component, PropTypes } from "react";

class CardBody extends Component {
  render() {
    return (
      <div className="panel-body">
        {this.props.children}
      </div>
    );
  }
}

CardBody.propTypes = {
  children: PropTypes.node
};

export default CardBody;
