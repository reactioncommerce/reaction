import React, { Component } from "react";
import PropTypes from "prop-types";
import _, { omit } from "lodash";
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


class VariantFormContainer extends Component {
  constructor(props) {
    super(props);

    this.state = {
      variant: props.variant,
      validationMessages: {},
      isDeleted: props.variant.isDeleted
    };

    this.validation = new Validation(ProductVariant);
  }

  componentDidMount() {
    this.validationContext = ProductVariant.namedContext("variantForm");
  }

  componentWillReceiveProps(nextProps) {
    this.setState(() => ({
      variant: nextProps.variant
    }));
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

    const { isValid, validationMessages } = this.validation.validate(variant);

    if (isValid === false) {
      this.setState(() => {
        return {
          validationMessages,
          variant
        };
      });
    }

    /**
    Meteor.call("products/updateProductField", variantId, fieldName, value, (error) => {
      if (error) {
        Alerts.toast(error.message, "error");
        this.forceUpdate();
      }
    });**/
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
        validationMessages={this.state.validationMessages}
        isDeleted={this.state.isDeleted}
        {...this.props}
        variant={this.state.variant}
      />
    );
  }
}

class Validation {
  constructor(schema, options) {
    this.validationContext = schema.namedContext();
    this.options = options;
  }

  validate(objectToValidate) {
    const isValid = this.validationContext.validate(ProductVariant.clean(objectToValidate));
    const validationMessages = {};

    this.validationContext._invalidKeys
      .forEach((validationError) => {
        validationMessages[validationError.name] = {
          ...validationError,
          message: this.validationContext.keyErrorMessage(validationError.name)
        };
      });

    return {
      isValid,
      validationMessages
    };
  }
}

function composer(props, onData) {
  Meteor.subscribe("TaxCodes");

  const countries = Countries.find({}).fetch();
  const productHandle = Reaction.Router.getParam("handle");

  if (!productHandle) {
    Reaction.clearActionView();
  }

  onData(null, {
    countries,
    variant: ReactionProduct.selectedTopVariant() || {},
    editFocus: Reaction.state.get("edit/focus")
  });
}

VariantFormContainer.propTypes = {
  variant: PropTypes.object
};

export default composeWithTracker(composer)(VariantFormContainer);
