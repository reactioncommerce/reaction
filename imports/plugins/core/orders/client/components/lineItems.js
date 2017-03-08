import React, { Component, PropTypes } from "react";
import { Translation } from "/imports/plugins/core/ui/client/components";
import _ from "lodash";

class LineItems extends Component {
  render() {
    return (
      <div>
        {this.props.uniqueItems.map((uniqueItem) => {
          if (!this.props.isExpanded(uniqueItem._id)) {
            return (
              <LineItem
                key={uniqueItem._id}
                uniqueItem={uniqueItem}
                quantity={uniqueItem.length}
                displayMedia={this.props.displayMedia}
                handleClick={this.props.handleClick}
              />
            );
          }
          return (
            <div className="roll-up-invoice-list">
              <div>
                <button className="rui btn btn-default flat icon-only" onClick={() => this.props.onClose(uniqueItem._id)}>
                  <i
                    className="rui font-icon fa-lg fa fa-times"
                  />
                </button>
              </div>
              {_.times(uniqueItem.length, () => (
                <div>
                  <LineItem
                    uniqueItem={uniqueItem}
                    displayMedia={this.props.displayMedia}
                    handleClick={this.props.handleClick}
                  />
                  <InvoiceForm
                    uniqueItemDetails={uniqueItem.variants}
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

class LineItem extends Component {
  render() {
    const uniqueItem = this.props.uniqueItem;
    const quantity = this.props.quantity || 1;
    return (
      <div>
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
                  {quantity}
                </div>
                <div className="order-detail-price">
                  <div className="amount">
                  {uniqueItem.variants.price}
                  </div>
                </div>
              </div>
            </div>
      </div>
    );
  }
}

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
      </div>
    );
  }
}

LineItem.propTypes = {
  uniqueItem: PropTypes.object,
  displayMedia: PropTypes.func,
  handleClick: PropTypes.func,
  isExpanded: PropTypes.func,
  items: PropTypes.array
};

export default LineItems;
