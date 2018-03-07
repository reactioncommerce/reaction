import React, { Component } from "react";
import PropTypes from "prop-types";
import classnames from "classnames";
import { Reaction } from "/client/api";
import { TextField, Button, IconButton, SortableTableLegacy } from "@reactioncommerce/reaction-ui";
import ProductGridContainer from "/imports/plugins/included/product-variant/containers/productGridContainer";
import { accountsTable } from "../helpers";

class SearchModal extends Component {
  static propTypes = {
    accounts: PropTypes.array,
    handleAccountClick: PropTypes.func,
    handleChange: PropTypes.func,
    handleClick: PropTypes.func,
    handleTagClick: PropTypes.func,
    handleToggle: PropTypes.func,
    products: PropTypes.array,
    siteName: PropTypes.string,
    tags: PropTypes.array,
    unmountMe: PropTypes.func,
    value: PropTypes.string
  }

  state = {
    activeTab: "products"
  }

  componentDidMount() {
    // Focus and select all text in the search input
    const { input } = this.textField.refs;
    input.select();
  }


  isKeyboardAction(event) {
    // keyCode 32 (spacebar)
    // keyCode 13 (enter/return)
    return event.keyCode === 13 || event.keyCode === 32;
  }

  handleToggleProducts = () => {
    this.props.handleToggle("products");
    this.setState({ activeTab: "products" });
  }

  handleToggleAccounts = () => {
    this.props.handleToggle("accounts");
    this.setState({ activeTab: "accounts" });
  }

  handleOnKeyUpToggleProducts = (event) => {
    if (this.isKeyboardAction(event)) {
      this.handleToggleProducts();
    }
  }

  handleOnKeyUpToggleAccounts = (event) => {
    if (this.isKeyboardAction(event)) {
      this.handleToggleAccounts();
    }
  }

  handleSubmit = (event) => {
    // Ignore submit events from form as search happens on chnage of the TextField
    event.preventDefault();
  }

  renderSearchInput() {
    return (
      <form className="rui search-modal-input" role="search" onSubmit={this.handleSubmit}>
        <i className="fa fa-search search-icon" />
        <TextField
          id="search-modal-input"
          ref={(input) => { this.textField = input; }}
          label={`Search ${this.props.siteName}`}
          i18nKeyLabel="search.searchInputLabel"
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
          type="button"
          onClick={this.props.handleClick}
        />
      </form>
    );
  }

  renderSearchTypeToggle() {
    if (Reaction.hasPermission("admin")) {
      const productTabClassName = classnames({
        "search-type-option": true,
        "search-type-active": this.state.activeTab === "products"
      });

      const accountsTabClassName = classnames({
        "search-type-option": true,
        "search-type-active": this.state.activeTab === "accounts"
      });

      return (
        <div className="rui search-type-toggle">
          <button
            className={productTabClassName}
            data-i18n="search.searchTypeProducts"
            data-event-action="searchCollection"
            data-event-value="products"
            onClick={this.handleToggleProducts}
            onKeyUp={this.handleOnKeyUpToggleProducts}
          >
            Products
          </button>
          {Reaction.hasPermission("accounts") &&
            <button
              className={accountsTabClassName}
              data-i18n="search.searchTypeAccounts"
              data-event-action="searchCollection"
              data-event-value="accounts"
              onClick={this.handleToggleAccounts}
              onKeyUp={this.handleOnKeyUpToggleAccounts}
            >
              Accounts
            </button>
          }
        </div>
      );
    }
  }

  renderProductSearchTags() {
    return (
      <div className="rui search-modal-tags-container">
        <p className="rui suggested-tags" data-i18n="search.suggestedTags">Suggested tags</p>
        <div className="rui search-tags">
          {this.props.tags.map((tag) => (
            <span
              className="rui search-tag"
              id={tag._id} key={tag._id}
              onClick={() => this.props.handleTagClick(tag._id)}
              onKeyUp={(event) => {
                if (this.isKeyboardAction(event)) {
                  this.props.handleTagClick(tag._id);
                }
              }}
              role="button"
              tabIndex={0}
            >
              {tag.name}
            </span>
          ))}
        </div>
      </div>
    );
  }

  render() {
    return (
      <div>
        <div className="rui search-modal-close"><IconButton icon="fa fa-times" onClick={this.props.unmountMe} /></div>
        <div className="rui search-modal-header">
          {this.renderSearchInput()}
          {this.renderSearchTypeToggle()}
          {this.props.tags.length > 0 && this.renderProductSearchTags()}
        </div>
        <div className="rui search-modal-results-container">
          {this.props.products.length > 0 &&
            <ProductGridContainer
              products={this.props.products}
              unmountMe={this.props.unmountMe}
              isSearch={true}
            />
          }
          {this.props.accounts.length > 0 &&
            <div className="data-table">
              <div className="table-responsive">
                <SortableTableLegacy
                  data={this.props.accounts}
                  columns={accountsTable()}
                  onRowClick={this.props.handleAccountClick}
                />
              </div>
            </div>
          }
        </div>
      </div>
    );
  }
}

export default SearchModal;
