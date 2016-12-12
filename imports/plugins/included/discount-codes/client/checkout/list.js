import React, { Component, PropTypes } from "react";
import { Cart } from "/lib/collections";
import { Loading, Translation } from "/imports/plugins/core/ui/client/components";
import DiscountForm from "./form";
import { composeWithTracker } from "/lib/api/compose";
import { Reaction } from "/client/api";

class DiscountList extends Component {
  constructor(props) {
    super(props);
    this.handleClick = this.handleClick.bind(this);
  }

  // handle remove click
  handleClick(event, codeId) {
    return Meteor.call("discounts/codes/remove", this.props.cartId, codeId);
  }
  // list items
  renderList() {
    const listItems = this.props.listItems.map((listItem) => {
      return this.renderItem(listItem.id, listItem.code, listItem.discount);
    });

    return (
      <div className="rui list-group">{listItems}</div>
    );
  }
  // render item
  renderItem(_id, code, discount) {
    return (
      <div className="rui list-group-item" key={_id}>
        <span>
          <label>{code} - {discount} <Translation defaultValue="Discount applied" i18nKey={"discounts.applied"} />
          </label>
        </span>
        <span className="pull-right">
          <i className="fa fa-trash fa-lg" onClick={(e) => this.handleClick(e, _id)}/>
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

  // render list view
  render() {
    const { listItems } = this.props;
    return (listItems.length >= 1) ? this.renderList() : this.renderNoneFound();
  }
}

DiscountList.propTypes = {
  cartId: PropTypes.string,
  listItems: PropTypes.array
};

function composer(props, onData) {
  const sub = Reaction.Subscriptions.Cart;

  if (sub.ready()) {
    const currentCart = Cart.findOne({
      _id: props.cartId
    });

    const listItems = [];
    for (billing of currentCart.billing) {
      if (billing.paymentMethod && billing.paymentMethod.processor === "discount-code") {
        listItems.push({
          id: billing._id,
          code: billing.paymentMethod.code,
          discount: billing.paymentMethod.amount
        });
      }
    }

    onData(null, {
      cartId: props.cartId,
      listItems: listItems
    });
  }
}


// export default composeWithTracker(composer)(DiscountList)
const options = {
  propsToWatch: ["billing"]
};

let discountListComponent = DiscountList;
discountListComponent = composeWithTracker(composer, options)(discountListComponent);

export default discountListComponent;
