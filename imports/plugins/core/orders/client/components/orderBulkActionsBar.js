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
      shipping: PropTypes.object
    };

    constructor(props) {
      super(props);
      this.state = {
        renderFlowList: props.renderFlowList,
        shipping: props.shipping,
        isLoading: props.isLoading
      };
    }

    componentWillReceiveProps = (nextProps) => {
      this.setState({
        shipping: nextProps.shipping,
        isLoading: nextProps.isLoading,
        renderFlowList: nextProps.renderFlowList
      });
    }

    toggleShippingFlowList = () => {
      this.setState({
        renderFlowList: !this.state.renderFlowList
      });
      this.setListItemsToDefault();
    }

    renderLoadingSpinner(status) {
      return this.state.isLoading[status] ?
        <Icon className="bulk-actions-icons-select" icon="fa fa-spinner fa-pulse" />
        :
        <Icon className="bulk-actions-icons-select" icon="fa fa-circle-o"/>;
    }

    renderShippingFLowList() {
      if (this.state.renderFlowList) {
        return (
          <List className="shipping-flow-list">
            <ListItem
              label={this.state.shipping.picked ? "Generate Picking Report" : "Picked"}
              i18nKeyLabel={this.state.shipping.picked ? "order.generatePickingReport" : "order.picked"}
              value="picked"
              onClick={this.handleListItemClick}
              listItemClassName={this.state.shipping.picked ? "selected" : ""}
            >
              {this.state.shipping.picked ?
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
              listItemClassName={this.state.shipping.packed ? "selected" : ""}
            >
              {this.state.shipping.packed ?
                <Icon className="bulk-actions-icons-select" icon="fa fa-check"/>
                :
                this.renderLoadingSpinner("packed")
              }
            </ListItem>
            <ListItem
              label={this.state.shipping.labeled ? "Generate Label" : "Labeled"}
              i18nKeyLabel={this.state.shipping.labeled ? "order.generateLabel" : "order.labeled"}
              value="labeled"
              onClick={this.handleListItemClick}
              listItemClassName={this.state.shipping.labeled ? "selected" : ""}
            >
              {this.state.shipping.labeled ?
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
              listItemClassName={this.state.shipping.shipped ? "selected" : ""}
            >
              {this.state.shipping.shipped ?
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

    setListItemsToDefault() {
      if (this.state.renderFlowList === false) {
        this.setState({
          shipping: {
            picked: false,
            packed: false,
            labeled: false,
            shipped: false
          }
        });
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
              onClick={this.toggleShippingFlowList}
            />
            {this.renderShippingFLowList()}
          </div>
        );
      }
      return null;
    }
}

export default OrderBulkActionsBar;
