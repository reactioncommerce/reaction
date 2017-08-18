import React, { Component } from "react";
import PropTypes from "prop-types";
import { isEmpty } from "lodash";
import classnames from "classnames";
import { Meteor } from "meteor/meteor";
import { Roles } from "meteor/alanning:roles";
import { Reaction } from "/client/api";
import { formatPriceString } from "/client/api";
import { Popover, Button, Checkbox, NumberTypeInput, RolloverCheckbox, Translation } from  "@reactioncommerce/reaction-ui";

class LineItems extends Component {
  static propTypes = {
    displayMedia: PropTypes.func,
    editedItems: PropTypes.array,
    getRefundedItemsInfo: PropTypes.func,
    getSelectedItemsInfo: PropTypes.func,
    handleInputChange: PropTypes.func,
    handleItemSelect: PropTypes.func,
    handleReturnItems: PropTypes.func,
    handleSelectAllItems: PropTypes.func,
    isRefunding: PropTypes.bool,
    selectAllItems: PropTypes.bool,
    selectedItems: PropTypes.array,
    uniqueItems: PropTypes.array
  }

  state = {
    isOpen: false
  }

  calculateTotal(price, shipping, taxes) {
    return formatPriceString(price + shipping + taxes);
  }

  displayMedia(uniqueItem) {
    const { displayMedia } = this.props;

    if (displayMedia(uniqueItem)) {
      return (
        <img src={displayMedia(uniqueItem).url()}/>
      );
    }
    return (
      <img src= "/resources/placeholder.gif" />
    );
  }

  displayQuantity(uniqueItem) {
    if (this.state.isOpen) {
      return (
        <div>
          {!this.props.selectedItems.includes(uniqueItem._id) ?
            <NumberTypeInput
              minValue={0}
              defaultValue={uniqueItem.quantity}
              onChange={(event, value) => this.props.handleInputChange(event, value, uniqueItem)}
              maxValue={uniqueItem.quantity}
            /> :
            <div>0</div>
          }
        </div>
      );
    }
    return (
      <div>{uniqueItem.quantity}</div>
    );
  }

  renderLineItem(uniqueItem) {
    const className = classnames({
      "order-items": true,
      "invoice-item": true,
      "selected": this.props.selectedItems.includes(uniqueItem._id) && this.state.isOpen
    });

    return (
      <div className={className}>
        <div
          className="order-item form-group order-summary-form-group"
        >
          <div className={classnames({
            "order-item-media": true,
            "popover-mode": this.state.isOpen
          })}
          >
            {this.state.isOpen ?
              <RolloverCheckbox
                className="order-invoice-rollover"
                checkboxClassName="checkbox-avatar checkbox-large"
                onChange={() => this.props.handleItemSelect(uniqueItem)}
                checked={this.props.selectedItems.includes(uniqueItem._id)}
              >
                {this.displayMedia(uniqueItem)}
              </RolloverCheckbox>
              :
              <div>
                {this.displayMedia(uniqueItem)}
              </div>
            }
          </div>

          <div className="order-item-details">
            <div className="order-detail-title">
              {uniqueItem.title} <br/><small>{uniqueItem.variants.title}</small>
            </div>
          </div>

          <div className="order-detail-quantity">
            {this.displayQuantity(uniqueItem)}
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
      <div className="invoice-order-items">
        <div className="invoice-order-item-shipping">
          <b className="pull-left">
            <Translation
              defaultValue="Shipping"
              i18nKey="cartSubTotals.shipping"
            />
          </b>
          <span className="pull-right">{formatPriceString(uniqueItem.shipping.rate)}</span>
        </div>
        <div className="invoice-order-item-tax">
          <b>
            <Translation
              defaultValue="Tax"
              i18nKey="cartSubTotals.tax"
            />
          </b>
          <div className="tax-code">
            <span>
              {uniqueItem.taxDetail ? uniqueItem.taxDetail.taxCode : uniqueItem.variants.taxCode}
            </span>
          </div>
          <div className="tax-cost">
            <span>
              {uniqueItem.taxDetail ?
                formatPriceString(uniqueItem.taxDetail.tax / uniqueItem.quantity) :
                formatPriceString(0)
              }
            </span>
          </div>
        </div>
        <div className="invoice-order-item-subtotal">
          <b className="pull-left">
            <Translation
              defaultValue="Subtotal"
              i18nKey="cartSubTotals.subtotal"
            />
          </b>
          <b className="pull-right">{formatPriceString(uniqueItem.variants.price * uniqueItem.quantity)}</b>
        </div>
      </div>
    );
  }

