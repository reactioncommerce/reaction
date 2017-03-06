import React, { Component, PropTypes } from "react";

class LineItems extends Component {
  render() {
    const items = this.props.items;

    return (
      <div>
        <div className="order-items" onClick={this.props.handleClick}>
          {items.map((item) => (
            <div className="order-item form-group order-summary-form-group" key={item._id}>
              <div className="order-item-media">
                { !this.props.displayMedia(item.variants) &&
                  <img src= "/resources/placeholder.gif" />
                }
              </div>
              <div className="order-item-details">
                <div className="order-detail-title">
                {item.title} <br/><small>{item.variants.title}</small>
                </div>
              </div>

              <div className="order-detail-price">
                <div className="amount">
                  {item.variants.price}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }
}

LineItems.propTypes = {
  displayMedia: PropTypes.func,
  handleClick: PropTypes.func,
  items: PropTypes.array
};

export default LineItems;
