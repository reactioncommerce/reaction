import React, { Component } from "react";
import PropTypes from "prop-types";
import { Components, registerComponent } from "@reactioncommerce/reaction-components";

class Metadata extends Component {
  /**
   * Handle form submit
   * @param  {Event} event Event object
   * @returns {void} no return value
   */
  handleSubmit = (event) => {
    event.preventDefault();
  }

  handleMetaChange = (event, metafield, index) => {
    if (this.props.onMetaChange) {
      this.props.onMetaChange(event, metafield, index);
    }
  }

  handleMetaSave = (event, metafield, index) => {
    if (this.props.onMetaSave) {
      this.props.onMetaSave(event, metafield, index);
    }
  }

  handleMetaRemove = (event, metafield, index) => {
    if (this.props.onMetaRemove) {
      this.props.onMetaRemove(event, metafield, index);
    }
  }

  /**
   * Render user readable metadata
   * @returns {JSX} metadata
   */
  renderMetadata() {
    if (this.props.metafields) {
      return this.props.metafields.map((metadata, index) => (
        <div className="rui meta-item" key={index}>
          <div className="rui meta-key">{metadata.key}</div>
          <div className="rui meta-value">{metadata.value}</div>
        </div>
      ));
    }

    return null;
  }

  /**
   * Render a metadata form
   * @returns {JSX} metadata forms for each row of metadata
   */
  renderMetadataForm() {
    if (this.props.metafields) {
      return this.props.metafields.map((metadata, index) => (
        <Components.Metafield
          index={index}
          key={index}
          metafield={metadata}
          onBlur={this.handleMetaSave}
          onChange={this.handleMetaChange}
          onRemove={this.handleMetaRemove}
        />
      ));
    }

    return null;
  }

  renderMetadataCreateForm() {
    return (
      <Components.Metafield
        blank={true}
        metafield={this.props.newMetafield}
        onBlur={this.handleMetaSave}
        onChange={this.handleMetaChange}
        ref="newMetadataFields"
      />
    );
  }

  /**
   * render
   * @returns {JSX} component
   */
  render() {
    // Admin editable metadata
    if (this.props.editable) {
      return (
        <div className="rui list-group product-detail-edit product-attributes">
          {this.renderMetadataForm()}
          {this.renderMetadataCreateForm()}
        </div>
      );
    }

    // User readable metadata
    return (
      <div className="rui metadata">
        {this.renderMetadata()}
      </div>
    );
  }
}

Metadata.defaultProps = {
  editable: true
};

// Prop Types
Metadata.propTypes = {
  editable: PropTypes.bool, // eslint-disable-line react/boolean-prop-naming
  metafields: PropTypes.arrayOf(PropTypes.object),
  newMetafield: PropTypes.object,
  onMetaChange: PropTypes.func,
  onMetaRemove: PropTypes.func,
  onMetaSave: PropTypes.func
};

registerComponent("Metadata", Metadata);

export default Metadata;
