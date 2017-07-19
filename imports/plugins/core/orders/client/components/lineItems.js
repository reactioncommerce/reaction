import React, { Component } from "react";
import PropTypes from "prop-types";
import _ from "lodash";
import classnames from "classnames";
import { Meteor } from "meteor/meteor";
import { Roles } from "meteor/alanning:roles";
import { Reaction } from "/client/api";
import { formatPriceString } from "/client/api";
import { Translation } from "/imports/plugins/core/ui/client/components";
import { Popover, Button, Checkbox, NumberTypeInput, RolloverCheckbox } from "/imports/plugins/core/ui/client/components";

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

  calculateTotal(price, shipping, taxes) {
    return formatPriceString(price + shipping + taxes);
  }

  handleInputOnchange(value, uniqueItem) {
    return this.props.inputOnChange(value, uniqueItem);
  }

  renderLineItem(uniqueItem, quantity) {
    const { displayMedia } = this.props;
    return (
      <div className="order-items">
        <div
          className="order-item form-group order-summary-form-group"
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

  toggleMediaHover(uniqueItem) {
    const { displayMedia, selectedItems, handleItemSelect } = this.props;
    return (
      <RolloverCheckbox
        checkboxClassName="checkbox-large"
        onChange={() =>  handleItemSelect(uniqueItem._id)}
        checked={selectedItems.includes(uniqueItem._id)}
      >
        { !displayMedia(uniqueItem) ?
          <img src= "/resources/placeholder.gif" /> :
          <img src={displayMedia(uniqueItem).url()}/>
        }
      </RolloverCheckbox>
    );
  }

  renderLineItemInvoice() {
    return (
      <div className="invoive-order-items">
        <div className="invoice-order-item-shipping">
          <b className="pull-left"><Translation defaultValue="Shipping" i18nKey="cartSubTotals.shipping"/></b>
          <span className="pull-right">$10.00</span>
        </div>
        <div className="invoice-order-item-tax">
          <div>
            <b><Translation defaultValue="Tax" i18nKey="cartSubTotals.tax"/></b>
          </div>
          <div className="tax-code">
            <span>PC030100</span>
          </div>
          <div className="tax-cost">
            <span>0.00</span>
          </div>
        </div>
        <div className="invoice-order-item-subtotal">
          <b className="pull-left"><Translation defaultValue="Subtotal" i18nKey="cartSubTotals.subtotal"/></b>
          <b className="pull-right">$169.99</b>
        </div>
      </div>
    );
  }

  renderLineItems() {
    const { uniqueItems, selectedItems } = this.props;

    return (
      <div>
        { uniqueItems.map((uniqueItem, index) => {
          return (
            <div key={index}>
              <div
                className={selectedItems.includes(uniqueItem._id) ?
                  classnames({ "order-items invoice-item": true, "selected": true }) :
                  "order-items invoice-item"
                }
              >
                <div
                  className="order-item form-group order-summary-form-group"
                >
                  <div className="invoice-order-line-media">
                    {this.toggleMediaHover(uniqueItem)}
                  </div>

                  <div className="order-item-details">
                    <div className="order-detail-title">
                      {uniqueItem.title}
                    </div>
                  </div>

                  <div className="order-detail-quantity invoice-order-quantity">
                    <NumberTypeInput
                      minValue={0}
                      onChange={(editedValue) => this.handleInputOnchange(editedValue, uniqueItem)}
                      defaultValue={uniqueItem.quantity}
                      maxValue={uniqueItem.quantity}
                    />
                  </div>

                  <div className="order-detail-price">
                    <div className="invoice-details" style={{ paddingRight: 10 }}>
                      <strong>{formatPriceString(uniqueItem.variants.price)}</strong>
                    </div>
                  </div>
                </div>
              </div>
              {this.renderLineItemInvoice()}
            </div>
          );
        }) }
      </div>
    );
  }

  renderLineItemRefund() {
    const { editedItems } = this.props;
    return (
      <div className="invoice-refund-edited">
        <div className="refund-header">
          <div>
            <Translation defaultValue="For Refund" i18nKey=""/>
          </div>
          <div>
            <Translation defaultValue="Items" i18nKey=""/>
          </div>
          <div>
            <Translation defaultValue="Total" i18nKey=""/>
          </div>
        </div>
        <div className="refund-body">
          {editedItems.map((item, index) => {
            return (
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
            );
          })}
          <div className="refund-item return">
            <div>
              <b><Translation defaultValue="RETURN TOTAL" i18nKey=""/></b>
            </div>
            <div>
              <span>
                {editedItems.reduce((acc, item) => acc + item.refundedQuantity, 0)}
              </span>
            </div>
            <div>
              <span>
                {formatPriceString(editedItems.reduce((acc, item) => acc + item.refundedTotal, 0))}
              </span>
            </div>
          </div>
        </div>
        <div className="refund-include-shipping">
          <div className="pull-right">
            <Checkbox
              className="checkbox"
              label="Include Shipping"
              checked={true}
            />
          </div>
        </div>
      </div>
    );
  }

  showLoader() {
    const { isUpdating, toggleUpdating } = this.props;

    if (isUpdating) {
      setTimeout(() => {
        return toggleUpdating(false);
      }, 2000);
      return (
        <div>
          <i className="fa fa-circle-o-notch fa-spin fa-fw"/>
          <span>Updating</span>
        </div>
      );
    }
    return null;
  }

  renderPopOverChildren() {
    const { togglePopOver, editedItems, handleSelectAllItems, selectAllItems, selectedItems,
      uniqueItems } = this.props;
    return (
      <div className="invoice-popover">
          <div className="invoice-popover-controls">
            <div className="invoice-popover-checkbox">
              <Checkbox
                className="checkbox-large"
                checked={selectAllItems || selectedItems.length === uniqueItems.length}
                onChange={(e) => handleSelectAllItems(e, uniqueItems)}
              />
            </div>
            <div className="invoice-popover-selected">
              { this.showLoader() }
            </div>
            <div className="invoice-popover-close">
              <Button
                className="rui btn btn-default flat icon-only pull-right"
                icon="fa-2x fa fa-times"
                bezelStyle="flat"
                onClick={() => togglePopOver()}
              />
            </div>
          </div>
          {this.renderLineItems()}
          {!_.isEmpty(editedItems) ? this.renderLineItemRefund() : null}
          <div className="invoice-actions">
            <div className="invoice-action-cancel">
              <Button
                className="pull-right"
                bezelStyle="solid"
                status="default"
                label="Cancel"
                onClick={() => togglePopOver()}
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

  renderPopOver() {
    return (
      <div>
        <Popover
          isOpen={this.props.popOverIsOpen}
          attachment="middle center"
          targetAttachment="middle center"
         // {/*buttonElement={<Button bezelStyle="flat" label="My Button" tagName="button"/>}*/ } //
          showDropdownButton={false}
        >
          {this.renderPopOverChildren()}
        </Popover>
      </div>
    );
  }

  // renderLineItemInvoice(uniqueItem) {
  //   return (
  //     <div>
  //       <div className="order-summary-form-group">
  //         <strong><Translation defaultValue="Subtotal" i18nKey="cartSubTotals.subtotal"/></strong>
  //         <div className="invoice-details">
  //           {formatPriceString(uniqueItem.variants.price)}
  //         </div>
  //       </div>

  //       <div className="order-summary-form-group">
  //         <strong><Translation defaultValue="Shipping" i18nKey="cartSubTotals.shipping"/></strong>
  //         <div className="invoice-details">
  //           {formatPriceString(uniqueItem.shipping.rate)}
  //         </div>
  //       </div>

  //       <div className="order-summary-form-group">
  //         <strong>Item tax</strong>
  //         <div className="invoice-details">
  //           {uniqueItem.taxDetail ? formatPriceString(uniqueItem.taxDetail.tax / uniqueItem.quantity) : formatPriceString(0)}
  //         </div>
  //       </div>

  //       <div className="order-summary-form-group">
  //         <strong>Tax code</strong>
  //         <div className="invoice-details">
  //           {uniqueItem.taxDetail ? uniqueItem.taxDetail.taxCode : uniqueItem.variants.taxCode}
  //         </div>
  //       </div>

  //       <div className="order-summary-form-group">
  //         <strong>TOTAL</strong>
  //         <div className="invoice-details">
  //           {uniqueItem.taxDetail ?
  //             <strong>
  //               {this.calculateTotal(uniqueItem.variants.price, uniqueItem.shipping.rate, uniqueItem.taxDetail.tax)}
  //             </strong> :
  //              <strong>
  //               {this.calculateTotal(uniqueItem.variants.price, uniqueItem.shipping.rate, 0)}
  //             </strong>
  //           }
  //         </div>
  //       </div>
  //       <br/>
  //     </div>
  //   );
  // }

  render() {
    const { uniqueItems, togglePopOver } = this.props;
    return (
      <div
        className="invoice invoice-line-items"
        onClick={() => {
          return Roles.userIsInRole(Meteor.userId(), ["orders", "dashboard/orders"], Reaction.getShopId()) ?
          togglePopOver() : null;
        }}
      >
        {uniqueItems.map((uniqueItem) => {
          return (
            <div key={uniqueItem._id}> { this.renderLineItem(uniqueItem) } </div>
          );
        })}
        {
          Roles.userIsInRole(Meteor.userId(), ["orders", "dashboard/orders"], Reaction.getShopId()) ?
            this.renderPopOver() : null}
      </div>
    );
  }
}

export default LineItems;
