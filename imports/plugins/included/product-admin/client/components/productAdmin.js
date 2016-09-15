import React, { Component, PropTypes } from "react";

import {
  Card,
  CardHeader,
  CardBody,
  CardGroup,
  Metadata,
  TextField,
  TagList
} from "/imports/plugins/core/ui/client/components";
import { PublishContainer } from "/imports/plugins/core/revisions";
import { TagListContainer } from "/imports/plugins/core/ui/client/containers";

class ProductAdmin extends Component {
  constructor(props) {
    super(props);

    this.state = {
      ...props.product
    };
  }

  componentWillReceiveProps(nextProps) {
    this.setState({
      ...nextProps.product
    });
  }

  handleFieldChange = (event, value, field) => {
    this.setState({ [field]: value });
  }

  handleMetaChange = (event, metafield, index) => {
    const newMetadata = this.state.metafields.map((data, currentIndex) => {
      if (index === currentIndex) {
        return metafield;
      }

      return data;
    });

    this.setState({
      metafields: newMetadata
    });
  }

  handleFieldBlur = (event, value, field) => {
    if (this.props.handleProductFieldChange) {
      this.props.handleProductFieldChange(this.product._id, field, value);
    }
  }

  handleMetaSave = (event, metafield, index) => {
    if (this.props.handleProductMetafieldChange) {
      console.log("wpuld update", index, metafield);
      this.props.handleProductMetafieldChange(this.product._id, metafield, index);
    }
  }

  handleMetaRemove = (event, metafield, index) => {
    if (this.props.handleProductMetafieldRemove) {
      this.props.handleProductMetafieldRemove(this.product._id, metafield, index);
    }
  }

  get product() {
    return this.props.product || {};
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
              label="Product Title"
              name="title"
              onBlur={this.handleFieldBlur}
              onChange={this.handleFieldChange}
              value={this.state.title}
            />
            <TextField
              i18nKeyLabel="productDetailEdit.pageTitle"
              label="Product Sub Title"
              name="pageTitle"
              onBlur={this.handleFieldBlur}
              onChange={this.handleFieldChange}
              value={this.state.pageTitle}
            />
            <TextField
              i18nKeyLabel="productDetailEdit.vendor"
              label="Vendor"
              name="vendor"
              onBlur={this.handleFieldBlur}
              onChange={this.handleFieldChange}
              value={this.state.vendor}
            />
            <TextField
              i18nKeyLabel="productDetailEdit.description"
              label="Description"
              multiline={true}
              name="description"
              onBlur={this.handleFieldBlur}
              onChange={this.handleFieldChange}
              value={this.state.description}
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
              value={this.state.facebookMsg}
            />
            <TextField
              i18nKeyLabel="productDetailEdit.twitterMsg"
              label="Twitter Message"
              multiline={true}
              name="twitterMsg"
              onBlur={this.handleFieldBlur}
              onChange={this.handleFieldChange}
              value={this.state.twitterMsg}
            />
            <TextField
              i18nKeyLabel="productDetailEdit.pinterestMsg"
              label="Pinterest Message"
              multiline={true}
              name="pinterestMsg"
              onBlur={this.handleFieldBlur}
              onChange={this.handleFieldChange}
              value={this.state.pinterestMsg}
            />
            <TextField
              i18nKeyLabel="productDetailEdit.googleplusMsg"
              label="Google+ Message"
              multiline={true}
              name="googleplusMsg"
              onBlur={this.handleFieldBlur}
              onChange={this.handleFieldChange}
              value={this.state.googleplusMsg}
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
              product={this.props.product}
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
              metafields={this.state.metafields}
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
  product: PropTypes.object,
  revisonDocumentIds: PropTypes.arrayOf(PropTypes.string)
};

export default ProductAdmin;
