import React, { Component } from "react";
import PropTypes from "prop-types";
import { Components } from "@reactioncommerce/reaction-components";

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
      <div>
        <Components.TextField
          className="search-input"
          onChange={this.handleChange}
          value={this.state.query}
        />
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
