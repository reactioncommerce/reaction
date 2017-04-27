import React, { Component } from "react";
import { Reaction } from "/client/api";
import EmptyCartDrawer from "../components/emptyCartDrawer";

class EmptyCartContainer extends Component {
  handleKeepShopping(event) {
    event.stopPropagation();
    event.preventDefault();
    return $("#cart-drawer-container").fadeOut(300, function () {
      return Reaction.toggleSession("displayCart");
    });
  }
  render() {
    return (
      <div>
        <EmptyCartDrawer keepShopping={this.handleKeepShopping}/>
      </div>
    );
  }
}

export default EmptyCartContainer;
