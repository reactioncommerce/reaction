import React from "react";
import PropTypes from "prop-types";

class Item extends React.Component {
  render() {
    return (
      <div className="rui item">
        {this.props.children}
      </div>
    );
  }
}

Item.displayName = "Item";

Item.propTypes = {
  children: PropTypes.node
};

export default Item;
