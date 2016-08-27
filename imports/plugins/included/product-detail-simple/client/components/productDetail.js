import React, { Component, PropTypes } from "react";
import {
  Metadata,
  NumericInput,
  Translation
} from "/imports/plugins/core/ui/client/components/";
import { AddToCartButton, MediaGallery } from "./"

class ProductDetail extends Component {
  get product() {
    return this.props.product || {};
  }

  renderMetadata() {
    if (Array.isArray(this.product.metafields) && this.product.metafields.length > 0) {
      return (
        <div>
          <h3>
            <Translation defaultValue="Details" i18nKey="productDetail.details" />
          </h3>
          <Metadata metafields={this.product.metafields} editable={false} />
        </div>
      )
    }
  }

  render() {
    console.log("product tiotl", this.product.title);
    return (
      <div className="container-main">
        <div className="container-fluid pdp-container" itemScope itemType="http://schema.org/Product">
          <header className="pdp header">
              <div className="title">
                <h1 id="title" itemProp="name">{this.product.title}</h1>
              </div>
              <div className="pageTitle">
                <h2 id="pageTitle">{this.product.pageTitle}</h2>
              </div>
          </header>


          <div className="pdp-content">
            <div className="pdp column left pdp-left-column">
              <MediaGallery media={this.props.media} />

              {this.renderMetadata()}
            </div>

            <div className="pdp column right pdp-right-column">


              <div className="pricing">
                <div className="left">
                  <span className="price">
                    <span id="price" itemProp="price">{this.props.priceRange}</span>
                  </span>
                </div>
                <div className="right">
                  {this.props.socialComponent}
                </div>
              </div>


              <div className="vendor">
                {this.product.vendor}
              </div>

              <div class="pdp product-info">
                <div class="description">
                  {this.product.description}
                </div>
              </div>

              <div class="options-add-to-cart">
                <h3 data-i18n="productDetail.options">Options</h3>
                {this.props.topVariantComponent}
              </div>
              <hr />
              <div>
                <AddToCartButton />
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

export default ProductDetail;
