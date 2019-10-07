import React, { Component } from "react";
import PropTypes from "prop-types";
import gql from "graphql-tag";
import _ from "lodash";
import { withApollo } from "react-apollo";
import { compose } from "recompose";
import { composeWithTracker } from "@reactioncommerce/reaction-components";
import { Meteor } from "meteor/meteor";
import { withRouter } from "react-router";
import { Validation } from "@reactioncommerce/schemas";
import { ReactionProduct } from "/lib/api";
import { Reaction, i18next } from "/client/api";
import Logger from "/client/modules/logger";
import { ProductVariant } from "/lib/collections/schemas";
import getOpaqueIds from "/imports/plugins/core/core/client/util/getOpaqueIds";
import withTaxCodes from "/imports/plugins/core/taxes/client/hoc/withTaxCodes";

const cloneProductVariants = gql`
  mutation cloneProductVariants($input: CloneProductVariantsInput!) {
    cloneProductVariants(input: $input) {
      variants {
        _id
      }
    }
  }
`;

const updateProductField = gql`
  mutation updateProductField($input: UpdateProductFieldInput!) {
    updateProductField(input: $input) {
      product {
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
      }, async (isConfirm) => {
        if (isConfirm) {
          const { client } = this.props;
          const [opaqueProductId, opaqueShopId] = await getOpaqueIds([
            { namespace: "Product", id: variant._id },
            { namespace: "Shop", id: Reaction.getShopId() }
          ]);

          try {
            await client.mutate({
              mutation: updateProductField,
              variables: {
                input: {
                  field: "isDeleted",
                  shopId: opaqueShopId,
                  productId: opaqueProductId,
                  value: !variant.isVisible
                }
              }
            });

            Alerts.toast(i18next.t("productDetailEdit.restoreVariantSuccess"), "success");

            this.setState({
              isDeleted: !this.state.isDeleted
            });
          } catch (error) {
            Alerts.alert({
              text: i18next.t("productDetailEdit.restoreVariantFail", { title }),
              confirmButtonText: i18next.t("app.close", { defaultValue: "Close" })
            });
          }
        }
      });
    }

    removeVariant = (variant, redirectUrl) => {
      const id = variant._id;
      Meteor.call("products/deleteVariant", id, (error, result) => {
        if (result && ReactionProduct.selectedVariantId() === id) {
          redirectUrl && this.props.history.replace(redirectUrl);
        }
      });
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

    handleVariantFieldSave = async (variant, fieldName, value, variantState) => {
      const validationStatus = this.runVariantValidation(variantState);
      if (!validationStatus) return;

      // validationStatus has a `isFieldValid` method, but it incorrectly returns
      // `false` when the field doesn't exist, such as when you clear an optional field
      // and save it.
      const fieldIsValid = !validationStatus.fields[fieldName] || validationStatus.fields[fieldName].isValid;
      if (!fieldIsValid) {
        Logger.error(`${fieldName} field is invalid`);
        return;
      }

      // Check to see if field has been updated.
      // `onProductFieldSave` runs onChange AND onBlur,
      // so there isn't always an update to a value when run with `onBlur`,
      // and this mutation might not need to run
      if (variant[fieldName] !== value) {
        const { client } = this.props;
        const [opaqueProductId, opaqueShopId] = await getOpaqueIds([
          { namespace: "Product", id: variant._id },
          { namespace: "Shop", id: Reaction.getShopId() }
        ]);

        try {
          await client.mutate({
            mutation: updateProductField,
            variables: {
              input: {
                field: fieldName,
                shopId: opaqueShopId,
                productId: opaqueProductId,
                value
              }
            }
          });

          Alerts.toast(i18next.t("productDetailEdit.updateProductFieldSuccess"), "success");
        } catch (error) {
          Alerts.toast(i18next.t("productDetailEdit.updateProductFieldFail", { err: error }), "error");
        }
      }
    }

    handleCardExpand = (cardName) => {
      Reaction.state.set("edit/focus", cardName);
    }

    handleVariantVisibilityToggle = async (variant) => {
      const { client } = this.props;
      const [opaqueProductId, opaqueShopId] = await getOpaqueIds([
        { namespace: "Product", id: variant._id },
        { namespace: "Shop", id: Reaction.getShopId() }
      ]);

      try {
        await client.mutate({
          mutation: updateProductField,
          variables: {
            input: {
              field: "isVisible",
              shopId: opaqueShopId,
              productId: opaqueProductId,
              value: !variant.isVisible
            }
          }
        });

        Alerts.toast(i18next.t("productDetailEdit.updateProductFieldSuccess"), "success");
      } catch (error) {
        Alerts.toast(i18next.t("productDetailEdit.updateProductFieldFail", { err: error }), "error");
      }
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
      this.handleVariantFieldSave(this.props.variant, field, value, this.state.variant);
    }

    handleSelectChange = (value, field) => {
      this.setState(({ variant }) => ({
        variant: {
          ...variant,
          [field]: value
        }
      }), () => {
        this.handleVariantFieldSave(this.props.variant, field, value, this.state.variant);
      });
    }

    handleCheckboxChange = (event, value, field) => {
      this.setState(({ variant }) => ({
        variant: {
          ...variant,
          [field]: value
        }
      }), () => {
        this.handleVariantFieldSave(this.props.variant, field, value, this.state.variant);
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
