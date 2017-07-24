import React, { Component, PropTypes } from "react";
import classnames from "classnames";
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

  state = {
    isOpen: false
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
          <div className="invoice-popover-checkbox">
            <Checkbox
              className="checkbox-large"
              checked={true}
              onChange={() => {}}
            />
          </div>
        </div>
        <div>
          {this.props.uniqueItems.map((uniqueItem, index) => (
            <div
              className="order-item form-group order-summary-form-group"
            >
              <div className="invoice-order-line-media">
                <RolloverCheckbox
                  checkboxClassName="checkbox-avatar checkbox-large"
                  onChange={() =>  {}}
                  checked={false}
                  key={index}
                >
                  { !this.props.displayMedia(uniqueItem) ?
                    <img src= "/resources/placeholder.gif" /> :
                    <img src={this.props.displayMedia(uniqueItem).url()}/>
                  }
                </RolloverCheckbox>
              </div>

              <div className="order-item-details">
                <div className="order-detail-title">
                  {uniqueItem.title}
                </div>
              </div>

              <div className="order-detail-quantity">
                <NumberTypeInput
                  minValue={0}
                  onChange={() => {}}
                  defaultValue={uniqueItem.quantity}
                  maxValue={uniqueItem.quantity}
                />
              </div>

              <div className="order-detail-price">
                <div className="invoice-details" style={{ marginRight: 15 }}>
                  <strong>{formatPriceString(uniqueItem.variants.price)}</strong>
                </div>
              </div>

            </div>
          ))}
        </div>
      </div>
    );
  }

  render() {
    const { uniqueItems } = this.props;
    return (
      <div className="invoice" onClick={() => this.setState({
        isOpen: true
      })}
      >
        {uniqueItems.map((uniqueItem) => {
          return (
            <div key={uniqueItem._id}> {this.renderLineItem(uniqueItem)} </div>
          );
        })}

        {this.renderPopOver()}
      </div>
    );
  }
}

export default LineItems;
