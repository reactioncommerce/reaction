import React, { Component, PropTypes} from "react";
import Variant from "./variant";
import { EditContainer } from "/imports/plugins/core/ui/client/containers";
import { Divider, Translation } from "/imports/plugins/core/ui/client/components";
import { ChildVariant } from "./";

class VariantList extends Component {

  isSoldOut(variant) {
    if (this.props.isSoldOut) {
      return this.props.isSoldOut(variant)
    }

    return false
  }

  renderVariants() {
    if (this.props.variants) {
      return this.props.variants.map((variant, index) => {
        const displayPrice = this.props.displayPrice && this.props.displayPrice(variant._id);

        return (
          <EditContainer
            data={variant}
            editView="variantForm"
            i18nKeyLabel="productDetailEdit.editVariant"
            key={index}
            label="Edit Variant"
            permissions={["createProduct"]}
            showsVisibilityButton={true}
          >
            <Variant
              isSelected={this.props.variantIsSelected(variant._id)}
              displayPrice={displayPrice}
              soldOut={this.isSoldOut(variant)}
              variant={variant}
            />
          </EditContainer>
        );
      });
    }

    return (
      <li>
        <a href="#" id="create-variant">
          {"+"} <Translation defaultValue="Create Variant" i18nKey="variantList.createVariant" />
        </a>
      </li>
    );
  }

  renderChildVariants() {
    if (this.props.childVariants) {
      return this.props.childVariants.map((childVariant, index) => {
        return (
          <EditContainer
            data={childVariant}
            editView="variantForm"
            i18nKeyLabel="productDetailEdit.editVariant"
            key={index}
            label="Edit Variant"
            permissions={["createProduct"]}
            showsVisibilityButton={true}
          >
            <ChildVariant
              isSelected={this.props.variantIsSelected(childVariant._id)}
              variant={childVariant}
            />
          </EditContainer>
        );
      });
    }

    return null;
  }

  render() {
    console.log(this.props);
    return (
      <div className="product-variants">
        <Divider
          i18nKeyLabel="productDetail.options"
          label="Options"
        />
        <ul className="variant-list list-unstyled" id="variant-list">
          {this.renderVariants()}
        </ul>
        <Divider
          i18nKeyLabel="productDetail.availableOptions"
          label="Available Options"
        />
        <div className="row variant-product-options">
          {this.renderChildVariants()}
        </div>
      </div>
    );
  }
}

VariantList.propTypes = {
  childVariants: PropTypes.arrayOf(PropTypes.object),
  variantIsSelected: PropTypes.func,
  variants: PropTypes.arrayOf(PropTypes.object)
};

export default VariantList;
