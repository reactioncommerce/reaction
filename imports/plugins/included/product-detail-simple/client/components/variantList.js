import React, { Component, PropTypes} from "react";
import Variant from "./variant";
import { EditContainer } from "/imports/plugins/core/ui/client/containers";
import { Translation } from "/imports/plugins/core/ui/client/components";
import { ChildVariant } from "./";

class VariantList extends Component {

  renderVariants() {
    if (this.props.variants) {
      return this.props.variants.map((variant, index) => {
        return (
          <EditContainer
            data={variant}
            editTypes={["edit", "visibility"]}
            editView="variantForm"
            i18nKeyLabel="productDetailEdit.editVariant"
            key={index}
            label="Edit Variant"
            permissions={["createProduct"]}
          >
            <Variant
              isSelected={this.props.variantIsSelected(variant._id)}
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
            editTypes={["edit", "visibility"]}
            editView="variantForm"
            i18nKeyLabel="productDetailEdit.editVariant"
            key={index}
            label="Edit Variant"
            permissions={["createProduct"]}
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
        <ul className="variant-list list-unstyled" id="variant-list">
          {this.renderVariants()}
        </ul>
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
