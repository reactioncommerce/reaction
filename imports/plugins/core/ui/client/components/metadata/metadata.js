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

import Metafield from "./metafield";

class Metadata extends Component {
  state = {
    newMetadata: {
      key: "",
      value: ""
    }
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
    const productId = ReactionProduct.selectedProductId();
    const updateMeta = {
      key: $(event.currentTarget).parent().children(".metafield-key-input").val(),
      value: $(event.currentTarget).parent().children(".metafield-value-input").val()
    };

    if (this.key) {
      const index = $(event.currentTarget).closest(".metafield-list-item").index();
      Meteor.call("products/updateMetaFields", productId, updateMeta, index);
      $(event.currentTarget).animate({
        backgroundColor: "#e2f2e2"
      }).animate({
        backgroundColor: "#fff"
      });
      return Tracker.flush();
    }

    if (updateMeta.value && !updateMeta.key) {
      $(event.currentTarget).parent().children(".metafield-key-input").val("").focus();
    }
    if (updateMeta.key && updateMeta.value) {
      Meteor.call("products/updateMetaFields", productId, updateMeta);
      Tracker.flush();
      $(event.currentTarget).parent().children(".metafield-key-input").val("").focus();
      return $(event.currentTarget).parent().children(".metafield-value-input").val("");
    }
  }

  handleRemove = (event) => {
    console.log("Remove!!");
  }

  handleSort = (event) => {
    console.log("sort!!!!");
  }

  handleMetaChange = (event, metafield, index) => {
    if (this.props.onMetaChange && index) {
      this.props.onMetaChange(event, metafield, index);
    } else {
      this.setState({
        newMetadata: metafield
      });
    }
  }

  handleMetaSave = (event, metafield, index) => {
    if (this.props.onMetaSave) {
      this.props.onMetaSave(event, metafield, index);
      this.setState({
        newMetadata: {
          key: "",
          value: ""
        }
      });
    }
  }

  handleMetaRemove = (event, metafield, index) => {
    if (this.props.onMetaRemove) {
      console.log("handle meta remove");
      this.props.onMetaRemove(event, metafield, index);
    }
  }

  /**
   * Render user readable metadata
   * @return {JSX} metadata
   */
  renderMetadata() {
    if (this.props.metafields) {
      return this.props.metafields.map((metadata, index) => {
        return (
          <div className="rui meta-item" key={index}>
            <div className="rui meta-key">{metadata.key}</div>
            <div className="rui meta-key">{metadata.value}</div>
          </div>
        );
      });
    }

    return null;
  }

  /**
   * Render a metadata form
   * @return {JSX} metadata forms for each row of metadata
   */
  renderMetadataForm() {
    if (this.props.metafields) {
      return this.props.metafields.map((metadata, index) => {
        return (
          <Metafield
            index={index}
            key={index}
            metafield={metadata}
            onBlur={this.handleMetaSave}
            onChange={this.handleMetaChange}
            onRemove={this.handleMetaRemove}
          />
        );
      });
    }

    return null;
  }

  renderMetadataCreateForm() {
    return (
      <Metafield
        metafield={this.state.newMetadata}
        onBlur={this.handleMetaSave}
        onChange={this.handleMetaChange}
        detailNamePlaceholder="Detail Name"
        i18nKeyDetailName="productDetailEdit.detailName"
        i18nKeyDetailInformation="productDetailEdit.detailName"
        valuePlaceholder="Detail Name"
        ref="newMetadataFields"
      />
    );
  }
/*

  <div className="rui list-group-item metafield-list-item metafield-new-item">
    <form className="form form-inline" onSubmit={this.handleSubmit}>
      <TextField className="metafield-key-input" name="key" placeholder="Detail Name"/>
      <TextField className="metafield-value-input" name="value"  placeholder="Detail Information" />
      <Button icon="fa fa-plus" onClick={this.handleRemove} />
    </form>
  </div>
 */
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
  metafields: PropTypes.arrayOf(PropTypes.object),
  onMetaSave: PropTypes.func
};

export default Metadata;
