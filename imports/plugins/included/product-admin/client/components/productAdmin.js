import React, { Component, PropTypes } from "react";
import {
  Button,
  Card,
  CardHeader,
  CardBody,
  CardGroup,
  Divider,
  Metadata,
  TextField,
  Translation
} from "/imports/plugins/core/ui/client/components";
import { Router } from "/client/api";
import { PublishContainer } from "/imports/plugins/core/revisions";
import { TagListContainer } from "/imports/plugins/core/ui/client/containers";

class ProductAdmin extends Component {
  handleDeleteProduct = () => {
    if (this.props.onDeleteProduct) {
      this.props.onDeleteProduct(this.props.product);
    }
  }

  handleFieldChange = (event, value, field) => {
    if (this.props.onFieldChange) {
      this.props.onFieldChange(field, value);
    }
  }

  handleToggleVisibility = () => {
    if (this.props.onFieldChange) {
      this.props.onFieldChange("isVisible", !this.product.isVisible);
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
    return this.props.product || {};
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
            i18nKeyTitle="productDetailEdit.publish"
            title="Publish"
          />
          <CardBody>
            <PublishContainer
              documentIds={this.props.revisonDocumentIds}
            />
          </CardBody>
        </Card>
        <Card>
          <CardHeader
            i18nKeyTitle="productDetailEdit.productSettings"
            title="Product Settings"
          />
          <CardBody>
            <TextField
              i18nKeyLabel="productDetailEdit.productTitle"
              label="Title"
              multiline={true}
              name="title"
              onBlur={this.handleFieldBlur}
              onChange={this.handleFieldChange}
              value={this.product.title}
            />
            <TextField
              helpText={this.permalink}
              i18nKeyLabel="productDetailEdit.permalink"
              label="Permalink"
              name="handle"
              onBlur={this.handleFieldBlur}
              onChange={this.handleFieldChange}
              value={this.product.handle}
            />
            <TextField
              i18nKeyLabel="productDetailEdit.pageTitle"
              label="Subtitle"
              multiline={true}
              name="pageTitle"
              onBlur={this.handleFieldBlur}
              onChange={this.handleFieldChange}
              value={this.product.pageTitle}
            />
            <TextField
              i18nKeyLabel="productDetailEdit.vendor"
              label="Vendor"
              multiline={true}
              name="vendor"
              onBlur={this.handleFieldBlur}
              onChange={this.handleFieldChange}
              value={this.product.vendor}
            />
            <TextField
              i18nKeyLabel="productDetailEdit.description"
              label="Description"
              multiline={true}
              name="description"
              onBlur={this.handleFieldBlur}
              onChange={this.handleFieldChange}
              value={this.product.description}
            />
            <Divider />
            <Button
              i18nKeyLabel="productDetailEdit.deleteProduct"
              label="Delete Product"
              onClick={this.handleDeleteProduct}
              status="danger"
            />
          </CardBody>
        </Card>
        <Card>
          <CardBody>
            <div className="rui items flex">
              <div className="rui item three-quarters">
                {this.renderProductVisibilityLabel()}
              </div>
              <div className="rui item quarter">
                <Button
                  i18nKeyLabel="productDetailEdit.makeVisible"
                  i18nKeyToggleOnLabel="productDetailEdit.hideProduct"
                  label="Make Visible"
                  onClick={this.handleToggleVisibility}
                  toggle={true}
                  toggleOn={this.product.isVisible}
                  toggleOnLabel="Hide Product"
                />
              </div>
            </div>
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
              value={this.product.facebookMsg}
            />
            <TextField
              i18nKeyLabel="productDetailEdit.twitterMsg"
              label="Twitter Message"
              multiline={true}
              name="twitterMsg"
              onBlur={this.handleFieldBlur}
              onChange={this.handleFieldChange}
              value={this.product.twitterMsg}
            />
            <TextField
              i18nKeyLabel="productDetailEdit.pinterestMsg"
              label="Pinterest Message"
              multiline={true}
              name="pinterestMsg"
              onBlur={this.handleFieldBlur}
              onChange={this.handleFieldChange}
              value={this.product.pinterestMsg}
            />
            <TextField
              i18nKeyLabel="productDetailEdit.googleplusMsg"
              label="Google+ Message"
              multiline={true}
              name="googleplusMsg"
              onBlur={this.handleFieldBlur}
              onChange={this.handleFieldChange}
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
  product: PropTypes.object,
  revisonDocumentIds: PropTypes.arrayOf(PropTypes.string)
};

export default ProductAdmin;
