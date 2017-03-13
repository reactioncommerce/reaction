import React, { Component, PropTypes } from "react";
import { Translation } from "/imports/plugins/core/ui/client/components";
<<<<<<< HEAD
import { formatPriceString } from "/client/api";
=======
>>>>>>> de8f1fffe5aef67a7e2057589b0a567c1405b2df

class LineItems extends Component {
  constructor(props) {
    super(props);
    this.renderLineItem = this.renderLineItem.bind(this);
  }

  renderLineItem(uniqueItem, quantity) {
    return (
      <div className="order-items">
        <div
          className="invoice order-item form-group order-summary-form-group"
          onClick={() => this.props.handleClick(uniqueItem._id)}
        >
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
          <div className="order-detail-quantity">
            {quantity || 1}
          </div>
          <div className="order-detail-price">
            <div className="invoice-details">
            {uniqueItem.variants.price}
            </div>
          </div>
      </div>
    </div>
    );
  }

<<<<<<< HEAD
  renderLineItemInvoice(uniqueItem) {
=======
  renderLineItemInvoice() {
>>>>>>> de8f1fffe5aef67a7e2057589b0a567c1405b2df
    return (
      <div>
        <div className="order-summary-form-group">
          <strong><Translation defaultValue="Subtotal" i18nKey="cartSubTotals.subtotal"/></strong>
          <div className="invoice-details">
<<<<<<< HEAD
            {formatPriceString(uniqueItem.variants.price)}
=======
            0
>>>>>>> de8f1fffe5aef67a7e2057589b0a567c1405b2df
          </div>
        </div>
        <div className="order-summary-form-group">
          <strong><Translation defaultValue="Shipping" i18nKey="cartSubTotals.shipping"/></strong>
          <div className="invoice-details">
<<<<<<< HEAD
            {formatPriceString(this.props.invoice.shipping)}
          </div>
        </div>
        <div className="order-summary-form-group">
          <strong>Item tax</strong>
=======
            0
          </div>
        </div>
        <div className="order-summary-form-group">
          <strong><Translation defaultValue="Tax" i18nKey="cartSubTotals.tax"/></strong>
>>>>>>> de8f1fffe5aef67a7e2057589b0a567c1405b2df
          <div className="invoice-details">
            0
          </div>
        </div>
        <div className="order-summary-form-group">
<<<<<<< HEAD
          <strong>Tax code</strong>
          <div className="invoice-details">
            {uniqueItem.variants.taxCode}
=======
          <strong><Translation defaultValue="Tax codes"/></strong>
          <div className="invoice-details">
            0
>>>>>>> de8f1fffe5aef67a7e2057589b0a567c1405b2df
          </div>
        </div>
        <hr/>
        <div className="order-summary-form-group">
          <strong>TOTAL</strong>
          <div className="invoice-details">
            0
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
              <div key={uniqueItem._id}> { this.renderLineItem(uniqueItem, uniqueItem.length) } </div>
            );
          }
          return (
            <div className="roll-up-invoice-list" key={uniqueItem._id}>
              <div style={{ float: "right" }}>
                <button className="rui btn btn-default flat icon-only" onClick={() => onClose(uniqueItem._id)}>
                  <i
                    className="rui font-icon fa-lg fa fa-times"
                  />
                </button>
              </div><br/><br/>
              {uniqueItem.items.map((item) => (
                <div key={item._id}>
                  { this.renderLineItem(item) }
<<<<<<< HEAD
                  { this.renderLineItemInvoice(item) }
=======
                  { this.renderLineItemInvoice() }
>>>>>>> de8f1fffe5aef67a7e2057589b0a567c1405b2df
                </div>
              ))}
            </div>
          );
        })}
      </div>
    );
  }
}

LineItems.propTypes = {
  displayMedia: PropTypes.func,
  handleClick: PropTypes.func,
  isExpanded: PropTypes.func,
  onClose: PropTypes.func,
  uniqueItems: PropTypes.array
};

export default LineItems;
