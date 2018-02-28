import React, { Component } from "react";
import PropTypes from "prop-types";
import { Translation, Checkbox, Button, Icon, List, ListItem } from "@reactioncommerce/reaction-ui";

class OrderBulkActionsBar extends Component {
  static propTypes = {
    handleBulkPaymentCapture: PropTypes.func,
    isLoading: PropTypes.object,
    multipleSelect: PropTypes.bool,
    orders: PropTypes.array,
    renderFlowList: PropTypes.bool,
    selectAllOrders: PropTypes.func,
    selectedItems: PropTypes.array,
    setShippingStatus: PropTypes.func,
    shipping: PropTypes.object,
    toggleShippingFlowList: PropTypes.func
  };

  constructor() {
    super();
    this.state = {
      printed: false
    };
  }

  renderLoadingSpinner(status) {
    return this.props.isLoading[status] ?
      <Icon className="bulk-actions-icons-select" icon="fa fa-spinner fa-pulse" />
      :
      <Icon className="bulk-actions-icons-select" icon="fa fa-circle-o"/>;
  }

  onClick = (event, value) => {
    this.setState({
      [value]: true
    });
  }

  renderShippingFLowList() {
    if (this.props.renderFlowList) {
      return (
        <List className="shipping-flow-list">
          <ListItem
            label="Print Invoice and Pick Sheet"
            i18nKeyLabel="order.printInvoiceAndPickSheet"
            value="printed"
            onClick={this.onClick}
            listItemClassName={this.state.printed ? "selected" : ""}
          >
            {this.state.printed ?
              <div>
                <Icon className="bulk-actions-icons" icon="fa fa-print"/>
                <Icon className="bulk-actions-icons-select" icon="fa fa-check"/>
              </div>
              :
              <Icon className="bulk-actions-icons-select" icon="fa fa-print"/>
            }
          </ListItem>
          <ListItem
            label="Picked"
            i18nKeyLabel="order.picked"
            value="picked"
            onClick={this.handleListItemClick}
            listItemClassName={this.props.shipping.picked ? "selected" : ""}
          >
            {this.props.shipping.picked && !this.props.isLoading.picked ?
              <div>
                <Icon className="bulk-actions-icons" icon="fa fa-print"/>
                <Icon className="bulk-actions-icons-select" icon="fa fa-check"/>
              </div>
              :
              this.renderLoadingSpinner("picked")
            }
          </ListItem>
          <ListItem
            label="Packed"
            i18nKeyLabel="order.packed"
            value="packed"
            onClick={this.handleListItemClick}
            listItemClassName={this.props.shipping.packed ? "selected" : ""}
          >
            {this.props.shipping.packed && !this.props.isLoading.packed ?
              <Icon className="bulk-actions-icons-select" icon="fa fa-check"/>
              :
              this.renderLoadingSpinner("packed")
            }
          </ListItem>
          <ListItem
            label={this.props.shipping.labeled ? "Generate Label" : "Labeled"}
            i18nKeyLabel={this.props.shipping.labeled ? "order.generateLabel" : "order.labeled"}
            value="labeled"
            onClick={this.handleListItemClick}
            listItemClassName={this.props.shipping.labeled ? "selected" : ""}
          >
            {this.props.shipping.labeled && !this.props.isLoading.labeled ?
              <div>
                <Icon className="bulk-actions-icons" icon="fa fa-print"/>
                <Icon className="bulk-actions-icons-select" icon="fa fa-check"/>
              </div>
              :
              this.renderLoadingSpinner("labeled")
            }
          </ListItem>
          <ListItem
            label="Shipped"
            i18nKeyLabel="order.shipped"
            value="shipped"
            onClick={this.handleListItemClick}
            listItemClassName={this.props.shipping.shipped ? "selected" : ""}
          >
            {this.props.shipping.shipped && !this.props.isLoading.shipped ?
              <div>
                <Icon className="bulk-actions-icons" icon="fa fa-paper-plane-o" />
                <Icon className="bulk-actions-icons-select" icon="fa fa-check"/>
              </div>
              :
              this.renderLoadingSpinner("shipped")
            }
          </ListItem>
        </List>
      );
    }
  }

  handleListItemClick = (event, value) => {
    if (this.props.setShippingStatus) {
      this.props.setShippingStatus(value, this.props.selectedItems, this.props.orders);
    }
  }

  handlePaymentClick = () => {
    if (this.props.handleBulkPaymentCapture) {
      this.props.handleBulkPaymentCapture(this.props.selectedItems, this.props.orders);
    }
  }

  render() {
    const { orders, multipleSelect, selectedItems, selectAllOrders } = this.props;

    if (selectedItems.length > 0) {
      return (
        <div className="bulk-order-actions-bar">
          <Checkbox
            className="checkbox-large orders-checkbox"
            checked={selectedItems.length === orders.length || multipleSelect}
            name="orders-checkbox"
            onChange={() => selectAllOrders(orders, (selectedItems.length === orders.length || multipleSelect))}
          />
          <Translation
            className="selected-orders"
            defaultValue={`${selectedItems.length} Selected`}
            i18nKey={`${selectedItems.length} order.selected`}
          />
          <Button
            status="success"
            bezelStyle="solid"
            className="capture-orders-button"
            label={this.props.isLoading.capturePayment ? "Capturing" : "Capture"}
            i18nKeyLabel={this.props.isLoading.capturePayment ? "order.capturing" : "order.capture"}
            icon={this.props.isLoading.capturePayment ? "fa fa-spinner fa-pulse" : ""}
            iconAfter={true}
            onClick={this.handlePaymentClick}
          />
          <Button
            status="default"
            bezelStyle="solid"
            className="bulk-actions-button"
            label="Bulk Actions"
            i18nKeyLabel="order.bulkActions"
            icon="fa fa-chevron-down"
            iconAfter={true}
            onClick={this.props.toggleShippingFlowList}
          />
          {this.renderShippingFLowList()}
        </div>
      );
    }
    return null;
  }
}

export default OrderBulkActionsBar;
