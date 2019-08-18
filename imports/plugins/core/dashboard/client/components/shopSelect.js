import React, { Component } from "react";
import PropTypes from "prop-types";
import { Components, registerComponent } from "@reactioncommerce/reaction-components";

/**
 * @file ShopSelect - React component wrapper for shop select dropdown menu displayed on toolbar and tagnav
 * @module ShopSelect
 * @extends Component
 */
class ShopSelect extends Component {
  /**
   * renderDropDownMenu
   * @summary Handles dropdown menu display
   * @param {Object} menuItems menuItems
   * @returns {JSX} React node containing dropdown menu
   */
  renderDropDownMenu(menuItems) {
    if (this.props.isTagNav) {
      return (
        <Components.DropDownMenu
          onChange={this.props.onShopSelectChange}
          value={this.props.shopId}
          closeOnClick={true}
          buttonElement={
            <Components.Button
              icon="fa fa-caret-down"
              iconAfter={true}
              label={this.props.shopName}
            />
          }
        >
          {menuItems}
        </Components.DropDownMenu>
      );
    }
    return (
      <Components.DropDownMenu
        onChange={this.props.onShopSelectChange}
        value={this.props.shopId}
        closeOnClick={true}
      >
        {menuItems}
      </Components.DropDownMenu>
    );
  }

  render() {
    let menuItems;
    const { shops } = this.props;

    if (Array.isArray(shops)) {
      menuItems = shops.map((shop, index) => (
        <Components.MenuItem
          label={shop.name}
          selectLabel={shop.name}
          value={shop._id}
          key={index}
        />
      ));
    }
    return (
      <div className={this.props.className || "hidden-xs"}>
        {this.renderDropDownMenu(menuItems)}
      </div>
    );
  }
}

ShopSelect.propTypes = {
  className: PropTypes.string,
  isTagNav: PropTypes.bool,
  onShopSelectChange: PropTypes.func,
  shopId: PropTypes.string,
  shopName: PropTypes.string,
  shops: PropTypes.array
};

registerComponent("ShopSelect", ShopSelect);

export default ShopSelect;
