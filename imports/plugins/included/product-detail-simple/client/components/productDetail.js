import React, { Component, PropTypes } from "react";
import {
  Alert,
  Button,
  Currency,
  Divider,
  Menu,
  MenuItem,
  Popover,
  Translation,
  Toolbar,
  ToolbarGroup,
  ToolbarText
} from "/imports/plugins/core/ui/client/components/";
import {
  AddToCartButton,
  ProductMetadata,
  ProductTags,
  ProductField
} from "./";
import { AlertContainer, EditContainer } from "/imports/plugins/core/ui/client/containers";
import { PublishContainer } from "/imports/plugins/core/revisions";

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

  renderToolbar() {
    /*
    <ToolbarText>
      <Translation defaultValue="You are viewing this product as an administrator" />
    </ToolbarText>
    <Button label="View As Customer" />
     */
    if (this.props.hasAdminPrivilages || true) {
      return (
        <Toolbar>
          <ToolbarGroup firstChild={true}>
            <Translation defaultValue="Viewing as administrator" />
            <Popover buttonElement={<Button label="Switch" />}>
              <Menu onChange={this.props.onViewContextChange}>
                <MenuItem label="View draft as administrator" value="administrator" />
                <MenuItem label="View draft as customer" value="customer" />
                <Divider />
                <MenuItem label="View published as administrator" value="published-admin" />
                <MenuItem label="View published as customer" value="published-customer" />
              </Menu>
            </Popover>
          </ToolbarGroup>
          <ToolbarGroup lastChild={true}>
            <PublishContainer documentIds={[this.product._id]} />
              <Popover buttonElement={<Button icon="fa fa-ellipsis-v" />}>
                <Menu onChange={this.props.onViewContextChange}>
                  <MenuItem label="Delete" value="delete" />
                </Menu>
              </Popover>
          </ToolbarGroup>
        </Toolbar>
      );
    }
  }

  render() {
    return (
      <div className="" style={{position: "relative"}}>
        {this.renderToolbar()}

        <div className="container-main container-fluid pdp-container" itemScope itemType="http://schema.org/Product">
          <AlertContainer placement="productManagement" />

          <header className="pdp header">
            <ProductField
              editable={this.editable}
              fieldName="title"
              fieldTitle="Title"
              element={<h1 />}
              onProductFieldChange={this.props.handleProductFieldChange}
              product={this.product}
              textFieldProps={{
                i18nKeyPlaceholder: "productDetailEdit.title",
                placeholder: "Title"
              }}
            />

            <ProductField
              editable={this.editable}
              fieldName="pageTitle"
              fieldTitle="Sub Title"
              element={<h2 />}
              onProductFieldChange={this.props.handleProductFieldChange}
              product={this.product}
              textFieldProps={{
                i18nKeyPlaceholder: "productDetailEdit.pageTitle",
                placeholder: "Subtitle"
              }}
            />
          </header>


          <div className="pdp-content">
            <div className="pdp column left pdp-left-column">
              {this.props.mediaGalleryComponent}
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
                  textFieldProps={{
                    i18nKeyPlaceholder: "productDetailEdit.vendor",
                    placeholder: "Vendor"
                  }}
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
                  textFieldProps={{
                    i18nKeyPlaceholder: "productDetailEdit.description",
                    placeholder: "Description"
                  }}
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
