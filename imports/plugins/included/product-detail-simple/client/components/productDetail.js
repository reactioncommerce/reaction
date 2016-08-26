import React, { Component, PropTypes } from "react";
import NumericInput from "/imports/plugins/core/ui/client/components/";
import { AddToCartButton, MediaGallery } from "./"

class ProductDetail extends Component {
  get product() {
    return this.props.product || {};
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
