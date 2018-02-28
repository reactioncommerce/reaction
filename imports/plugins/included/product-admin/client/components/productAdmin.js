import { isEqual } from "lodash";
import React, { Component } from "react";
import PropTypes from "prop-types";
import Velocity from "velocity-animate";
import "velocity-animate/velocity.ui";
import { Components } from "@reactioncommerce/reaction-components";
import { Router } from "/client/api";
import update from "immutability-helper";

const fieldNames = [
  "title",
  "handle",
  "subtitle",
  "vendor",
  "description",
  "origincountry",
  "facebookMsg",
  "twitterMsg",
  "pinterestMsg",
  "googleplusMsg"
];

const fieldGroups = {
  title: { group: "productDetails" },
  handle: { group: "productDetails" },
  pageTitle: { group: "productDetails" },
  vendor: { group: "productDetails" },
  description: { group: "productDetails" },
  facebookMsg: { group: "social" },
  twitterMsg: { group: "social" },
  pinterestMsg: { group: "social" },
  googleplusMsg: { group: "social" },
  hashtags: { group: "hashtags" },
  metafields: { group: "metafields" }
};

class ProductAdmin extends Component {
  constructor(props) {
    super(props);

    this.state = {
      expandedCard: this.fieldGroupForFieldName(props.editFocus),
      product: props.product,
      viewProps: props.viewProps
    };
  }

  componentWillReceiveProps(nextProps) {
    const nextProduct = nextProps.product || {};
    const currentProduct = this.props.product || {};

    if (!isEqual(nextProduct, currentProduct)) {
      for (const fieldName of fieldNames) {
        if (nextProduct[fieldName] !== currentProduct[fieldName]) {
          this.animateFieldFlash(fieldName);
        }
      }
    }

    const cardGroupName = this.fieldGroupForFieldName(nextProps.editFocus);

    this.setState({
      expandedCard: cardGroupName,
      viewProps: nextProps.viewProps
    });

    this.setState({
      product: nextProps.product
    });
  }

  fieldGroupForFieldName(field) {
    // Other wise, if a field was passed
    // const fieldName = this.state.viewProps.field;

    let fieldName;

    // If the field is an array of field name
    if (Array.isArray(field) && field.length) {
      // Use the first field name
      [fieldName] = field;
    } else {
      fieldName = field;
    }

    const fieldData = fieldGroups[fieldName];

    if (fieldData && fieldData.group) {
      return fieldData.group;
    }

    return fieldName;
  }

  animateFieldFlash(fieldName) {
    const fieldRef = this.refs[`${fieldName}Input`];

    if (fieldRef) {
      const { input } = fieldRef.refs;

      Velocity.RunSequence([
        { e: input, p: { backgroundColor: "#e2f2e2" }, o: { duration: 200 } },
        { e: input, p: { backgroundColor: "#fff" }, o: { duration: 100 } }
      ]);
    }
  }


  handleCardExpand = (event, card, cardName, isExpanded) => {
    if (this.props.onCardExpand) {
      this.props.onCardExpand(isExpanded ? cardName : undefined);
    }
  }

  handleDeleteProduct = () => {
    if (this.props.onDeleteProduct) {
      this.props.onDeleteProduct(this.props.product);
    }
  }

  handleRestoreProduct = () => {
    if (this.props.onRestoreProduct) {
      this.props.onRestoreProduct(this.props.product);
    }
  }


  handleFieldChange = (event, value, field) => {
    const newState = update(this.state, {
      product: {
        $merge: {
          [field]: value
        }
      }
    });

    this.setState(newState, () => {
      if (this.props.onFieldChange) {
        this.props.onFieldChange(field, value);
      }
    });
  }

  handleSelectChange = (value, field) => {
    if (this.props.onProductFieldSave) {
      this.props.onProductFieldSave(this.product._id, field, value);
    }
  }

  handleToggleVisibility = () => {
    if (this.props.onProductFieldSave) {
      this.props.onProductFieldSave(this.product._id, "isVisible", !this.product.isVisible);
    }
  }

  handleMetaChange = (event, metafield, index) => {
    if (this.props.onMetaChange) {
      if (index >= 0) {
        const { product } = this.state;
        product.metafields[index] = metafield;

        this.setState({
          product
        });
      } else {
        this.props.onMetaChange(metafield);
      }
    }
  }

