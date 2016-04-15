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

export default Item;
