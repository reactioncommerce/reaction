import React from "react";
import PropTypes from "prop-types";

class Items extends React.Component {
  render() {
    return (
      <div className="rui items">
        {this.props.children}
      </div>
    );
  }
}

Items.displayName = "Items";

Items.propTypes = {
  children: PropTypes.node
};

export default Items;
