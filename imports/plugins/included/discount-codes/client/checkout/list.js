import React, { Component, PropTypes } from "react";
import { Cart } from "/lib/collections";
import { Loading } from "/imports/plugins/core/ui/client/components";
import DiscountForm from "./form";

export default class DiscountList extends Component {
  constructor(props) {
    super(props);
    const currentCart = Cart.findOne(this.props.cartId);
    this.listItems = [];
    for (billing of currentCart.billing) {
      if (billing.paymentMethod && billing.paymentMethod.processor === "discount-code") {
        this.listItems.push(this.renderItem(billing._id, billing.paymentMethod.code));
      }
    }

    this.handleClick = this.handleClick.bind(this);
  }
  // handle remove click
  handleClick(event, codeId) {
    return Meteor.call("discounts/codes/remove", this.props.cartId, codeId);
  }
  // render item
  renderItem(_id, code) {
    return (
      <div className="rui list-group-item" key={_id}>
        <span>{code}</span>
        <span className="pull-right">
          <i className="fa fa-trash" onClick={(e) => this.handleClick(e, _id)}/>
        </span>
      </div>
    );
  }
  // list loading
  renderLoader() {
    return (
      <Loading/>
    );
  }

  // list loading
  renderNoneFound() {
    return (
      <DiscountForm cartId={this.props.cartId}/>
    );
  }
  // list items
  renderList() {
    return (
      <div className="rui list-group">{this.listItems}</div>
    );
  }
  // render list view
  render() {
    return this.listItems.length ? this.renderList() : this.renderNoneFound();
  }
}

DiscountList.propTypes = {
  cartId: PropTypes.string
};
