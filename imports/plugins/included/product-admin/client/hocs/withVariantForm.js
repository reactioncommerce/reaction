import React, { Component } from "react";
import PropTypes from "prop-types";
import gql from "graphql-tag";
import _ from "lodash";
import { withApollo } from "react-apollo";
import { compose } from "recompose";
import { composeWithTracker } from "@reactioncommerce/reaction-components";
import ReactionError from "@reactioncommerce/reaction-error";
import { Meteor } from "meteor/meteor";
import { withRouter } from "react-router";
import { Validation } from "@reactioncommerce/schemas";
import { ReactionProduct } from "/lib/api";
import { Reaction, i18next } from "/client/api";
import Logger from "/client/modules/logger";
import { ProductVariant } from "/lib/collections/schemas";
import getOpaqueIds from "/imports/plugins/core/core/client/util/getOpaqueIds";
import withTaxCodes from "/imports/plugins/core/taxes/client/hoc/withTaxCodes";

const archiveProductVariants = gql`
  mutation archiveProductVariants($input: ArchiveProductVariantsInput!) {
    archiveProductVariants(input: $input) {
      variants {
        _id
      }
    }
  }
`;

const cloneProductVariants = gql`
  mutation cloneProductVariants($input: CloneProductVariantsInput!) {
    cloneProductVariants(input: $input) {
      variants {
        _id
      }
    }
  }
`;

