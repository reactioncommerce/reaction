import React, { Component } from "react";
import PropTypes from "prop-types";
import { Meteor } from "meteor/meteor";
import { Roles } from "meteor/alanning:roles";
import { Reaction } from "/client/api";
import { formatPriceString } from "/client/api";
import { Popover, Button, Checkbox, NumberTypeInput, RolloverCheckbox, Translation } from  "@reactioncommerce/reaction-ui";

class LineItems extends Component {
  static propTypes = {
    displayMedia: PropTypes.func,
    editedItems: PropTypes.array,
    handleItemSelect: PropTypes.func,
    handleSelectAllItems: PropTypes.func,
    inputOnChange: PropTypes.func,
    invoice: PropTypes.object,
    isHovered: PropTypes.func,
    isUpdating: PropTypes.bool,
    popOverIsOpen: PropTypes.bool,
    selectAllItems: PropTypes.bool,
    selectedItems: PropTypes.array,
    togglePopOver: PropTypes.func,
    toggleUpdating: PropTypes.func,
    uniqueItems: PropTypes.array
  }

  state = {
    isOpen: false
  }

  calculateTotal(price, shipping, taxes) {
    return formatPriceString(price + shipping + taxes);
  }

  // handleInputOnchange(value, uniqueItem) {
  //   return this.props.inputOnChange(value, uniqueItem);
  // }

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

  renderLineItem(uniqueItem) {
    return (
      <div className="order-items">
        <div
          className="order-item form-group order-summary-form-group"
        >
          <div className="order-item-media">
            {this.state.isOpen ?
              <RolloverCheckbox
                checkboxClassName="checkbox-avatar checkbox-large"
                onChange={() => this.props.handleItemSelect(uniqueItem._id)}
                checked={this.props.selectedItems.includes(uniqueItem._id)}
              >
                {this.displayMedia(uniqueItem)}
              </RolloverCheckbox>
              :
              <div style={{ marginLeft: 15 }}>
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
            {this.state.isOpen ?
              <NumberTypeInput
                minValue={0}
                onChange={this.props.inputOnChange}
                defaultValue={uniqueItem.quantity}
                maxValue={uniqueItem.quantity}
              /> :
              <div>{uniqueItem.quantity}</div>
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
      <div className="invoive-order-items">
        <div className="invoice-order-item-shipping">
          <b className="pull-left">
            <Translation
              defaultValue="Shipping"
              i18nKey="cartSubTotals.shipping"
            />
          </b>
          <span className="pull-right">{formatPriceString(uniqueItem.variants.price)}</span>
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
          <b className="pull-right">{formatPriceString(uniqueItem.variants.price)}</b>
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
        <div className="invoice-actions">
          <div className="invoice-action-cancel">
            <Button
              className="pull-right"
              bezelStyle="solid"
              status="default"
              label="Cancel"
              onClick={() => {}}
            />
          </div>
          <div className="invoice-action-refund">
            <Button
              className="pull-right"
              bezelStyle="solid"
              status="primary"
              label="Refund Items"
            />
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
          Roles.userIsInRole(Meteor.userId(), ["orders", "dashboard/orders"], Reaction.getShopId()) ?
            this.renderPopOver() :
            null
        }
      </div>
    );
  }
}

export default LineItems;
