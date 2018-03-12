import React, { Component } from "react";
import PropTypes from "prop-types";
import { isEmpty } from "lodash";
import classnames from "classnames";
import { Meteor } from "meteor/meteor";
import { Roles } from "meteor/alanning:roles";
import { formatPriceString, Reaction } from "/client/api";
import { Components, registerComponent } from "@reactioncommerce/reaction-components";

/**
 * @file LineItems React Component for displaying the actionable data on the invoice section on the orders sideview
 *
 * @module LineItems
 * @extends Component
 */

class LineItems extends Component {
  /**
   * @name LineItems propTypes
   * @summary React component for displaying the actionable data on the invoice section on the orders sideview
   * @param {Object} props - React PropTypes
   * @property {Object} order - An object represnting an order
   * @property {Object} uniqueItems - An object representing a line item
   * @property {Array} editedItems - An array/list of line items that have been edited/modified
   * @property {Array} selectedItems - An array of all the line items  that have been selected
   * @property {Function} displayMedia - A function to display line items images
   * @property {Function} clearRefunds - A function to clear edited/selected items
   * @property {Function} getRefundedItemsInfo - A function that returns an object containing refunded items info
   * @property {Function} getSelectedItemsInfo - A function that returns an object containing selected items info
   * @property {Function} handleInputChange - A function to handle numeric input change
   * @property {Function} handleItemSelect - A function to handle selecting an item via chekbox
   * @property {Function} handlePopOverOpen - A function to handle the popover open and close
   * @property {Function} handleRefundItems - A function to handle items return
   * @property {Function} handleSelectAllItems - A function to handle selecting of all items
   * @property {Bool} selectAllItems - A boolean indicating whether all items have been selected
   * @property {Bool} isRefunding - A boolean indicating whether payment is being refunded
   * @property {Bool} popOverIsOpen - A boolean indicating whether popover is open
   * @return {Node} React node containing component for displaying the `invoice` section on the orders sideview
   */
  static propTypes = {
    clearRefunds: PropTypes.func,
    displayMedia: PropTypes.func,
    editedItems: PropTypes.array,
    getRefundedItemsInfo: PropTypes.func,
    getSelectedItemsInfo: PropTypes.func,
    handleInputChange: PropTypes.func,
    handleItemSelect: PropTypes.func,
    handlePopOverOpen: PropTypes.func,
    handleRefundItems: PropTypes.func,
    handleSelectAllItems: PropTypes.func,
    isRefunding: PropTypes.bool,
    order: PropTypes.object,
    popOverIsOpen: PropTypes.bool,
    selectAllItems: PropTypes.bool,
    selectedItems: PropTypes.array,
    uniqueItems: PropTypes.array
  }

  displayMedia(uniqueItem) {
    const { displayMedia } = this.props;

    return (
      <Components.ProductImage
        item={uniqueItem}
        displayMedia={displayMedia}
        size="thumbnail"
        badge={false}
      />
    );
  }

