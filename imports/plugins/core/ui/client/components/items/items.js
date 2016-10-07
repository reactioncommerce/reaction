import React from "react";

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
  children: React.PropTypes.node
};

export default Items;
