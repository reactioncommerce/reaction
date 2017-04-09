import React, { PropTypes } from "react";

const CartItems = ({ handleLowInventory, pdpPath, handleBgImage, handleImage, handleRemoveItem, items }) => {
  return (
    <div>
      {items.map((item, key) => {
        const bgImage = handleBgImage(item);
        const itemStyle = { backgroundImage: `url('${bgImage}')`, display: "inline-block" };
        return (
          <div className="cart-items" key={key} id={item.productId + item.variants._id} style={itemStyle}>
            <div className="remove-cart-item fa fa-times fa-lg"
              data-target={item._id}
              onClick={handleRemoveItem}
            >{}</div>
            <a href={pdpPath(item)}
              data-event-category="cart"
              data-event-action="product-click"
              data-event-label="Cart product click"
              data-event-value={item.productId}
            >{handleImage(item)}</a>
            <div className="cart-labels">{handleLowInventory(item)}</div>
          </div>
        );
      })}
    </div>
  );
};

CartItems.propTypes = {
  handleBgImage: PropTypes.func,
  handleImage: PropTypes.func,
  handleLowInventory: PropTypes.func,
  handleRemoveItem: PropTypes.func,
  items: PropTypes.array,
  pdpPath: PropTypes.func
};

export default CartItems;