  renderLineItem(uniqueItem) {
    return (
      <div className="order-items invoice-item">
        <div
          className="order-item form-group order-summary-form-group"
        >
          <div className="order-item-media">
            <div>
              {this.displayMedia(uniqueItem)}
            </div>
          </div>

          <div className="order-item-details">
            <div className="order-detail-title">
              {uniqueItem.title} <br/><small>{uniqueItem.variants.title}</small>
            </div>
          </div>

          <div className="order-detail-quantity">
            <div>{uniqueItem.quantity}</div>
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

  renderPopOverLineItem(uniqueItem) {
    const className = classnames({
      "order-items": true,
      "invoice-item": true,
      "selected": this.props.selectedItems.includes(uniqueItem._id)
    });

    return (
      <div className={className}>
        <div
          className="order-item form-group order-summary-form-group"
        >
          <div className="order-item-media popover-mode">
            <Components.RolloverCheckbox
              className="order-invoice-rollover"
              checkboxClassName="checkbox-avatar checkbox-large"
              onChange={() => this.props.handleItemSelect(uniqueItem)}
              checked={this.props.selectedItems.includes(uniqueItem._id)}
            >
              {this.displayMedia(uniqueItem)}
            </Components.RolloverCheckbox>
          </div>

          <div className="order-item-details">
            <div className="order-detail-title">
              {uniqueItem.title} <br/><small>{uniqueItem.variants.title}</small>
            </div>
          </div>

          <div className="order-detail-quantity">
            {!this.props.selectedItems.includes(uniqueItem._id) && uniqueItem.quantity > 0 ?
              <Components.NumberTypeInput
                minValue={0}
                defaultValue={uniqueItem.quantity}
                onChange={(event, value) => this.props.handleInputChange(event, value, uniqueItem)}
                maxValue={uniqueItem.quantity}
              /> :
              <div>0</div>
            }
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
        {this.props.order.taxes &&
          <div className="invoice-order-item-tax">
            <b>
              <Components.Translation
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
                  formatPriceString(uniqueItem.taxDetail.tax) :
                  formatPriceString(uniqueItem.tax)
                }
              </span>
            </div>
          </div>
        }
        <div className="invoice-order-item-subtotal">
          <b>
            <Components.Translation
              defaultValue="Subtotal"
              i18nKey="cartSubTotals.subtotal"
            />
          </b>
          <span><b>{formatPriceString(uniqueItem.variants.price * uniqueItem.quantity)}</b></span>
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
              <Components.Translation defaultValue="For Refund" i18nKey="admin.invoice.refundLabel"/>
            </div>
            <div>
              <Components.Translation defaultValue="Items" i18nKey="admin.invoice.refundItems"/>
            </div>
            <div>
              <Components.Translation defaultValue="Total" i18nKey="admin.invoice.refundItemAmount"/>
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
            ))}
            <div className="refund-item return">
              <div>
                <b><Components.Translation defaultValue="RETURN TOTAL" i18nKey="admin.invoice.refundTotal"/></b>
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
        </div>
      </div>
    );
  }

  renderPopOver() {
    return (
      <Components.Popover
        isOpen={this.props.popOverIsOpen}
        attachment="middle center"
        targetAttachment="middle center"
        constraints={[
          {
            to: "scrollParent",
            pin: true
          },
          {
            to: "window",
            attachment: "together"
          }
        ]}
        showDropdownButton={false}
      >
        {this.popOverContent()}
      </Components.Popover>
    );
  }

  popOverContent() {
    return (
      <div className="invoice-popover">
        <div className="invoice-popover-controls">
          <Components.Checkbox
            className="checkbox-large"
            checked={this.props.selectAllItems || this.props.selectedItems.length === this.props.uniqueItems.length}
            onChange={() => this.props.handleSelectAllItems(this.props.uniqueItems)}
          />
          <div className="invoice-popover-close">
            <Components.Button
              className="rui btn btn-default flat icon-only pull-right"
              icon="fa-2x fa fa-times"
              bezelStyle="flat"
              onClick={this.props.clearRefunds}
            />
          </div>
        </div>
        <div>
          {this.props.uniqueItems.map((uniqueItem, index) => (
            <div key={index}>
              {this.renderPopOverLineItem(uniqueItem)}
              {this.renderLineItemInvoice(uniqueItem)}
            </div>
          ))}
        </div>
        <div>
          {!isEmpty(this.props.editedItems) && this.renderLineItemRefund()}
        </div>
        <div className="invoice-actions">
          <div className="invoice-action-cancel">
            <Components.Button
              className="pull-right"
              bezelStyle="solid"
              status="default"
              label="Cancel"
              onClick={this.props.clearRefunds}
            />
          </div>
          <div className="invoice-action-refund">
            <Components.Button
              className="pull-right"
              bezelStyle="solid"
              status="primary"
              disabled={this.props.isRefunding || this.props.editedItems.length === 0}
              onClick={this.props.handleRefundItems}
            >
              {this.props.isRefunding ? <span>Refunding <i className="fa fa-spinner fa-spin" /></span> :
                <span>Refund Items</span>
              }
            </Components.Button>
          </div>
        </div>
      </div>
    );
  }

  render() {
    const { uniqueItems } = this.props;
    return (
      <Components.Button
        tagName="div"
        className={{
          "btn": false,
          "btn-default": false,
          "flat": false,
          "invoice": true,
          "invoice-line-items": true
        }}
        onClick={this.props.handlePopOverOpen}
      >
        {uniqueItems.map((uniqueItem) => (
          <div key={uniqueItem._id}> {this.renderLineItem(uniqueItem)} </div>
        ))}

        {
          Roles.userIsInRole(Meteor.userId(), ["orders", "dashboard/orders"], Reaction.getShopId()) &&
          this.renderPopOver()
        }
      </Components.Button>
    );
  }
}

registerComponent("LineItems", LineItems);

export default LineItems;
