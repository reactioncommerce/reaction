import React, { Component } from "react";
import { compose } from "recompose";
import PropTypes from "prop-types";
import { Components, registerComponent, withPermissions } from "@reactioncommerce/reaction-components";

/**
 * @file React class for Search bar on Order Dashboard
 *
 * @module OrderSearch
 * @extends Component
 */

class OrderSearch extends Component {
  /**
   * @name OrderSearch propTypes
   * @type {propTypes}
   * @summary horizontal search bar on the order dashboard. can be replaced with registerComponent as "OrderSearch"
   * @property {Function} handleChange - function called to update state field on parent after search input text changes
   */
  static propTypes = {
    handleChange: PropTypes.func
  };

  state = {
    value: ""
  }

  /**
   * @name handleChange()
   * @method
   * @summary handleChange - handler to call onchange of search input
   * @param {string} event - event object
   * @return {null} -
   */
  handleChange = (event) => {
    const { value } = event.target;

    this.setState({
      value
    });
    this.props.handleChange(value);
  }

  /**
   * @name handleClear()
   * @method
   * @summary handleClear - handler called onclick of search clear text
   * @return {null} -
   */
  handleClear = () => {
    this.setState({
      value: ""
    });
    this.props.handleChange("");
  }

  render() {
    return (
      <div className="order-search">
        <Components.TextField
          className="search-input"
          onChange={this.handleChange}
          value={this.state.value}
          i18nKeyPlaceholder="admin.table.search.placeholder"
        />
        <i className="fa fa-search fa-fw"/>
        <Components.Button
          className="search-clear"
          i18nKeyLabel="admin.table.search.clearSearch"
          label="Clear"
          onClick={this.handleClear}
        />
      </div>
    );
  }
}

registerComponent("OrderSearch", OrderSearch, withPermissions({ roles: ["orders"] }));

export default compose(withPermissions({ roles: ["orders"] }))(OrderSearch);
