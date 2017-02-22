import React, { Component, PropTypes } from "react";
import classnames from "classnames";
import { Translation } from "/imports/plugins/core/ui/client/components/";
import { TagListContainer, EditContainer } from "/imports/plugins/core/ui/client/containers";

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
          <EditContainer
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
            <Translation defaultValue="Tags" i18nKey="productDetail.tags" />
            {this.renderEditButton()}
          </h3>
          <TagListContainer
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

export default ProductTags;
