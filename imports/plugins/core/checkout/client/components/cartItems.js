import React, { Component } from "react";
import PropTypes from "prop-types";
import { Components, registerComponent } from "@reactioncommerce/reaction-components";

class CartItems extends Component {
  static propTypes = {
    handleImage: PropTypes.func,
    handleRemoveItem: PropTypes.func,
    handleShowProduct: PropTypes.func,
    item: PropTypes.object,
    pdpPath: PropTypes.func
  }

  handleClick = (event) => {
    event.preventDefault();

    if (typeof this.props.handleShowProduct === "function") {
      this.props.handleShowProduct(this.props.item);
    }
  }

  removalClick = (event) => {
    event.preventDefault();

    if (typeof this.props.handleRemoveItem === "function") {
      this.props.handleRemoveItem(event, this.props.item);
    }
  }

  render() {
    const {
      pdpPath,
      handleImage,
      item
    } = this.props;

    const mediaUrl = handleImage(item);

    return (
      <div
        className="cart-items"
        key={item._id}
        style={{ display: "inline-block" }}
      >
        <Components.IconButton
          icon="fa fa-times fa-lg remove-cart-item"
          onClick={this.removalClick}
          kind="removeItem"
        />
        <a href={pdpPath(item)}
          data-event-action="product-click"
          data-event-value={item.productId}
          onClick={this.handleClick}
        >
          {mediaUrl ?
            <div className="center-cropped" style={{ backgroundImage: `url('${mediaUrl}')` }}>
              <img src={mediaUrl} className="product-grid-item-images img-responsive" alt="" />
            </div> :
            <div className="center-cropped" style={{ backgroundImage: "url('/resources/placeholder.gif')" }}>
              <img src="/resources/placeholder.gif" className="product-grid-item-images img-responsive" alt="" />
            </div>
          }
        </a>
        <div className="cart-labels">
          <div>
            <span className="badge" style={{ marginRight: "3px" }}>{item.quantity}</span>
            <span className="cart-item-title">
              {item.title}
              <br />
              <small>{item.variantTitle}</small>
            </span>
          </div>
        </div>
      </div>
    );
  }
}

registerComponent("CartItems", CartItems);

export default CartItems;
