import React, { Component, PropTypes } from "react";
import { formatPriceString } from "/client/api";
import { Translation } from "/imports/plugins/core/ui/client/components";

class LineItems extends Component {

  static propTypes = {
    displayMedia: PropTypes.func,
    handleClick: PropTypes.func,
    isExpanded: PropTypes.func,
    onClose: PropTypes.func,
    uniqueItems: PropTypes.array
  }

  calculateTotal(price, shipping, taxes) {
    return formatPriceString(price + shipping + taxes);
  }

  renderLineItem(uniqueItem, quantity) {
    const { handleClick, displayMedia } = this.props;

    return (
      <div className="order-items">
        <div
          className="invoice order-item form-group order-summary-form-group"
          onClick={() => handleClick(uniqueItem._id)}
          style={{ height: 70 }}
        >

          <div className="order-item-media" style={{ marginLeft: 15 }}>
            { !displayMedia(uniqueItem) ?
              <img src= "/resources/placeholder.gif" /> :
              <img
                src={displayMedia(uniqueItem).url()}
              />
            }
          </div>

          <div className="order-item-details">
            <div className="order-detail-title">
            {uniqueItem.title} <br/><small>{uniqueItem.variants.title}</small>
            </div>
          </div>

          <div className="order-detail-quantity">
           {quantity || uniqueItem.quantity}
          </div>

          <div className="order-detail-price">
            <div className="invoice-details" style={{ marginRight: 15 }}>
              <strong>{formatPriceString(uniqueItem.variants.price)}</strong>
            </div>
          </div>

      </div>
    </div>
    );
  }

  renderLineItemInvoice(uniqueItem) {
    return (
      <div>
        <div className="order-summary-form-group">
          <strong><Translation defaultValue="Subtotal" i18nKey="cartSubTotals.subtotal"/></strong>
          <div className="invoice-details">
            {formatPriceString(uniqueItem.variants.price)}
          </div>
        </div>

        <div className="order-summary-form-group">
          <strong><Translation defaultValue="Shipping" i18nKey="cartSubTotals.shipping"/></strong>
          <div className="invoice-details">
            {formatPriceString(uniqueItem.shipping.rate)}
          </div>
        </div>

        <div className="order-summary-form-group">
          <strong>Item tax</strong>
          <div className="invoice-details">
            {uniqueItem.taxDetail ? formatPriceString(uniqueItem.taxDetail.tax / uniqueItem.quantity) : formatPriceString(0)}
          </div>
        </div>

        <div className="order-summary-form-group">
          <strong>Tax code</strong>
          <div className="invoice-details">
            {uniqueItem.taxDetail ? uniqueItem.taxDetail.taxCode : uniqueItem.variants.taxCode}
          </div>
        </div>

        <div className="order-summary-form-group">
          <strong>TOTAL</strong>
          <div className="invoice-details">
            {uniqueItem.taxDetail ?
              <strong>
                {this.calculateTotal(uniqueItem.variants.price, uniqueItem.shipping.rate, uniqueItem.taxDetail.tax)}
              </strong> :
               <strong>
                {this.calculateTotal(uniqueItem.variants.price, uniqueItem.shipping.rate, 0)}
              </strong>
            }
          </div>
        </div>
        <br/>
      </div>
    );
  }

  render() {
    const { uniqueItems, isExpanded, onClose } = this.props;
    return (
      <div>
        {uniqueItems.map((uniqueItem) => {
          if (!isExpanded(uniqueItem._id)) {
            return (
              <div key={uniqueItem._id}> { this.renderLineItem(uniqueItem) } </div>
            );
          }

          return (
            <div className="roll-up-invoice-list" key={uniqueItem._id}>
              <div className="roll-up-content">

                <div style={{ float: "right" }}>
                  <button className="rui btn btn-default flat icon-only" onClick={() => onClose(uniqueItem._id)}>
                    <i
                      className="rui font-icon fa-lg fa fa-times"
                    />
                  </button>
                </div>

                <br/><br/>

                {[...Array(uniqueItem.quantity)].map((v, i) =>
                  <div key={i}>
                    { this.renderLineItem(uniqueItem, 1) }
                    { this.renderLineItemInvoice(uniqueItem) }
                  </div>
                )}

              </div>
          </div>
          );
        })}
      </div>
    );
  }
}

export default LineItems;