  handleFieldBlur = (event, value, field) => {
    if (this.props.onProductFieldSave) {
      this.props.onProductFieldSave(this.product._id, field, value);
    }
  }

  handleMetaSave = (event, metafield, index) => {
    if (this.props.onMetaSave) {
      this.props.onMetaSave(this.product._id, metafield, index);
    }
  }

  handleMetaRemove = (event, metafield, index) => {
    if (this.props.onMetaRemove) {
      this.props.onMetaRemove(this.product._id, metafield, index);
    }
  }

  get product() {
    return this.state.product || this.props.product || {};
  }

  get permalink() {
    if (this.props.product) {
      return Router.pathFor("product", {
        hash: {
          handle: this.props.product.handle
        }
      });
    }

    return "";
  }

  renderProductVisibilityLabel() {
    if (this.product.isVisible) {
      return (
        <Components.Translation defaultValue="Product is visible" i18nKey="productDetailEdit.productIsVisible" />
      );
    }

    return (
      <Components.Translation defaultValue="Product is not visible" i18nKey="productDetailEdit.productIsNotVisible" />
    );
  }

  isExpanded = (groupName) => this.state.expandedCard === groupName

  render() {
    return (
      <Components.CardGroup>
        <Components.Card
          expanded={this.isExpanded("productDetails")}
          name={"productDetails"}
          onExpand={this.handleCardExpand}
        >
          <Components.CardHeader
            actAsExpander={true}
            i18nKeyTitle="productDetailEdit.productSettings"
            title="Product Settings"
            onChange={this.handleFieldChange}
          />
          <Components.CardBody expandable={true}>
            <Components.Select
              clearable={false}
              i18nKeyLabel="productDetailEdit.template"
              i18nKeyPlaceholder="productDetailEdit.templateSelectPlaceholder"
              label="Template"
              name="template"
              onChange={this.handleSelectChange}
              options={this.props.templates}
              placeholder="Select a template"
              value={this.product.template}
            />
            <Components.TextField
              i18nKeyLabel="productDetailEdit.title"
              i18nKeyPlaceholder="productDetailEdit.title"
              label="Title"
              name="title"
              onBlur={this.handleFieldBlur}
              onChange={this.handleFieldChange}
              onReturnKeyDown={this.handleFieldBlur}
              placeholder="Title"
              ref="titleInput"
              value={this.product.title}
            />
            <Components.TextField
              helpText={this.permalink}
              i18nKeyLabel="productDetailEdit.permalink"
              i18nKeyPlaceholder="productDetailEdit.permalink"
              label="Permalink"
              name="handle"
              onBlur={this.handleFieldBlur}
              onChange={this.handleFieldChange}
              onReturnKeyDown={this.handleFieldBlur}
              placeholder="Permalink"
              ref="handleInput"
              value={this.product.handle}
            />
            <Components.TextField
              i18nKeyLabel="productDetailEdit.pageTitle"
              i18nKeyPlaceholder="productDetailEdit.pageTitle"
              label="Subtitle"
              name="pageTitle"
              onBlur={this.handleFieldBlur}
              onChange={this.handleFieldChange}
              onReturnKeyDown={this.handleFieldBlur}
              placeholder="Subtitle"
              ref="subtitleInput"
              value={this.product.pageTitle}
            />
            <Components.TextField
              i18nKeyLabel="productDetailEdit.vendor"
              i18nKeyPlaceholder="productDetailEdit.vendor"
              label="Vendor"
              name="vendor"
              onBlur={this.handleFieldBlur}
              onChange={this.handleFieldChange}
              onReturnKeyDown={this.handleFieldBlur}
              placeholder="Vendor"
              ref="vendorInput"
              value={this.product.vendor}
            />
            <Components.TextField
              i18nKeyLabel="productDetailEdit.description"
              i18nKeyPlaceholder="productDetailEdit.description"
              label="Description"
              multiline={true}
              name="description"
              onBlur={this.handleFieldBlur}
              onChange={this.handleFieldChange}
              placeholder="Description"
              ref="descriptionInput"
              value={this.product.description}
            />
            <Components.Select
              clearable={false}
              i18nKeyLabel="productDetailEdit.originCountry"
              i18nKeyPlaceholder="productDetailEdit.originCountry"
              label="Origin Country"
              name="originCountry"
              onChange={this.handleSelectChange}
              placeholder="Select a Country"
              ref="countryOfOriginInput"
              value={this.product.originCountry}
              options={this.props.countries}
            />
          </Components.CardBody>
        </Components.Card>
        <Components.Card
          expanded={this.isExpanded("social")}
          name={"social"}
          onExpand={this.handleCardExpand}
        >
          <Components.CardHeader
            actAsExpander={true}
            i18nKeyTitle="social.socialTitle"
            title="Social"
          />
          <Components.CardBody expandable={true}>
            <Components.TextField
              i18nKeyLabel="productDetailEdit.facebookMsg"
              i18nKeyPlaceholder="productDetailEdit.facebookMsg"
              label="Facebook Message"
              multiline={true}
              name="facebookMsg"
              onBlur={this.handleFieldBlur}
              onChange={this.handleFieldChange}
              ref="facebookMsgInput"
              value={this.product.facebookMsg}
            />
            <Components.TextField
              i18nKeyLabel="productDetailEdit.twitterMsg"
              i18nKeyPlaceholder="productDetailEdit.twitterMsg"
              label="Twitter Message"
              multiline={true}
              name="twitterMsg"
              onBlur={this.handleFieldBlur}
              onChange={this.handleFieldChange}
              ref="twitterMsgInput"
              value={this.product.twitterMsg}
            />
            <Components.TextField
              i18nKeyLabel="productDetailEdit.pinterestMsg"
              i18nKeyPlaceholder="productDetailEdit.pinterestMsg"
              label="Pinterest Message"
              multiline={true}
              name="pinterestMsg"
              onBlur={this.handleFieldBlur}
              onChange={this.handleFieldChange}
              ref="pinterestMsgInput"
              value={this.product.pinterestMsg}
            />
            <Components.TextField
              i18nKeyLabel="productDetailEdit.googleplusMsg"
              i18nKeyPlaceholder="productDetailEdit.googleplusMsg"
              label="Google+ Message"
              multiline={true}
              name="googleplusMsg"
              onBlur={this.handleFieldBlur}
              onChange={this.handleFieldChange}
              ref="googleplusMsgInput"
              value={this.product.googleplusMsg}
            />
          </Components.CardBody>
        </Components.Card>

        <Components.Card
          expanded={this.isExpanded("hashtags")}
          name={"hashtags"}
          onExpand={this.handleCardExpand}
        >
          <Components.CardHeader
            actAsExpander={true}
            i18nKeyTitle="productDetail.tags"
            title="Tags"
          />
          <Components.CardBody expandable={true}>
            <Components.TagList
              editable={this.props.editable}
              enableNewTagForm={true}
              product={this.product}
              tagProps={{
                fullWidth: true
              }}
            />
          </Components.CardBody>
        </Components.Card>

        <Components.Card
          expanded={this.isExpanded("metafields")}
          name={"metafields"}
          onExpand={this.handleCardExpand}
        >
          <Components.CardHeader
            actAsExpander={true}
            i18nKeyTitle="productDetailEdit.details"
            title="Details"
          />
          <Components.CardBody expandable={true}>
            <Components.Metadata
              metafields={this.product.metafields}
              newMetafield={this.props.newMetafield}
              onMetaChange={this.handleMetaChange}
              onMetaRemove={this.handleMetaRemove}
              onMetaSave={this.handleMetaSave}
            />
          </Components.CardBody>
        </Components.Card>
      </Components.CardGroup>
    );
  }
}

ProductAdmin.propTypes = {
  countries: PropTypes.arrayOf(PropTypes.object),
  editFocus: PropTypes.oneOfType([PropTypes.string, PropTypes.arrayOf(PropTypes.string)]),
  editable: PropTypes.bool,
  handleFieldBlur: PropTypes.func,
  handleFieldChange: PropTypes.func,
  handleProductFieldChange: PropTypes.func,
  newMetafield: PropTypes.object,
  onCardExpand: PropTypes.func,
  onDeleteProduct: PropTypes.func,
  onFieldChange: PropTypes.func,
  onMetaChange: PropTypes.func,
  onMetaRemove: PropTypes.func,
  onMetaSave: PropTypes.func,
  onProductFieldSave: PropTypes.func,
  onRestoreProduct: PropTypes.func,
  product: PropTypes.object,
  revisonDocumentIds: PropTypes.arrayOf(PropTypes.string),
  templates: PropTypes.arrayOf(PropTypes.shape({
    label: PropTypes.string,
    value: PropTypes.any
  })),
  viewProps: PropTypes.object
};

export default ProductAdmin;
