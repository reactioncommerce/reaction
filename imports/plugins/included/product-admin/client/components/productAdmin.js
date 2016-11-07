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
  Translation
} from "/imports/plugins/core/ui/client/components";
import { Router } from "/client/api";
import { TagListContainer } from "/imports/plugins/core/ui/client/containers";
import { isEqual } from "lodash";
import update from "react/lib/update";

const fieldNames = [
  "title",
  "handle",
  "subtitle",
  "vendor",
  "description",
  "facebookMsg",
  "twitterMsg",
  "pinterestMsg",
  "googleplusMsg"
];

class ProductAdmin extends Component {
  constructor(props) {
    super(props);

    this.state = {
      product: props.product
    };
  }

  componentWillReceiveProps(nextProps) {
    if (!isEqual(nextProps.product, this.props.product)) {
      for (const fieldName of fieldNames) {
        if (nextProps.product[fieldName] !== this.props.product[fieldName]) {
          const input = this.refs[`${fieldName}Input`].refs.input;

          Velocity.RunSequence([
            {e: input, p: { backgroundColor: "#e2f2e2" }, o: { duration: 200 }},
            {e: input, p: { backgroundColor: "#fff" }, o: { duration: 100 }}
          ]);
        }
      }
    }

    this.setState({
      product: nextProps.product
    });
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

  render() {
    return (
      <CardGroup>
        <Card>
          <CardHeader
            i18nKeyTitle="productDetailEdit.productSettings"
            title="Product Settings"
          />
          <CardBody>
            <TextField
              i18nKeyLabel="productDetailEdit.title"
              i18nKeyPlaceholder="productDetailEdit.title"
              label="Title"
              multiline={true}
              name="title"
              onBlur={this.handleFieldBlur}
              onChange={this.handleFieldChange}
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
              placeholder="Permalink"
              ref="handleInput"
              value={this.product.handle}
            />
            <TextField
              i18nKeyLabel="productDetailEdit.pageTitle"
              i18nKeyPlaceholder="productDetailEdit.pageTitle"
              label="Subtitle"
              multiline={true}
              name="pageTitle"
              onBlur={this.handleFieldBlur}
              onChange={this.handleFieldChange}
              placeholder="Subtitle"
              ref="subtitleInput"
              value={this.product.pageTitle}
            />
            <TextField
              i18nKeyLabel="productDetailEdit.vendor"
              i18nKeyPlaceholder="productDetailEdit.vendor"
              label="Vendor"
              multiline={true}
              name="vendor"
              onBlur={this.handleFieldBlur}
              onChange={this.handleFieldChange}
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
          </CardBody>
        </Card>
        <Card>
          <CardHeader
            i18nKeyTitle="social.socialTitle"
            title="Social"
          />
          <CardBody>
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

        <Card>
          <CardHeader
            i18nKeyTitle="productDetailEdit.tags"
            title="Tags"
          />
          <CardBody>
            <TagListContainer
              enableNewTagForm={true}
              product={this.product}
              tagProps={{
                fullWidth: true
              }}
            />
          </CardBody>
        </Card>

        <Card>
          <CardHeader
            i18nKeyTitle="productDetailEdit.details"
            title="Details"
          />
          <CardBody>
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
  handleFieldBlur: PropTypes.func,
  handleFieldChange: PropTypes.func,
  handleProductFieldChange: PropTypes.func,
  newMetafield: PropTypes.object,
  onDeleteProduct: PropTypes.func,
  onFieldChange: PropTypes.func,
  onMetaChange: PropTypes.func,
  onMetaRemove: PropTypes.func,
  onMetaSave: PropTypes.func,
  onProductFieldSave: PropTypes.func,
  onRestoreProduct: PropTypes.func,
  product: PropTypes.object,
  revisonDocumentIds: PropTypes.arrayOf(PropTypes.string)
};

export default ProductAdmin;
