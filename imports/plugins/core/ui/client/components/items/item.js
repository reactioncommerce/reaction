import React from "react";

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
  children: React.PropTypes.node
};

export default Item;
