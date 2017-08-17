import React, { Component } from "react";
import PropTypes from "prop-types";
import { Translation, Checkbox, Button, Icon, List, ListItem } from "@reactioncommerce/reaction-ui";

class OrderBulkActionsBar extends Component {
  static propTypes = {
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

  renderLoadingSpinner(status) {
    return this.props.isLoading[status] ?
      <Icon className="bulk-actions-icons-select" icon="fa fa-spinner fa-pulse" />
      :
      <Icon className="bulk-actions-icons-select" icon="fa fa-circle-o"/>;
  }

  renderShippingFLowList() {
    if (this.props.renderFlowList) {
      return (
        <List className="shipping-flow-list">
          <ListItem
            label={this.props.shipping.picked ? "Generate Picking Report" : "Picked"}
            i18nKeyLabel={this.props.shipping.picked ? "order.generatePickingReport" : "order.picked"}
            value="picked"
            onClick={this.handleListItemClick}
            listItemClassName={this.props.shipping.picked ? "selected" : ""}
          >
            {this.props.shipping.picked ?
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
            {this.props.shipping.packed ?
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
            {this.props.shipping.labeled ?
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
            {this.props.shipping.shipped ?
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
        this.props.setShippingStatus(value, this.props.selectedItems);
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
              label="Capture"
              i18nKeyLabel="order.capture"
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
