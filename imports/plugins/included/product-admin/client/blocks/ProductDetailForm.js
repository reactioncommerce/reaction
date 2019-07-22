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

class DetailForm extends Component {
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

  handleFieldBlur = (event, value, field) => {
    if (this.props.onProductFieldSave) {
      this.props.onProductFieldSave(this.product._id, field, value);
    }
  }

  get product() {
    return this.state.product || this.props.product || {};
  }

  render() {
    const { classes } = this.props;

    return (
      <Card className={classes.card}>
        <CardHeader title={i18next.t("admin.productAdmin.details")} />
        <CardContent>
          <Components.TextField
            i18nKeyLabel="productDetailEdit.title"
            i18nKeyPlaceholder="productDetailEdit.title"
            label="Title"
            name="title"
            onBlur={this.handleFieldBlur}
            onChange={this.handleFieldChange}
            onReturnKeyDown={this.handleFieldBlur}
            placeholder="Title"
            ref="titleInput"
            value={this.product.title}
          />
          <Components.TextField
            i18nKeyLabel="productDetailEdit.permalink"
            i18nKeyPlaceholder="productDetailEdit.permalink"
            label="Permalink"
            name="handle"
            onBlur={this.handleFieldBlur}
            onChange={this.handleFieldChange}
            onReturnKeyDown={this.handleFieldBlur}
            placeholder="Permalink"
            ref="handleInput"
            value={this.product.handle}
          />
          <Components.TextField
            i18nKeyLabel="productDetailEdit.pageTitle"
            i18nKeyPlaceholder="productDetailEdit.pageTitle"
            label="Subtitle"
            name="pageTitle"
            onBlur={this.handleFieldBlur}
            onChange={this.handleFieldChange}
            onReturnKeyDown={this.handleFieldBlur}
            placeholder="Subtitle"
            ref="subtitleInput"
            value={this.product.pageTitle}
          />
          <Components.TextField
            i18nKeyLabel="productDetailEdit.vendor"
            i18nKeyPlaceholder="productDetailEdit.vendor"
            label="Vendor"
            name="vendor"
            onBlur={this.handleFieldBlur}
            onChange={this.handleFieldChange}
            onReturnKeyDown={this.handleFieldBlur}
            placeholder="Vendor"
            ref="vendorInput"
            value={this.product.vendor}
          />
          <Components.TextField
            i18nKeyLabel="productDetailEdit.description"
            i18nKeyPlaceholder="productDetailEdit.description"
            label="Description"
            multiline={true}
            name="description"
            onBlur={this.handleFieldBlur}
            onChange={this.handleFieldChange}
            placeholder="Description"
            ref="descriptionInput"
            value={this.product.description}
          />
          <Components.Select
            clearable={false}
            i18nKeyLabel="productDetailEdit.originCountry"
            i18nKeyPlaceholder="productDetailEdit.originCountry"
            label="Origin Country"
            name="originCountry"
            onChange={this.handleSelectChange}
            placeholder="Select a Country"
            ref="countryOfOriginInput"
            value={this.product.originCountry}
            options={this.props.countries}
          />
          <Components.TextField
            i18nKeyLabel="productDetailEdit.template"
            i18nKeyPlaceholder="productDetailEdit.templateSelectPlaceholder"
            label="Template"
            name="template"
            onBlur={this.handleFieldBlur}
            onChange={this.handleFieldChange}
            ref="templateInput"
            value={this.product.template}
          />
          {this.product && (
            <div className="checkbox">
              <Components.Checkbox
                i18nKeyLabel="productDetailEdit.shouldAppearInSitemap"
                label="Include in sitemap?"
                name="shouldAppearInSitemap"
                onChange={this.handleSitemapCheckboxChange}
                checked={this.product.shouldAppearInSitemap}
              />
            </div>
          )}
        </CardContent>
      </Card>
    );
  }
}

DetailForm.propTypes = {
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
)(DetailForm);
