import React, { Component } from "react";
import PropTypes from "prop-types";
import { compose } from "recompose";
import { registerComponent } from "@reactioncommerce/reaction-components";
import { Meteor } from "meteor/meteor";
import { Session } from "meteor/session";
import { Validation } from "@reactioncommerce/reaction-collections";
import { ReactionProduct } from "/lib/api";
import { Packages } from "/lib/collections";
import { Reaction, i18next } from "/client/api";
import { TaxCodes } from "/imports/plugins/core/taxes/lib/collections";
import { ProductVariant } from "/lib/collections/schemas/products";
import VariantForm from "../components/variantForm";

const wrapComponent = (Comp) => (
  class VariantFormContainer extends Component {
    static propTypes = {
      variant: PropTypes.object
    }

    constructor(props) {
      super(props);

      this.validation = new Validation(ProductVariant);

      this.state = {
        validationStatus: this.validation.validationStatus,
        isDeleted: props.variant && props.variant.isDeleted
      };
    }

    componentDidMount() {
      this.runVariantValidation(this.props.variant);
    }

    componentWillReceiveProps(nextProps) {
      this.setState({
        isDeleted: nextProps.variant && nextProps.variant.isDeleted
      });
    }

    runVariantValidation(variant) {
      if (variant) {
        const validationStatus = this.validation.validate(variant);

        this.setState(() => ({
          validationStatus
        }));

        return validationStatus;
      }
    }

    isProviderEnabled = () => {
      const shopId = Reaction.getShopId();

      const provider = Packages.findOne({
        shopId,
        "registry.provides": "taxCodes",
        "$where"() {
          const providerName = this.name.split("-")[1];
          return this.settings[providerName].enabled;
        }
      });

      if (provider) {
        return true;
      }
      return false;
    }

    fetchTaxCodes = () => {
      const shopId = Reaction.getShopId();
      const provider = Packages.findOne({
        shopId,
        "registry.provides": "taxCodes",
        "$where"() {
          const providers = this.registry.filter((o) => o.provides && o.provides.includes("taxCodes"));
          const providerName = providers[0].name.split("/")[2];

          return this.settings[providerName].enabled;
        }
      });
      const taxCodesArray = [];

      const codes = TaxCodes.find({
        shopId,
        taxCodeProvider: provider.name
      });

      codes.forEach((code) => {
        taxCodesArray.push({
          value: code.taxCode,
          label: `${code.taxCode} | ${code.label}`
        });
      });
      return taxCodesArray;
    }

    hasChildVariants = (variant) => {
      if (ReactionProduct.checkChildVariants(variant._id) > 0) {
        return true;
      }
      return false;
    }

    greyDisabledFields = (variant) => {
      if (this.hasChildVariants(variant)) {
        return { backgroundColor: "lightgrey", cursor: "not-allowed" };
      }
    }

    restoreVariant = (variant) => {
      const title = variant.title || i18next.t("productDetailEdit.thisVariant");

      Alerts.alert({
        title: i18next.t("productDetailEdit.restoreVariantConfirm", { title }),
        showCancelButton: true,
        confirmButtonText: "Restore"
      }, (isConfirm) => {
        if (isConfirm) {
          const id = variant._id;
          Meteor.call("products/updateProductField", id, "isDeleted", false, (error) => {
            if (error) {
              Alerts.alert({
                text: i18next.t("productDetailEdit.restoreVariantFail", { title }),
                confirmButtonText: i18next.t("app.close", { defaultValue: "Close" })
              });
            }
            this.setState({
              isDeleted: !this.state.isDeleted
            });
          });
        }
      });
    }

    removeVariant = (variant) => {
      const title = variant.title || i18next.t("productDetailEdit.thisVariant");

      Alerts.alert({
        title: i18next.t("productDetailEdit.archiveVariantConfirm", { title }),
        showCancelButton: true,
        confirmButtonText: "Archive"
      }, (isConfirm) => {
        if (isConfirm) {
          this.setState({
            isDeleted: !this.state.isDeleted
          });
          const id = variant._id;
          Meteor.call("products/deleteVariant", id, (error, result) => {
            if (result && ReactionProduct.selectedVariantId() === id) {
              return ReactionProduct.setCurrentVariant(null);
            }
          });
        }
      });
    }

    cloneVariant = (variant) => {
      const title = variant.title || i18next.t("productDetailEdit.thisVariant");
      const productId = ReactionProduct.selectedProductId();
      if (!productId) {
        return;
      }
      Meteor.call("products/cloneVariant", productId, variant._id, (error, result) => {
        if (error) {
          Alerts.alert({
            text: i18next.t("productDetailEdit.cloneVariantFail", { title }),
            confirmButtonText: i18next.t("app.close", { defaultValue: "Close" })
          });
        } else if (result) {
          const variantId = result[0];

          ReactionProduct.setCurrentVariant(variantId);
          Session.set(`variant-form-${variantId}`, true);
        }
      });
    }

    handleVariantFieldSave = (variantId, fieldName, value, variant) => {
      const validationStatus = this.runVariantValidation(variant);

      if (validationStatus.isFieldValid(fieldName)) {
        Meteor.call("products/updateProductField", variantId, fieldName, value, (error) => {
          if (error) {
            Alerts.toast(error.message, "error");
          }

          if (fieldName === "inventoryPolicy") {
            this.updateInventoryPolicyIfChildVariants(variant);
          }
        });
      }
    }

    handleCardExpand = (cardName) => {
      Reaction.state.set("edit/focus", cardName);
    }

    handleVariantVisibilityToggle = (variant) => {
      Meteor.call("products/updateProductField", variant._id, "isVisible", !variant.isVisible);
    }

    /**
     * @method updateInventoryPolicyIfChildVariants
     * @description update parent inventory policy if variant has children
     * @param {Object} variant product or variant document
     * @return {undefined} return nothing
     */
    updateInventoryPolicyIfChildVariants = (variant) => {
      // Get all siblings, including current variant
      const options = ReactionProduct.getSiblings(variant);
      // Get parent
      const parent = ReactionProduct.getVariantParent(variant);

      // If this is not a top-level variant, update top-level inventory policy as well
      if (parent && options && options.length) {
        // Check to see if every variant option inventory policy is true
        const inventoryPolicy = options.every((option) => option.inventoryPolicy === true);

        // If all inventory policies on children are true, update parent to be true
        if (inventoryPolicy === true) {
          return Meteor.call("products/updateProductField", parent._id, "inventoryPolicy", true, (error) => {
            if (error) {
              Alerts.toast(error.message, "error");
            }
          });
        }
        // If any child has a false inventoryPolicy, update parent to be false
        return Meteor.call("products/updateProductField", parent._id, "inventoryPolicy", false, (error) => {
          if (error) {
            Alerts.toast(error.message, "error");
          }
        });
      }
    }

    updateQuantityIfChildVariants = (variant) => {
      if (this.hasChildVariants(variant)) {
        const variantQuantity = ReactionProduct.getVariantQuantity(variant);
        return variantQuantity;
      }
    }

    render() {
      if (this.props.variant) {
        return (
          <Comp
            isProviderEnabled={this.isProviderEnabled}
            fetchTaxCodes={this.fetchTaxCodes}
            hasChildVariants={this.hasChildVariants}
            greyDisabledFields={this.greyDisabledFields}
            restoreVariant={this.restoreVariant}
            removeVariant={this.removeVariant}
            cloneVariant={this.cloneVariant}
            onVariantFieldSave={this.handleVariantFieldSave}
            onVisibilityButtonClick={this.handleVariantVisibilityToggle}
            onCardExpand={this.handleCardExpand}
            onUpdateQuantityField={this.updateQuantityIfChildVariants}
            validation={this.state.validationStatus}
            isDeleted={this.state.isDeleted}
            {...this.props}
            variant={this.props.variant}
          />
        );
      }

      return null;
    }
  }
);

registerComponent("VariantForm", VariantForm, wrapComponent);

export default compose(wrapComponent)(VariantForm);
