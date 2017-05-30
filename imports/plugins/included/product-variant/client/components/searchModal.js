import React, { Component } from "react";
import { TextField, Button } from "/imports/plugins/core/ui/client/components";

class SearchModal extends Component {
  state = {
    value: ""
  }

  onChange = (event, value) => {
    this.setState({
      value: value
    });
  }

  onClick = () => {
    this.setState({
      value: ""
    });
  }

  renderSearchInput() {
    return (
      <div className="rui search-modal-input">
        <label data-i18n="search.searchInputLabel">Search Reaction</label>
        <i className="fa fa-search search-icon"/>
        <TextField
          className="search-input"
          textFieldStyle={{ marginBottom: 0 }}
          onChange={this.onChange}
          value={this.state.value}
        />
        <Button
          className="search-clear"
          i18nKeyLabel="search.clearSearch"
          label="Clear"
          containerStyle={{ fontWeight: "normal" }}
          onClick={this.onClick}
        />
      </div>
    );
  }

  render() {
    return (
      <div className="rui search-modal-header">
        {this.renderSearchInput()}
      </div>
    );
  }
}

export default SearchModal;
