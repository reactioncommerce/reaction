import React, { Component, PropTypes } from "react";
import { Translation } from "/imports/plugins/core/ui/client/components";

class LineItems extends Component {
  render() {
    const items = this.props.items;
    console.log(this.props);
    return (
      <div>
        <div className="order-items">
          {items.map((item) => (
            <div>
            <div className="invoice order-item form-group order-summary-form-group" key={item._id} onClick={this.props.handleClick}>
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
              {this.props.isExpanded &&
                <div>
                  <div className="order-summary-form-group">
                    <strong><Translation defaultValue="Subtotal" i18nKey="cartSubTotals.subtotal"/></strong>
                    <div className="invoice-details">
                      0
                    </div>
                  </div>

                  <div className="order-summary-form-group">
                    <strong><Translation defaultValue="Shipping" i18nKey="cartSubTotals.shipping"/></strong>
                    <div className="invoice-details">
                      0
                    </div>
                  </div>

                  <div className="order-summary-form-group">
                    <strong><Translation defaultValue="Tax" i18nKey="cartSubTotals.tax"/></strong>
                    <div className="invoice-details">
                      0
                    </div>
                  </div>

                  <div className="order-summary-form-group">
                    <strong><Translation defaultValue="Tax codes"/></strong>
                    <div className="invoice-details">
                      0
                    </div>
                  </div>
                </div>
              }
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
  isExpanded: PropTypes.bool,
  items: PropTypes.array
};

export default LineItems;