const wrapComponent = (Comp) => (
  class VariantFormContainer extends Component {
    static propTypes = {
      client: PropTypes.object,
      history: PropTypes.object,
      variant: PropTypes.object
    }

    constructor(props) {
      super(props);

      this.validation = new Validation(ProductVariant);

      this.state = {
        isDeleted: props.variant && props.variant.isDeleted,
        validationStatus: this.validation.validationStatus,
        variant: props.variant
      };
    }

    componentDidMount() {
      this.runVariantValidation(this.props.variant);
    }

    UNSAFE_componentWillReceiveProps(nextProps) { // eslint-disable-line camelcase
      const nextVariant = nextProps.variant || {};
      const currentVariant = this.props.variant || {};

      if (!nextProps.variant) {
        return;
      }

      if (typeof nextProps.variant.isVisible === "boolean") {
        return;
      }

      if (_.isEqual(nextVariant, currentVariant) === false) {
        this.setState({
          inventoryManagement: nextProps.variant && nextProps.variant.inventoryManagement,
          inventoryPolicy: nextProps.variant && nextProps.variant.inventoryPolicy,
          isTaxable: nextProps.variant && nextProps.variant.isTaxable,
          variant: nextProps.variant
        });
      }

      this.setState({
        isDeleted: nextProps.variant && nextProps.variant.isDeleted
      });
    }

    get variant() {
      return this.state.variant || this.props.variant || null;
    }

    runVariantValidation(variant) {
      if (variant) {
        const validationStatus = this.validation.validate(variant);

        this.setState(() => ({
          validationStatus
        }));

        return validationStatus;
      }

      return null;
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

      return null;
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

    removeVariant = async (variant, redirectUrl) => {
      const { client } = this.props;
      const opaqueVariantId = await getOpaqueIds([{ namespace: "Product", id: variant._id }]);
      const [opaqueShopId] = await getOpaqueIds([{ namespace: "Shop", id: Reaction.getShopId() }]);

      try {
        await client.mutate({
          mutation: archiveProductVariants,
          variables: {
            input: {
              shopId: opaqueShopId,
              variantIds: opaqueVariantId
            }
          }
        });

        Alerts.toast(i18next.t("productDetailEdit.archiveProductVariantsSuccess"), "success");
        redirectUrl && this.props.history.replace(redirectUrl);
      } catch (error) {
        Alerts.toast(i18next.t("productDetailEdit.archiveProductVariantsFail", { err: error }), "error");
        throw new ReactionError("server-error", "Unable to archive product");
      }
    }

    cloneVariant = async (productId, variantId) => {
      const { client, shopId } = this.props;
      const title = i18next.t("productDetailEdit.thisVariant");
      const [opaqueVariantId] = await getOpaqueIds([{ namespace: "Product", id: variantId }]);

      try {
        await client.mutate({
          mutation: cloneProductVariants,
          variables: {
            input: {
              shopId,
              variantIds: [opaqueVariantId]
            }
          }
        });
      } catch (error) {
        Alerts.toast(i18next.t("productDetailEdit.cloneVariantFail", { title }), "error");
      }
    }

    handleVariantFieldSave = (variantId, fieldName, value, variant) => {
      const validationStatus = this.runVariantValidation(variant);
      if (!validationStatus) return;

      // validationStatus has a `isFieldValid` method, but it incorrectly returns
      // `false` when the field doesn't exist, such as when you clear an optional field
      // and save it.
      const fieldIsValid = !validationStatus.fields[fieldName] || validationStatus.fields[fieldName].isValid;
      if (!fieldIsValid) {
        Logger.error(`${fieldName} field is invalid`);
        return;
      }

      Meteor.call("products/updateProductField", variantId, fieldName, value, (error) => {
        if (error) {
          Alerts.toast(error.message, "error");
        }

        if (fieldName === "inventoryPolicy") {
          this.updateInventoryPolicyIfChildVariants(variant);
        }

        if (fieldName === "lowInventoryWarningThreshold") {
          this.updateLowInventoryThresholdIfChildVariants(variant);
        }
      });
    }

    handleCardExpand = (cardName) => {
      Reaction.state.set("edit/focus", cardName);
    }

    handleVariantVisibilityToggle = (variant) => {
      Meteor.call("products/updateProductField", variant._id, "isVisible", !variant.isVisible);
    }

    handleFieldChange = (event, value, field) => {
      this.setState(({ variant }) => ({
        variant: {
          ...variant,
          [field]: value
        }
      }));
    }

    handleFieldBlur = (event, value, field) => {
      this.handleVariantFieldSave(this.variant._id, field, value, this.state.variant);
    }

    handleSelectChange = (value, field) => {
      this.setState(({ variant }) => ({
        variant: {
          ...variant,
          [field]: value
        }
      }), () => {
        this.handleVariantFieldSave(this.variant._id, field, value, this.state.variant);
      });
    }

    handleCheckboxChange = (event, value, field) => {
      this.setState(({ variant }) => ({
        variant: {
          ...variant,
          [field]: value
        }
      }), () => {
        this.handleVariantFieldSave(this.variant._id, field, value, this.state.variant);
      });
    }

    handleInventoryPolicyChange = (event, value, field) => {
      /*
      Due to some confusing verbiage on how inventoryPolicy works / is displayed, we need to handle this field
      differently than we handle the other checkboxes in this component. Specifically, we display the opposite value of
      what the actual field value is. Because this is a checkbox, that means that the opposite value is actually the
      field value as well, not just a display value, so we need to reverse the boolean value when it gets passed into
      this function before we send it to the server to update the data. Other than reversing the value, this function
      is the same as `handleCheckboxChange`.
      */

      const inverseValue = !value;

      this.setState(({ variant }) => ({
        inventoryPolicy: inverseValue,
        variant: {
          ...variant,
          [field]: inverseValue
        }
      }));

      this.handleFieldBlur(event, inverseValue, field);
    }

    /**
     * @summary update parent inventory policy if variant has children
     * @param {Object} variant product or variant document
     * @returns {undefined} return nothing
     * @private
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

      return null;
    }

    updateLowInventoryThresholdIfChildVariants = (variant) => {
      // Check to see if this variant has options attached to it
      const variantOptions = ReactionProduct.getVariants(variant._id);

      if (variantOptions && variantOptions.length !== 0) {
        variantOptions.forEach((option) =>
          Meteor.call("products/updateProductField", option._id, "lowInventoryWarningThreshold", variant.lowInventoryWarningThreshold, (error) => {
            if (error) {
              Alerts.toast(error.message, "error");
            }
          }));
      }
    }

    render() {
      if (this.variant) {
        return (
          <Comp
            {...this.props}
            inventoryManagement={this.state.inventoryManagement}
            inventoryPolicy={this.state.inventoryPolicy}
            hasChildVariants={this.hasChildVariants}
            greyDisabledFields={this.greyDisabledFields}
            restoreVariant={this.restoreVariant}
            removeVariant={this.removeVariant}
            cloneVariant={this.cloneVariant}
            onVariantFieldSave={this.handleVariantFieldSave}
            onVisibilityButtonClick={this.handleVariantVisibilityToggle}
            onCardExpand={this.handleCardExpand}
            validation={this.state.validationStatus}
            isDeleted={this.state.isDeleted}
            onVariantFieldChange={this.handleFieldChange}
            onVariantFieldBlur={this.handleFieldBlur}
            onVariantCheckboxChange={this.handleCheckboxChange}
            onVariantSelectChange={this.handleSelectChange}
            variant={this.variant}
          />
        );
      }

      return null;
    }
  }
);

const composer = async (props, onData) => {
  const [shopId] = await getOpaqueIds([{ namespace: "Shop", id: Reaction.getShopId() }]);

  onData(null, {
    shopId
  });
};

export default compose(
  withApollo,
  withRouter,
  composeWithTracker(composer),
  withTaxCodes,
  wrapComponent
);
