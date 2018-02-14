import React, { Component } from "react";
import PropTypes from "prop-types";
import Velocity from "velocity-animate";
import "velocity-animate/velocity.ui";
import { Components, registerComponent } from "@reactioncommerce/reaction-components";

class Metafield extends Component {
  componentWillReceiveProps(nextProps) {
    if (nextProps.metafield.key !== this.props.metafield.key) {
      const { input } = this.refs.keyInput.refs;

      Velocity.RunSequence([
        { e: input, p: { backgroundColor: "#e2f2e2" }, o: { duration: 200 } },
        { e: input, p: { backgroundColor: "#fff" }, o: { duration: 100 } }
      ]);
    }

    if (nextProps.metafield.value !== this.props.metafield.value) {
      const { input } = this.refs.valueInput.refs;

      Velocity.RunSequence([
        { e: input, p: { backgroundColor: "#e2f2e2" }, o: { duration: 200 } },
        { e: input, p: { backgroundColor: "#fff" }, o: { duration: 100 } }
      ]);
    }
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
   * @return {void} no return value
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
   * @return {JSX} metadata forms for each row of metadata
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
              onBlur={this.handleBlur}
              onChange={this.handleChange}
              onReturnKeyDown={this.handleBlur}
              placeholder={this.detailNamePlaceholder}
              ref="keyInput"
              value={this.props.metafield.key}
            />
            <Components.TextField
              className="metafield-value-input"
              i18nKeyPlaceholder={this.i18nKeyDetailInformation}
              name="value"
              onBlur={this.handleBlur}
              onChange={this.handleChange}
              onReturnKeyDown={this.handleBlur}
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
  blank: PropTypes.bool,
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
