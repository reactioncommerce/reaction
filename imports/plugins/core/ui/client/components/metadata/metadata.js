import React, { Component, PropTypes } from "react";

// import TextField from "reaction-ui/textfield"
// TODO: For now lets pretend we have to do imports
import {
  Divider,
  TextField,
  Button,
  Item,
  Items
} from "../";

class Metadata extends Component {

  /**
   * Handle form submit
   * @param  {Event} event Event object
   * @return {void} no return value
   */
  handleSubmit = (event) => {
    event.preventDefault();
  }

  handleRemove = (event) => {
    console.log("Remove!!");
  }

  handleSort = (event) => {
    console.log("sort!!!!");
  }

  /**
   * Render user readable metadata
   * @return {JSX} metadata
   */
  renderMetadata() {
    return this.props.metafields.map((metadata, index) => {
      return (
        <div className="rui meta-item" key={index}>
          <div className="rui meta-key">{metadata.key}</div>
          <div className="rui meta-key">{metadata.value}</div>
        </div>
      );
    });
  }

  /**
   * Render a metadata form
   * @return {JSX} metadata forms for each row of metadata
   */
  renderMetadataForm() {
    const fields = this.props.metafields.map((metadata, index) => {
      return (
        <div className="rui list-group-item metafield-list-item" key={index} >
          <form className="form form-inline" onSubmit={this.handleSubmit}>
            <TextField className="metafield-key-input" name="key" value={metadata.key} />
            <TextField className="metafield-value-input" name="value" value={metadata.value} />
            <Button icon="times-circle" onClick={this.handleRemove} type="button" />
          </form>
        </div>
      );
    });

    // Blank fields for creating new metadata
    // fields.push(
    //
    // );

    return fields;
  }

  renderMetadataCreateForm() {
    return (
      <div className="rui list-group-item metafield-list-item metafield-new-item">
        <form className="form form-inline" onSubmit={this.handleSubmit}>
          <TextField className="metafield-key-input" name="key" placeholder="Detail Name"/>
          <TextField className="metafield-value-input" name="value"  placeholder="Detail Information" />
          <Button icon="fa fa-plus" onClick={this.handleRemove} />
        </form>
      </div>
    );
  }

  /**
   * render
   * @return {JSX} component
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
  editable: PropTypes.bool,
  metafields: PropTypes.arrayOf(PropTypes.object)
};

export default Metadata;
