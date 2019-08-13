import React, { Component } from "react";
import PropTypes from "prop-types";
import { Components, registerComponent } from "@reactioncommerce/reaction-components";
import { highlightInput } from "../../helpers/animations";

class Metafield extends Component {
  constructor(props) {
    super(props);
    this.state = {
      // Currently focused input's original value, used to determine whether to highlight on blur/enter
      inputOriginalValue: ""
    };
  }

  get detailNamePlaceholder() {
    return this.props.detailNamePlaceholder || "Detail Name";
  }

  get i18nKeyDetailName() {
    return this.props.i18nKeyDetailName || "productDetailEdit.detailName";
  }

  get detailInfoPlaceholder() {
    return this.props.detailInfoPlaceholder || "Detail Information";
  }

  get i18nKeyDetailInformation() {
    return this.props.i18nKeyDetailInfo || "productDetail.detailsInfo";
  }

  /**
   * Handle form submit
   * @param  {Event} event Event object
   * @returns {void} no return value
   */
  handleSubmit = (event) => {
    event.preventDefault();
  }

  handleChange = (event) => {
    if (this.props.onChange) {
      const newMetadata = {
        key: this.refs.keyInput.refs.input.value,
        value: this.refs.valueInput.refs.input.value
      };

      this.props.onChange(event, newMetadata, this.props.index);
    }
  }

  handleFocus = (event) => {
    this.setState({ inputOriginalValue: event.target.value });
  }

  handleKeyBlur = (event) => {
    const keyInput = this.refs.keyInput.refs.input;

    if (this.state.inputOriginalValue !== keyInput.value) {
      // Value has changed, highlight
      this.highlightInput(keyInput);
    }

    this.handleBlur(event);
  };

  highlightInput = (inputRef) => {
    this.setState({ inputOriginalValue: inputRef.value });
    highlightInput(inputRef);
  }

  handleValueBlur = (event) => {
    const valueInput = this.refs.valueInput.refs.input;

    if (this.state.inputOriginalValue !== valueInput.value) {
      // Value has changed, highlight
      this.highlightInput(valueInput);
    }

    this.handleBlur(event);
  };

  handleBlur = (event) => {
    if (this.props.onBlur) {
      const newMetadata = {
        key: this.refs.keyInput.refs.input.value,
        value: this.refs.valueInput.refs.input.value
      };
      if (newMetadata.key && newMetadata.value) {
        this.props.onBlur(event, newMetadata, this.props.index);
      }
    }
  }

  handleRemove = (event) => {
    if (this.props.onRemove) {
      this.props.onRemove(event, this.props.metafield, this.props.index);
    }
  }

  renderActionButton() {
    if (this.props.blank === true) {
      return (
        <Components.Button icon="plus" onClick={this.handleSubmit} type="submit" />
      );
    }
    return (
      <Components.Button icon="times-circle" onClick={this.handleRemove} type="button" />
    );
  }

  /**
   * Render a metadata form
   * @returns {JSX} metadata forms for each row of metadata
   */
  render() {
    if (this.props.metafield) {
      return (
        <div className="rui list-group-item metafield-list-item">
          <form className="form form-inline" onSubmit={this.handleSubmit}>
            <Components.TextField
              className="metafield-key-input"
              i18nKeyPlaceholder={this.i18nKeyDetailName}
              name="key"
              onFocus={this.handleFocus}
              onBlur={this.handleKeyBlur}
              onChange={this.handleChange}
              onReturnKeyDown={this.handleKeyBlur}
              placeholder={this.detailNamePlaceholder}
              ref="keyInput"
              value={this.props.metafield.key}
            />
            <Components.TextField
              className="metafield-value-input"
              i18nKeyPlaceholder={this.i18nKeyDetailInformation}
              name="value"
              onFocus={this.handleFocus}
              onBlur={this.handleValueBlur}
              onChange={this.handleChange}
              onReturnKeyDown={this.handleValueBlur}
              placeholder={this.detailInfoPlaceholder}
              ref="valueInput"
              value={this.props.metafield.value}
            />
            {this.renderActionButton()}
          </form>
        </div>
      );
    }
    return null;
  }
}

Metafield.defaultProps = {
  editable: true
};

// Prop Types
Metafield.propTypes = {
  blank: PropTypes.bool, // eslint-disable-line react/boolean-prop-naming
  detailInfoPlaceholder: PropTypes.func,
  detailNamePlaceholder: PropTypes.func,
  i18nKeyDetailInfo: PropTypes.func,
  i18nKeyDetailName: PropTypes.func,
  index: PropTypes.number,
  metafield: PropTypes.object,
  onBlur: PropTypes.func,
  onChange: PropTypes.func,
  onRemove: PropTypes.func
};

registerComponent("Metafield", Metafield);

export default Metafield;
