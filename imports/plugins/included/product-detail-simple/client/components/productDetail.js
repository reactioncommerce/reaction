import React, { Component, PropTypes } from "react";
import {
  MediaGallery,
  Currency
} from "/imports/plugins/core/ui/client/components/";
import {
  AddToCartButton,
  ProductMetadata,
  ProductTags,
  ProductField
} from "./";
import { AlertContainer, EditContainer } from "/imports/plugins/core/ui/client/containers";

class ProductDetail extends Component {
  get tags() {
    return this.props.tags || [];
  }

  get product() {
    return this.props.product || {};
  }

  get editable() {
    return this.props.editable;
  }

  render() {
    return (
      <div className="container-main">
        <div className="container-fluid pdp-container" itemScope itemType="http://schema.org/Product">
          <AlertContainer placement="productManagement" />

          <header className="pdp header">
            <ProductField
              editable={this.editable}
              fieldName="title"
              fieldTitle="Title"
              element={<h1 />}
              onProductFieldChange={this.props.handleProductFieldChange}
              product={this.product}
            />

            <ProductField
              editable={this.editable}
              fieldName="pageTitle"
              fieldTitle="Sub Title"
              element={<h2 />}
              onProductFieldChange={this.props.handleProductFieldChange}
              product={this.product}
            />
          </header>


          <div className="pdp-content">
            <div className="pdp column left pdp-left-column">
              <MediaGallery media={this.props.media} />
              <ProductTags editable={true} product={this.product} tags={this.tags} />
              <ProductMetadata editable={true} product={this.product} />
            </div>

            <div className="pdp column right pdp-right-column">


              <div className="pricing">
                <div className="left">
                  <span className="price">
                    <span id="price">
                      <Currency amount={this.props.priceRange} />
                    </span>
                  </span>
                </div>
                <div className="right">
                  {this.props.socialComponent}
                </div>
              </div>


              <div className="vendor">
                <ProductField
                  editable={this.editable}
                  fieldName="vendor"
                  fieldTitle="Vendor"
                  onProductFieldChange={this.props.handleProductFieldChange}
                  product={this.product}
                />
              </div>

              <div className="pdp product-info">
                <ProductField
                  editable={this.editable}
                  fieldName="description"
                  fieldTitle="Description"
                  multiline={true}
                  onProductFieldChange={this.props.handleProductFieldChange}
                  product={this.product}
                />
              </div>

              <div className="options-add-to-cart">
                {this.props.topVariantComponent}
              </div>
              <hr />
              <div>
                <AlertContainer placement="productDetail" />
                <AddToCartButton
                  cartQuantity={this.props.cartQuantity}
                  onCartQuantityChange={this.props.onCartQuantityChange}
                  onClick={this.props.onAddToCart}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

ProductDetail.propTypes = {
  cartQuantity: PropTypes.number,
  editable: PropTypes.bool,
  onAddToCart: PropTypes.func,
  onCartQuantityChange: PropTypes.func,
  product: PropTypes.object
};

export default ProductDetail;
