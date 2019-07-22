import { isEqual } from "lodash";
import React, { Component } from "react";
import PropTypes from "prop-types";
import Alert from "sweetalert2";
import { Components } from "@reactioncommerce/reaction-components";
import { i18next } from "/client/api";
import update from "immutability-helper";
import { highlightInput } from "/imports/plugins/core/ui/client/helpers/animations";
import withGenerateSitemaps from "/imports/plugins/included/sitemap-generator/client/hocs/withGenerateSitemaps";
import Card from "@material-ui/core/Card";
import CardHeader from "@material-ui/core/CardHeader";
import CardContent from "@material-ui/core/CardContent";
import withStyles from "@material-ui/core/styles/withStyles";
import { compose } from "recompose";

const styles = (theme) => ({
  card: {
    marginBottom: theme.spacing(2)
  }
});

const fieldNames = [
  "title",
  "handle",
  "subtitle",
  "vendor",
  "description",
  "origincountry",
  "facebookMsg",
  "twitterMsg",
  "pinterestMsg",
  "googleplusMsg"
];

const fieldGroups = {
  title: { group: "productDetails" },
  handle: { group: "productDetails" },
  pageTitle: { group: "productDetails" },
  vendor: { group: "productDetails" },
  description: { group: "productDetails" },
  facebookMsg: { group: "social" },
  twitterMsg: { group: "social" },
  pinterestMsg: { group: "social" },
  googleplusMsg: { group: "social" },
  hashtags: { group: "hashtags" },
  metafields: { group: "metafields" }
};

class ProductAdmin extends Component {
  constructor(props) {
    super(props);

    this.state = {
      expandedCard: this.fieldGroupForFieldName(props.editFocus),
      product: props.product,
      viewProps: props.viewProps
    };
  }

  UNSAFE_componentWillReceiveProps(nextProps) { // eslint-disable-line camelcase
    if (nextProps.product === undefined || this.props.product === undefined) {
      return;
    }
    const nextProduct = nextProps.product;
    const currentProduct = this.props.product;

    if (!isEqual(nextProduct, currentProduct)) {
      for (const fieldName of fieldNames) {
        if (nextProduct[fieldName] !== currentProduct[fieldName]) {
          this.animateFieldFlash(fieldName);
        }
      }
    }

    const cardGroupName = this.fieldGroupForFieldName(nextProps.editFocus);

    this.setState({
      expandedCard: cardGroupName,
      viewProps: nextProps.viewProps
    });

    this.setState({
      product: nextProps.product
    });
  }

  fieldGroupForFieldName(field) {
    // Other wise, if a field was passed
    // const fieldName = this.state.viewProps.field;

    let fieldName;

    // If the field is an array of field name
    if (Array.isArray(field) && field.length) {
      // Use the first field name
      [fieldName] = field;
    } else {
      fieldName = field;
    }

    const fieldData = fieldGroups[fieldName];

    if (fieldData && fieldData.group) {
      return fieldData.group;
    }

    return fieldName;
  }

  animateFieldFlash(fieldName) {
    const fieldRef = this.refs[`${fieldName}Input`];

    if (fieldRef) {
      const { input } = fieldRef.refs;
      highlightInput(input);
    }
  }

  handleDeleteProduct = () => {
    if (this.props.onDeleteProduct) {
      this.props.onDeleteProduct(this.props.product);
    }
  }

  handleRestoreProduct = () => {
    if (this.props.onRestoreProduct) {
      this.props.onRestoreProduct(this.props.product);
    }
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

  handleToggleVisibility = () => {
    if (this.props.onProductFieldSave) {
      this.props.onProductFieldSave(this.product._id, "isVisible", !this.product.isVisible);
    }
  }

  handleMetaChange = (event, metafield, index) => {
    if (this.props.onMetaChange) {
      if (index >= 0) {
        const { product } = this.state;
        product.metafields[index] = metafield;

        this.setState({
          product
        });
      } else {
        this.props.onMetaChange(metafield);
      }
    }
  }

  handleFieldBlur = (event, value, field) => {
    if (this.props.onProductFieldSave) {
      this.props.onProductFieldSave(this.product._id, field, value);
    }
  }

  handleMetaSave = (event, metafield, index) => {
    if (this.props.onMetaSave) {
      this.props.onMetaSave(this.product._id, metafield, index);
    }
  }

  handleMetaRemove = (event, metafield, index) => {
    if (this.props.onMetaRemove) {
      this.props.onMetaRemove(this.product._id, metafield, index);
    }
  }

  get product() {
    return this.state.product || this.props.product || {};
  }

  renderProductVisibilityLabel() {
    if (this.product.isVisible) {
      return (
        <Components.Translation defaultValue="Product is visible" i18nKey="productDetailEdit.productIsVisible" />
      );
    }

    return (
      <Components.Translation defaultValue="Product is not visible" i18nKey="productDetailEdit.productIsNotVisible" />
    );
  }

  isExpanded = (groupName) => this.state.expandedCard === groupName

  render() {
    const { classes } = this.props;

    return (
      <Card className={classes.card}>
        <CardHeader title={i18next.t("social.socialTitle")} />
        <CardContent>
          <Components.TextField
            i18nKeyLabel="productDetailEdit.facebookMsg"
            i18nKeyPlaceholder="productDetailEdit.facebookMsg"
            label="Facebook Message"
            multiline={true}
            name="facebookMsg"
            onBlur={this.handleFieldBlur}
            onChange={this.handleFieldChange}
            ref="facebookMsgInput"
            value={this.product.facebookMsg}
          />
          <Components.TextField
            i18nKeyLabel="productDetailEdit.twitterMsg"
            i18nKeyPlaceholder="productDetailEdit.twitterMsg"
            label="Twitter Message"
            multiline={true}
            name="twitterMsg"
            onBlur={this.handleFieldBlur}
            onChange={this.handleFieldChange}
            ref="twitterMsgInput"
            value={this.product.twitterMsg}
          />
          <Components.TextField
            i18nKeyLabel="productDetailEdit.pinterestMsg"
            i18nKeyPlaceholder="productDetailEdit.pinterestMsg"
            label="Pinterest Message"
            multiline={true}
            name="pinterestMsg"
            onBlur={this.handleFieldBlur}
            onChange={this.handleFieldChange}
            ref="pinterestMsgInput"
            value={this.product.pinterestMsg}
          />
          <Components.TextField
            i18nKeyLabel="productDetailEdit.googleplusMsg"
            i18nKeyPlaceholder="productDetailEdit.googleplusMsg"
            label="Google+ Message"
            multiline={true}
            name="googleplusMsg"
            onBlur={this.handleFieldBlur}
            onChange={this.handleFieldChange}
            ref="googleplusMsgInput"
            value={this.product.googleplusMsg}
          />
        </CardContent>
      </Card>
    );
  }
}

ProductAdmin.propTypes = {
  classes: PropTypes.object,
  countries: PropTypes.arrayOf(PropTypes.object),
  editFocus: PropTypes.oneOfType([PropTypes.string, PropTypes.arrayOf(PropTypes.string)]),
  editable: PropTypes.bool, // eslint-disable-line react/boolean-prop-naming
  generateSitemaps: PropTypes.func,
  handleFieldBlur: PropTypes.func,
  handleFieldChange: PropTypes.func,
  handleProductFieldChange: PropTypes.func,
  newMetafield: PropTypes.object,
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


export default compose(
  withGenerateSitemaps,
  withStyles(styles)
)(ProductAdmin);
