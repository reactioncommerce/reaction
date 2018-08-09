import React, { Component } from "react";
import PropTypes from "prop-types";
import { Components, registerComponent } from "@reactioncommerce/reaction-components";
import { Router } from "@reactioncommerce/reaction-router";

class ProductTagsCustomer extends Component {
  renderTagsList() {
    const { tags } = this.props;
    return tags.map((tag, index) => {
      const url = Router.pathFor("tag", {
        hash: {
          slug: tag.slug
        }
      });
      return (
        <div key={index}>
          <a className="rui tag link" href={url}>{tag.name}</a>
        </div>
      );
    });
  }

  render() {
    return (
      <div className="pdp product-tags">
        <h3 className="tags-header">
          <Components.Translation defaultValue="Tags" i18nKey="productDetail.tags" />
        </h3>
        <div className="rui tags">
          {this.renderTagsList()}
        </div>
      </div>
    );
  }
}

ProductTagsCustomer.propTypes = {
  tags: PropTypes.arrayOf(PropTypes.object)
};

export default ProductTagsCustomer;

registerComponent("ProductTagsCustomer", ProductTagsCustomer);
