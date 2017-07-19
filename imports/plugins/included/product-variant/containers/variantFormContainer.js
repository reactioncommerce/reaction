import React, { Component } from "react";
import PropTypes from "prop-types";
import _ from "lodash";
import { Meteor } from "meteor/meteor";
import { Session } from "meteor/session";
import { composeWithTracker } from "/lib/api/compose";
import { ReactionProduct } from "/lib/api";
import { Packages } from "/lib/collections";
import { Countries } from "/client/collections";
import { Reaction, i18next } from "/client/api";
import { TaxCodes } from "/imports/plugins/core/taxes/lib/collections";
import VariantForm from "../components/variantForm";
import { ProductVariant } from "/lib/collections/schemas/products";
import { Validation } from "@reactioncommerce/reaction-collections";

class VariantFormContainer extends Component {
  constructor(props) {
    super(props);

    this.validation = new Validation(ProductVariant);

    this.state = {
      variant: props.variant,
      validationStatus: this.validation.validationStatus,
      isDeleted: props.variant && props.variant.isDeleted
    };
  }

  componentDidMount() {
    this.runVariantValidation(this.state.variant);
  }

  componentWillReceiveProps(nextProps) {
    this.setState(() => ({
      variant: nextProps.variant
    }), () => {
      this.runVariantValidation(this.state.variant);
    });
  }

  runVariantValidation(variant) {
    if (variant) {
      const validationStatus = this.validation.validate(variant);

      this.setState(() => ({
        validationStatus,
        variant
      }));

      return validationStatus;
    }
  }

  isProviderEnabled = () => {
    const shopId = Reaction.getShopId();

    const provider = Packages.findOne({
      "shopId": shopId,
      "registry.provides": "taxCodes",
      "$where": function () {
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
      "shopId": shopId,
      "registry.provides": "taxCodes",
      "$where": function () {
        const providerName = _.filter(this.registry, (o) => o.provides === "taxCodes")[0].name.split("/")[2];
        return this.settings[providerName].enabled;
      }
    });
    const taxCodesArray = [];

    const codes = TaxCodes.find({
      shopId: shopId,
      taxCodeProvider: provider.name
    });

    codes.forEach(function (code) {
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
        Meteor.call("products/deleteVariant", id, function (error, result) {
          if (result && ReactionProduct.selectedVariantId() === id) {
            return ReactionProduct.setCurrentVariant(null);
          }
        });
      }
    });
  }

  cloneVariant =  (variant) => {
    const title = variant.title || i18next.t("productDetailEdit.thisVariant");
    const productId = ReactionProduct.selectedProductId();
    if (!productId) {
      return;
    }
    Meteor.call("products/cloneVariant", productId, variant._id,
      function (error, result) {
        if (error) {
          Alerts.alert({
            text: i18next.t("productDetailEdit.cloneVariantFail", { title }),
            confirmButtonText: i18next.t("app.close", { defaultValue: "Close" })
          });
        } else if (result) {
          const variantId = result[0];

          ReactionProduct.setCurrentVariant(variantId);
          Session.set("variant-form-" + variantId, true);
        }
      });
  }

  handleVariantFieldSave = (variantId, fieldName, value, variant) => {
    const validationStatus = this.runVariantValidation(variant);

    if (validationStatus.isFieldValid(fieldName)) {
      Meteor.call("products/updateProductField", variantId, fieldName, value, (error) => {
        if (error) {
          Alerts.toast(error.message, "error");
          this.forceUpdate();
        }
      });
    }
  }

  handleCardExpand = (cardName) => {
    Reaction.state.set("edit/focus", cardName);
  }

  updateQuantityIfChildVariants =  (variant) => {
    if (this.hasChildVariants(variant)) {
      const variantQuantity = ReactionProduct.getVariantQuantity(variant);
      return variantQuantity;
    }
  }

  render() {
    if (this.state.variant) {
      return (
        <VariantForm
          isProviderEnabled={this.isProviderEnabled}
          fetchTaxCodes={this.fetchTaxCodes}
          hasChildVariants={this.hasChildVariants}
          greyDisabledFields={this.greyDisabledFields}
          restoreVariant={this.restoreVariant}
          removeVariant={this.removeVariant}
          cloneVariant={this.cloneVariant}
          onVariantFieldSave={this.handleVariantFieldSave}
          onCardExpand={this.handleCardExpand}
          onUpdateQuantityField={this.updateQuantityIfChildVariants}
          validation={this.state.validationStatus}
          isDeleted={this.state.isDeleted}
          {...this.props}
          variant={this.state.variant}
        />
      );
    }

    return null;
  }
}

function composer(props, onData) {
  Meteor.subscribe("TaxCodes");

  const productHandle = Reaction.Router.getParam("handle");
  if (!productHandle) {
    Reaction.clearActionView();
  }

  const countries = Countries.find({}).fetch();
  const variant = ReactionProduct.selectedTopVariant();

  if (variant) {
    onData(null, {
      countries,
      variant: ReactionProduct.selectedTopVariant(),
      editFocus: Reaction.state.get("edit/focus")
    });
  } else {
    onData(null, { countries });
  }
}

VariantFormContainer.propTypes = {
  variant: PropTypes.object
};

export default composeWithTracker(composer)(VariantFormContainer);
