import React, { Component, PropTypes } from "react";
import { Translation } from "/imports/plugins/core/ui/client/components";

class LineItems extends Component {
  render() {
    const { uniqueItems, isExpanded, displayMedia, handleClick, onClose } = this.props;
    return (
      <div>
        {uniqueItems.map((uniqueItem) => {
          if (!isExpanded(uniqueItem._id)) {
            return (
              <LineItem
                key={uniqueItem._id}
                uniqueItem={uniqueItem}
                quantity={uniqueItem.length}
                displayMedia={displayMedia}
                handleClick={handleClick}
              />
            );
          }
          return (
            <div className="roll-up-invoice-list">
              <div style={{ float: "right" }}>
                <button className="rui btn btn-default flat icon-only" onClick={() => onClose(uniqueItem._id)}>
                  <i
                    className="rui font-icon fa-lg fa fa-times"
                  />
                </button>
              </div><br/><br/>
              {uniqueItem.items.map((item) => (
                <div key={item._id}>
                  <LineItem
                    uniqueItem={item}
                    displayMedia={displayMedia}
                    handleClick={handleClick}
                  />
                  <InvoiceForm
                    uniqueItemDetails={item.variants}
                  />
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

class LineItem extends Component {
  render() {
    const { uniqueItem, handleClick, displayMedia, quantity } = this.props;

    return (
      <div>
        <div className="order-items">
              <div
                className="invoice order-item form-group order-summary-form-group"
                onClick={() => handleClick(uniqueItem._id)}
              >
                <div className="order-item-media">
                  { !displayMedia(uniqueItem.variants) &&
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
      </div>
    );
  }
}

LineItem.propTypes = {
  displayMedia: PropTypes.func,
  handleClick: PropTypes.func,
  uniqueItem: PropTypes.object
};

class InvoiceForm extends Component {
  render() {
    return (
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
}

export default LineItems;
