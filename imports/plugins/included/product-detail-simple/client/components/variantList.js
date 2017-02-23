import React, { Component, PropTypes } from "react";
import Variant from "./variant";
import { EditContainer } from "/imports/plugins/core/ui/client/containers";
import { Divider, IconButton } from "/imports/plugins/core/ui/client/components";
import { ChildVariant } from "./";

class VariantList extends Component {

  handleVariantEditClick = (event, editButtonProps) => {
    if (this.props.onEditVariant) {
      return this.props.onEditVariant(event, editButtonProps.data);
    }
    return true;
  }

  handleVariantVisibilityClick = (event, editButtonProps) => {
    if (this.props.onVariantVisibiltyToggle) {
      const isVariantVisible = !editButtonProps.data.isVisible;
      this.props.onVariantVisibiltyToggle(event, editButtonProps.data, isVariantVisible);
    }
  }

  handleChildleVariantClick = (event, variant) => {
    if (this.props.onVariantClick) {
      this.props.onVariantClick(event, variant, 1);
    }
  }

  handleChildVariantEditClick = (event, editButtonProps) => {
    if (this.props.onEditVariant) {
      return this.props.onEditVariant(event, editButtonProps.data, 1);
    }
    return true;
  }

  isSoldOut(variant) {
    if (this.props.isSoldOut) {
      return this.props.isSoldOut(variant);
    }

    return false;
  }

  renderVariants() {
    let variants = [];
    let addButton;

    if (this.props.editable) {
      addButton = (
        <div className="rui items flex">
          <div className="rui item full justify center">
            <IconButton
              i18nKeyTooltip="variantList.createVariant"
              icon="fa fa-plus"
              primary={true}
              tooltip="Create Variant"
              onClick={this.props.onCreateVariant}
            />
          </div>
        </div>
      );
    }

    if (this.props.variants) {
      variants = this.props.variants.map((variant, index) => {
        const displayPrice = this.props.displayPrice && this.props.displayPrice(variant._id);

        return (
          <EditContainer
            data={variant}
            disabled={this.props.editable === false}
            editView="variantForm"
            i18nKeyLabel="productDetailEdit.editVariant"
            key={index}
            label="Edit Variant"
            onEditButtonClick={this.handleVariantEditClick}
            onVisibilityButtonClick={this.handleVariantVisibilityClick}
            permissions={["createProduct"]}
            showsVisibilityButton={true}
          >
            <Variant
              displayPrice={displayPrice}
              editable={this.props.editable}
              index={index}
              isSelected={this.props.variantIsSelected(variant._id)}
              onClick={this.props.onVariantClick}
              onMove={this.props.onMoveVariant}
              soldOut={this.isSoldOut(variant)}
              variant={variant}
            />
          </EditContainer>
        );
      });
    }

    const variantList = (
      <ul className="variant-list list-unstyled" id="variant-list" key="variantList">
        {variants}
        {addButton}
      </ul>
    );

    if (variants.length === 0 && this.props.editable === false) {
      return variantList;
    } else if (variants.length > 1 || variants.length === 0) {
      return [
        <Divider
          i18nKeyLabel="productDetail.options"
          key="dividerWithLabel"
          label="Options"
        />,
        variantList
      ];
    } else if (variants.length === 1) {
      return [
        <Divider key="divider" />,
        variantList
      ];
    }

    return variantList;
  }

  renderChildVariants() {
    let childVariants = [];

    if (this.props.childVariants) {
      childVariants = this.props.childVariants.map((childVariant, index) => {
        const media = this.props.childVariantMedia.filter((mediaItem) => {
          if (mediaItem.metadata.variantId === childVariant._id) {
            return true;
          }
          return false;
        });

        return (
          <EditContainer
            data={childVariant}
            disabled={this.props.editable === false}
            editView="variantForm"
            i18nKeyLabel="productDetailEdit.editVariant"
            key={index}
            label="Edit Variant"
            onEditButtonClick={this.handleChildVariantEditClick}
            onVisibilityButtonClick={this.handleVariantVisibilityClick}
            permissions={["createProduct"]}
            showsVisibilityButton={true}
          >
            <ChildVariant
              isSelected={this.props.variantIsSelected(childVariant._id)}
              media={media}
              onClick={this.handleChildleVariantClick}
              variant={childVariant}
            />
          </EditContainer>
        );
      });
    }

    if (childVariants.length) {
      return [
        <Divider
          key="availableOptionsDivider"
          i18nKeyLabel="productDetail.availableOptions"
          label="Available Options"
        />,
        <div className="row variant-product-options" key="childVariantList">
          {childVariants}
        </div>
      ];
    }

    return null;
  }

  render() {
    return (
      <div className="product-variants">
        {this.renderVariants()}
        {this.renderChildVariants()}
      </div>
    );
  }
}

VariantList.propTypes = {
  childVariantMedia: PropTypes.arrayOf(PropTypes.any),
  childVariants: PropTypes.arrayOf(PropTypes.object),
  displayPrice: PropTypes.func,
  editable: PropTypes.bool,
  isSoldOut: PropTypes.func,
  onCreateVariant: PropTypes.func,
  onEditVariant: PropTypes.func,
  onMoveVariant: PropTypes.func,
  onVariantClick: PropTypes.func,
  onVariantVisibiltyToggle: PropTypes.func,
  variantIsSelected: PropTypes.func,
  variants: PropTypes.arrayOf(PropTypes.object)
};

export default VariantList;