  renderLineItemRefund() {
    const { editedItems } = this.props;
    return (
      <div>
        <div className="invoice-refund-edited">
          <div className="refund-header">
            <div>
              <Translation defaultValue="For Refund" i18nKey="admin.invoice.refundLabel"/>
            </div>
            <div>
              <Translation defaultValue="Items" i18nKey="admin.invoice.refundItems"/>
            </div>
            <div>
              <Translation defaultValue="Total" i18nKey="admin.invoice.refundItemAmount"/>
            </div>
          </div>
          <div className="refund-body">
            {editedItems.map((item, index) => (
              <div className="refund-item" key={index}>
                <div>
                  <span>{item.title}</span>
                </div>
                <div>
                  <span>{item.refundedQuantity}</span>
                </div>
                <div>
                  <span>{formatPriceString(item.refundedTotal)}</span>
                </div>
              </div>
            )
            )}
            <div className="refund-item return">
              <div>
                <b><Translation defaultValue="RETURN TOTAL" i18nKey="admin.invoice.refundTotal"/></b>
              </div>
              <div>
                <span>
                  {this.props.getRefundedItemsInfo().quantity}
                </span>
              </div>
              <div>
                <span>
                  {formatPriceString(this.props.getRefundedItemsInfo().total)}
                </span>
              </div>
            </div>
          </div>
          <div className="refund-include-shipping">
            <div className="pull-right">
              <Checkbox
                className="checkbox-large"
                label="Include Shipping"
                checked={true}
              />
            </div>
          </div>
        </div>
      </div>
    );
  }

  renderPopOver() {
    return (
      <Popover
        isOpen={this.state.isOpen}
        attachment="middle center"
        targetAttachment="middle center"
        showDropdownButton={false}
      >
        {this.popOverContent()}
      </Popover>
    );
  }

  popOverContent() {
    return (
      <div className="invoice-popover">
        <div className="invoice-popover-controls">
          <Checkbox
            className="checkbox-large"
            checked={this.props.selectAllItems || this.props.selectedItems.length === this.props.uniqueItems.length}
            onChange={() => this.props.handleSelectAllItems(this.props.uniqueItems)}
          />
          <div className="invoice-popover-close">
            <Button
              className="rui btn btn-default flat icon-only pull-right"
              icon="fa-2x fa fa-times"
              bezelStyle="flat"
              onClick={() => this.setState({
                isOpen: false
              })}
            />
          </div>
        </div>
        <div>
          {this.props.uniqueItems.map((uniqueItem, index) => (
            <div key={index}>
              {this.renderLineItem(uniqueItem)}
              {this.renderLineItemInvoice(uniqueItem)}
            </div>
          ))}
        </div>
        <div>
          {!isEmpty(this.props.editedItems) && this.renderLineItemRefund()}
        </div>
        <div className="invoice-actions">
          <div className="invoice-action-cancel">
            <Button
              className="pull-right"
              bezelStyle="solid"
              status="default"
              label="Cancel"
              onClick={() => {
                this.setState({
                  isOpen: false
                });
              }}
            />
          </div>
          <div className="invoice-action-refund">
            <Button
              className="pull-right"
              bezelStyle="solid"
              status="primary"
              disabled={this.props.isRefunding || this.props.editedItems.length === 0}
              onClick={this.props.handleReturnItems}
            >
              {this.props.isRefunding ? <span>Refunding <i className="fa fa-spinner fa-spin" /></span> :
                <span>Refund Items</span>
              }
            </Button>
          </div>
        </div>
      </div>
    );
  }

  render() {
    const { uniqueItems } = this.props;
    return (
      <div className="invoice invoice-line-items" onClick={() => this.setState({
        isOpen: true
      })}
      >
        {uniqueItems.map((uniqueItem) => {
          return (
            <div key={uniqueItem._id}> {this.renderLineItem(uniqueItem)} </div>
          );
        })}

        {
          Roles.userIsInRole(Meteor.userId(), ["orders", "dashboard/orders"], Reaction.getShopId()) &&
          this.renderPopOver()
        }
      </div>
    );
  }
}

export default LineItems;
