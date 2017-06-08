import React, { Component, PropTypes } from "react";
// import classnames from "classnames/dedupe";
import { TextField, Button } from "/imports/plugins/core/ui/client/components";

class SearchModal extends Component {
  static propTypes = {
    handleChange: PropTypes.func,
    handleClick: PropTypes.func,
    siteName: PropTypes.string,
    tags: PropTypes.array,
    value: PropTypes.string
  }


  renderSearchInput() {
    return (
      <div className="rui search-modal-input">
        <label data-i18n="search.searchInputLabel">Search {this.props.siteName}</label>
        <i className="fa fa-search search-icon" />
        <TextField
          className="search-input"
          textFieldStyle={{ marginBottom: 0 }}
          onChange={this.props.handleChange}
          value={this.props.value}
        />
        <Button
          className="search-clear"
          i18nKeyLabel="search.clearSearch"
          label="Clear"
          containerStyle={{ fontWeight: "normal" }}
          onClick={this.props.handleClick}
        />
      </div>
    );
  }

  renderSearchTypeToggle() {
    return (
      <div className="rui search-type-toggle">
        <div
          className="search-type-option search-type-active"
          data-i18n="search.searchTypeProducts"
          data-event-action="searchCollection"
          data-event-value="products"
        >
          Products
        </div>
        <div
          className="search-type-option"
          data-i18n="search.searchTypeAccounts"
          data-event-action="searchCollection"
          data-event-value="accounts"
        >
          Accounts
        </div>
        <div
          className="search-type-option"
          data-i18n="search.searchTypeOrders"
          data-event-action="searchCollection"
          data-event-value="orders"
        >
          Orders
        </div>
      </div>
    );
  }

  renderProductSearchTags() {
    return (
      <div className="rui search-modal-tags-container">
        <p className="rui suggested-tags" data-i18n="search.suggestedTags">Suggested tags</p>
        <div className="rui search-tags">
          {this.props.tags.map((tag) => (
            <span className="rui search-tag" key={tag._id}>{tag.name}</span>
          ))}
        </div>
      </div>
    );
  }

  render() {
    return (
      <div className="rui search-modal-header">
        {this.renderSearchInput()}
        {this.renderSearchTypeToggle()}
        {this.props.tags.length > 0 && this.renderProductSearchTags()}
      </div>
    );
  }
}

export default SearchModal;
