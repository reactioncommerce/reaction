import React, { Component } from "react";
import PropTypes from "prop-types";
import { Meteor } from "meteor/meteor";
import Alert from "sweetalert2";
import { i18next } from "/client/api";
import update from "immutability-helper";
import withGenerateSitemaps from "/imports/plugins/included/sitemap-generator/client/hocs/withGenerateSitemaps";
import { compose } from "recompose";

const wrapComponent = (Comp) => {
  class withProductForm extends Component {
    constructor(props) {
      super(props);

      this.state = {
        product: props.product,
        newMetafield: { key: "", value: "" }
      };
    }

    UNSAFE_componentWillReceiveProps(nextProps) { // eslint-disable-line camelcase
      if (nextProps.product === undefined || this.props.product === undefined) {
        return;
      }


      this.setState({
        product: nextProps.product
      });
    }

    handleFieldChange = (event, value, field) => {
      const newState = update(this.state, {
        product: {
          $merge: {
            [field]: value
          }
        }
      });

      this.setState(newState, () => {
        if (this.props.onFieldChange) {
          this.props.onFieldChange(field, value);
        }
      });
    }

    handleSelectChange = (value, field) => {
      if (this.props.onProductFieldSave) {
        this.props.onProductFieldSave(this.product._id, field, value);
      }
    }

    handleSitemapCheckboxChange = (event) => {
      const { checked: isChecked } = event.target;
      const { shouldAppearInSitemap } = this.product;
      if (typeof shouldAppearInSitemap === "undefined" || isChecked === shouldAppearInSitemap) {
        // onChange for checkbox runs when field is first displayed
        return;
      }

      if (this.props.onProductFieldSave) {
        this.props.onProductFieldSave(this.product._id, "shouldAppearInSitemap", isChecked);
      }

      const { isVisible, isDeleted } = this.product;
      if (isVisible && !isDeleted) {
        // If product is published, ask whether to regenerate sitemap
        Alert({
          title: i18next.t("productDetailEdit.refreshSitemap", { defaultValue: "Refresh sitemap now?" }),
          type: "warning",
          showCancelButton: true,
          cancelButtonText: i18next.t("productDetailEdit.refreshSitemapNo", { defaultValue: "No, don't refresh" }),
          confirmButtonText: i18next.t("productDetailEdit.refreshSitemapYes", { defaultValue: "Yes, refresh" })
        })
          .then(({ value }) => {
            if (value) {
              this.props.generateSitemaps();
              Alerts.toast(i18next.t("shopSettings.sitemapRefreshInitiated", {
                defaultValue: "Refreshing the sitemap can take up to 5 minutes. You will be notified when it is completed."
              }), "success");
            }
            return false;
          })
          .catch(() => false);
      }
    };

    handleFieldBlur = (event, value, field) => {
      if (this.props.onProductFieldSave) {
        this.props.onProductFieldSave(this.product._id, field, value);
      }
    }

    handleMetaChange = (event, metafield, index) => {
      if (index >= 0) {
        const { product } = this.state;
        product.metafields[index] = metafield;

        this.setState({
          product
        });
      } else {
        this.setState({
          newMetafield: metafield
        });
      }
    }

    handleMetaSave = (event, metafield, index) => {
      // update existing metafield
      if (index >= 0) {
        Meteor.call("products/updateMetaFields", this.product._id, metafield, index);
      } else if (metafield.key && metafield.value) {
        Meteor.call("products/updateMetaFields", this.product._id, metafield);
      }

      this.setState({
        newMetafield: {
          key: "",
          value: ""
        }
      });
    }

    handleMetaRemove = (event, metafield) => {
      Meteor.call("products/removeMetaFields", this.product._id, metafield);
    }

    get product() {
      return this.state.product || this.props.product || {};
    }

    render() {
      return (
        <Comp
          {...this.props}
          newMetafield={this.state.newMetafield}
          onProductMetaSave={this.handleMetaSave}
          onProductMetaChange={this.handleMetaChange}
          onProductMetaRemove={this.handleMetaRemove}
          onProductFieldBlur={this.handleFieldBlur}
          onProductFieldChange={this.handleProductFieldChange}
          onSitemapCheckboxChange={this.handleSitemapCheckboxChange}
          onSelectChange={this.handleSelectChange}
          product={this.product}
        />
      );
    }
  }

  withProductForm.propTypes = {
    classes: PropTypes.object,
    countries: PropTypes.arrayOf(PropTypes.object),
    editFocus: PropTypes.oneOfType([PropTypes.string, PropTypes.arrayOf(PropTypes.string)]),
    editable: PropTypes.bool, // eslint-disable-line react/boolean-prop-naming
    generateSitemaps: PropTypes.func,
    handleFieldBlur: PropTypes.func,
    handleFieldChange: PropTypes.func,
    handleProductFieldChange: PropTypes.func,
    newMetafield: PropTypes.shape({
      key: PropTypes.string.isRequired,
      value: PropTypes.string.isRequired
    }),
    onCardExpand: PropTypes.func,
    onDeleteProduct: PropTypes.func,
    onFieldChange: PropTypes.func,
    onMetaChange: PropTypes.func,
    onMetaRemove: PropTypes.func,
    onMetaSave: PropTypes.func,
    onProductFieldSave: PropTypes.func,
    onRestoreProduct: PropTypes.func,
    product: PropTypes.object,
    templates: PropTypes.arrayOf(PropTypes.shape({
      label: PropTypes.string,
      value: PropTypes.any
    })),
    viewProps: PropTypes.object
  };

  return withProductForm;
};

export default compose(
  withGenerateSitemaps,
  wrapComponent
);
