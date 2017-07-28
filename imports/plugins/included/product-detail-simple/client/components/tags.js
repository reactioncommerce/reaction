import React, { Component } from "react";
import PropTypes from "prop-types";
import classnames from "classnames";
import { Components, registerComponent } from "@reactioncommerce/reaction-components";

class ProductTags extends Component {
  get tags() {
    return this.props.tags;
  }

  get showEditControls() {
    return this.props.product && this.props.editable;
  }

  renderEditButton() {
    if (this.showEditControls) {
      return (
        <span className="edit-button">
          <Components.EditContainer
            data={this.props.product}
            disabled={this.props.editable === false}
            editView="ProductAdmin"
            field="hashtags"
            i18nKeyLabel="productDetailEdit.productSettings"
            label="Product Settings"
            permissions={["createProduct"]}
          />
        </span>
      );
    }

    return null;
  }

  render() {
    if (Array.isArray(this.tags) && this.tags.length > 0) {
      const headerClassName = classnames({
        "tags-header": true,
        "edit": this.showEditControls
      });

      return (
        <div className="pdp product-tags">
          <h3 className={headerClassName}>
            <Components.Translation defaultValue="Tags" i18nKey="productDetail.tags" />
            {this.renderEditButton()}
          </h3>
          <Components.TagList
            editable={false}
            product={this.props.product}
            tags={this.tags}
          />
        </div>
      );
    }
    return null;
  }
}

ProductTags.propTypes = {
  editButton: PropTypes.node,
  editable: PropTypes.bool,
  product: PropTypes.object,
  tags: PropTypes.arrayOf(PropTypes.object)
};

registerComponent("ProductTags", ProductTags);

export default ProductTags;
