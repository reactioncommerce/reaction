import { isEqual } from "lodash";
import React, { Component, PropTypes } from "react";
import Velocity from "velocity-animate";
import "velocity-animate/velocity.ui";
import {
  Card,
  CardHeader,
  CardBody,
  CardGroup,
  Metadata,
  TextField,
  Translation,
  Select
} from "/imports/plugins/core/ui/client/components";
import { Router } from "/client/api";
import { TagListContainer } from "/imports/plugins/core/ui/client/containers";
import update from "react/lib/update";

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
      fieldName = field[0];
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
      const input = fieldRef.refs.input;

      Velocity.RunSequence([
        { e: input, p: { backgroundColor: "#e2f2e2" }, o: { duration: 200 } },
        { e: input, p: { backgroundColor: "#fff" }, o: { duration: 100 } }
      ]);
    }
  }

  handleCardExpand(cardName) {
    if (this.props.onCardExpand) {
      this.props.onCardExpand(cardName);
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
      this.props.onMetaChange(metafield, index);
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
        <Translation defaultValue="Product is visible" i18nKey="productDetailEdit.productIsVisible" />
      );
    }

    return (
      <Translation defaultValue="Product is not visible" i18nKey="productDetailEdit.productIsNotVisible" />
    );
  }

  isExpanded(groupName) {
    if (this.state.expandedCard && this.state.expandedCard === groupName) {
      return true;
    }

    return false;
  }

  render() {
    return (
      <CardGroup>
        <Card
          expanded={this.isExpanded("productDetails")}
          onExpand={this.handleCardExpand.bind(this, "productDetails")}
        >
          <CardHeader
            actAsExpander={true}
            i18nKeyTitle="productDetailEdit.productSettings"
            title="Product Settings"
            onChange={this.handleFieldChange}
          />
          <CardBody expandable={true}>
            <Select
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
            <TextField
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
            <TextField
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
            <TextField
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
            <TextField
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
            <TextField
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
            <Select
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
          </CardBody>
        </Card>
        <Card
          expanded={this.isExpanded("social")}
          onExpand={this.handleCardExpand.bind(this, "social")}
        >
          <CardHeader
            actAsExpander={true}
            i18nKeyTitle="social.socialTitle"
            title="Social"
          />
          <CardBody expandable={true}>
            <TextField
              i18nKeyLabel="productDetailEdit.facebookMsg"
              label="Facebook Message"
              multiline={true}
              name="facebookMsg"
              onBlur={this.handleFieldBlur}
              onChange={this.handleFieldChange}
              ref="facebookMsgInput"
              value={this.product.facebookMsg}
            />
            <TextField
              i18nKeyLabel="productDetailEdit.twitterMsg"
              label="Twitter Message"
              multiline={true}
              name="twitterMsg"
              onBlur={this.handleFieldBlur}
              onChange={this.handleFieldChange}
              ref="twitterMsgInput"
              value={this.product.twitterMsg}
            />
            <TextField
              i18nKeyLabel="productDetailEdit.pinterestMsg"
              label="Pinterest Message"
              multiline={true}
              name="pinterestMsg"
              onBlur={this.handleFieldBlur}
              onChange={this.handleFieldChange}
              ref="pinterestMsgInput"
              value={this.product.pinterestMsg}
            />
            <TextField
              i18nKeyLabel="productDetailEdit.googleplusMsg"
              label="Google+ Message"
              multiline={true}
              name="googleplusMsg"
              onBlur={this.handleFieldBlur}
              onChange={this.handleFieldChange}
              ref="googleplusMsgInput"
              value={this.product.googleplusMsg}
            />
          </CardBody>
        </Card>

        <Card
          expanded={this.isExpanded("hashtags")}
          onExpand={this.handleCardExpand.bind(this, "hashtags")}
        >
          <CardHeader
            actAsExpander={true}
            i18nKeyTitle="productDetail.tags"
            title="Tags"
          />
          <CardBody expandable={true}>
            <TagListContainer
              enableNewTagForm={true}
              product={this.product}
              tagProps={{
                fullWidth: true
              }}
            />
          </CardBody>
        </Card>

        <Card
          expanded={this.isExpanded("metafields")}
          onExpand={this.handleCardExpand.bind(this, "metafields")}
        >
          <CardHeader
            actAsExpander={true}
            i18nKeyTitle="productDetailEdit.details"
            title="Details"
          />
          <CardBody expandable={true}>
            <Metadata
              metafields={this.product.metafields}
              newMetafield={this.props.newMetafield}
              onMetaChange={this.handleMetaChange}
              onMetaRemove={this.handleMetaRemove}
              onMetaSave={this.handleMetaSave}
            />
          </CardBody>
        </Card>
      </CardGroup>
    );
  }
}

ProductAdmin.propTypes = {
  countries: PropTypes.arrayOf(PropTypes.object),
  editFocus: PropTypes.oneOfType([PropTypes.string, PropTypes.arrayOf(PropTypes.string)]),
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
