import React, { Component, PropTypes} from "react";
import Variant from "./variant";
import { EditContainer } from "/imports/plugins/core/ui/client/containers";
import { Translation } from "/imports/plugins/core/ui/client/components";

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

  render() {
    return (
      <div className="product-variants">
        <ul className="variant-list list-unstyled" id="variant-list">
          {this.renderVariants()}
        </ul>
      </div>
    );
  }
}

VariantList.propTypes = {
  variantIsSelected: PropTypes.func,
  variants: PropTypes.arrayOf(PropTypes.object)
};

export default VariantList;
