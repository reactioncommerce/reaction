import React, { Component } from "react";
import PropTypes from "prop-types";
import { Components } from "@reactioncommerce/reaction-components";

// TODO: jsdoc
class OrderSearch extends Component {
  static propTypes = {
    handleChange: PropTypes.func,
    handleClear: PropTypes.func
  };

  constructor() {
    super();

    this.state = { query: "" };
  }

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

export default OrderSearch;
