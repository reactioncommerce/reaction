import React, { Component, PropTypes } from "react";
import { formatPriceString } from "/client/api";
import { Translation } from "/imports/plugins/core/ui/client/components";
import { Popover, Button, Checkbox } from "/imports/plugins/core/ui/client/components";

class LineItems extends Component {

  static propTypes = {
    displayMedia: PropTypes.func,
    handleSelectAllItems: PropTypes.func,
    popOverIsOpen: PropTypes.bool,
    selectAllItems: PropTypes.bool,
    togglePopOver: PropTypes.func,
    uniqueItems: PropTypes.array
  }

  calculateTotal(price, shipping, taxes) {
    return formatPriceString(price + shipping + taxes);
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

  renderPopOverChildren() {
    const { togglePopOver, handleSelectAllItems, selectAllItems } = this.props;
    return (
      <div className="invoice-popover">
          <div className="invoice-popover-controls">
            <div className="invoice-popover-checkbox">
              <Checkbox
                className="checkbox"
                checked={selectAllItems}
                onChange={handleSelectAllItems}
              />
              {/* <input type="checkbox" className="checkbox" />*/}
            </div>
            <div className="invoice-popover-selected">
              <span>3 items Selected</span>
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
      </div>
    );
  }

  renderPopOver(uniqueItems) {
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
        onClick={() => togglePopOver()}
      >
        {uniqueItems.map((uniqueItem) => {
          return (
            <div key={uniqueItem._id}> { this.renderLineItem(uniqueItem) } </div>
          );
        })}
        {this.renderPopOver()}
      </div>
    );
  }
}

export default LineItems;
