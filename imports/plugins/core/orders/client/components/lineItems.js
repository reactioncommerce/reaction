import React, { Component, PropTypes } from "react";
import { Translation } from "/imports/plugins/core/ui/client/components";

class LineItems extends Component {
  render() {
    const props = this.props;
    console.log("Line items", this.props);
    return (
      <div>
         <div className="order-items">
          {props.uniqueItems.map((uniqueItem) => (
            <div key={uniqueItem._id}>
            <div className="invoice order-item form-group order-summary-form-group" onClick={() => this.props.handleClick(uniqueItem._id)}>
              <div className="order-item-media">
                { !this.props.displayMedia(uniqueItem.variants) &&
                  <img src= "/resources/placeholder.gif" />
                }
              </div>
              <div className="order-item-details">
                <div className="order-detail-title">
                {uniqueItem.title} <br/><small>{uniqueItem.variants.title}</small>
                </div>
              </div>

              <div className="order-detail-price">
                <div className="amount">
                  {uniqueItem.variants.price}
                </div>
              </div>
            </div>
            {/*{this.props.isExpanded(item._id) &&
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
              }*/}
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
  isExpanded: PropTypes.func,
  items: PropTypes.array
};

export default LineItems;
