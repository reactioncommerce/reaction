import React, { Component } from "react";
import PropTypes from "prop-types";
import { formatPriceString } from "/client/api";
import { Translation } from "/imports/plugins/core/ui/client/components";
import { Popover, Button, Checkbox, NumberTypeInput, RolloverCheckbox } from "/imports/plugins/core/ui/client/components";

class LineItems extends Component {
  static propTypes = {
    displayMedia: PropTypes.func,
    handleClick: PropTypes.func,
    isExpanded: PropTypes.func,
    onClose: PropTypes.func,
    uniqueItems: PropTypes.array
  }

  state = {
    isOpen: false
  }

  calculateTotal(price, shipping, taxes) {
    return formatPriceString(price + shipping + taxes);
  }

  renderLineItem(uniqueItem, quantity) {
    const { handleClick, displayMedia } = this.props;

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
        <div>Heeey</div>
      </Popover>
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
