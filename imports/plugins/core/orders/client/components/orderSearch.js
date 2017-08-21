import React, { Component } from "react";
import { compose } from "recompose";
import PropTypes from "prop-types";
import { Components, withPermissions } from "@reactioncommerce/reaction-components";

/**
 * Class representing the Products React component
 * @summary PropTypes for Product React component
 * @property {Function} handleChange - load more products callback
 * @property {Function} handleClear - load more products callback
 */
class OrderSearch extends Component {
  static propTypes = {
    handleChange: PropTypes.func,
    handleClear: PropTypes.func
  };

  constructor() {
    super();

    this.state = { query: "" };
  }

  /**
   * handleChange - handler to call onchange of search input
   * @param {string} event - event object
   * @param {string} value - current value of the search input
   * @return {null} -
   */
  handleChange = (event, value) => {
    this.setState({ query: value });

    if (this.props.handleChange) {
      this.props.handleChange(value);
    }
  };

  render() {
    return (
      <div className="order-search">
        <Components.TextField
          className="search-input"
          onChange={this.handleChange}
          value={this.state.query}
          i18nKeyPlaceholder="admin.dashboard.searchLabel"
        />
        <i className="fa fa-search fa-fw"/>
        <Components.Button
          className="search-clear"
          i18nKeyLabel="search.clearSearch"
          label="Clear"
          containerStyle={{ fontWeight: "normal" }}
          onClick={this.props.handleClear}
        />
      </div>
    );
  }
}

export default compose(withPermissions({ roles: ["orders"] }))(OrderSearch);
