import React, { Component } from "react";
import PropTypes from "prop-types";
import { Meteor } from "meteor/meteor";
import { Components, registerComponent } from "@reactioncommerce/reaction-components";
import { Media } from "/imports/plugins/core/files/client";
import { i18next, Logger } from "/client/api";
import Radio from "@material-ui/core/Radio";
import FormControlLabel from "@material-ui/core/FormControlLabel";

class ShopBrandImageOption extends Component {
  static propTypes = {
    isSelected: PropTypes.bool,
    media: PropTypes.object.isRequired
  };

  handleClick = () => {
    const { isSelected, media } = this.props;

    if (isSelected) return;

    const asset = { mediaId: media._id, type: "navbarBrandImage" };

    Meteor.call("shop/updateBrandAssets", asset, (error, result) => {
      if (error || result !== 1) {
        return Alerts.toast(i18next.t("shopSettings.shopBrandAssetsFailed"), "error");
      }

      return Alerts.toast(i18next.t("shopSettings.shopBrandAssetsSaved"), "success");
    });
  };

  handleRemoveClick = () => {
    const { media } = this.props;

    Alerts.alert({
      title: "Remove this brand image?",
      type: "warning",
      showCancelButton: true,
      confirmButtonText: "Remove"
    }, (shouldRemove) => {
      if (shouldRemove) Media.remove(media._id).catch((error) => { Logger.error(error); });
    });
  };

  render() {
    const { isSelected, media } = this.props;

    return (
      <div>
        <Components.MediaItem
          editable
          onClick={this.handleClick}
          onRemoveMedia={this.handleRemoveClick}
          size="small"
          source={media}
        />

        <FormControlLabel
          control={
            <Radio
              checked={isSelected}
              onClick={this.handleClick}
            />
          }
          label="Use as shop logo"
        />
      </div>

    );
  }
}

registerComponent("ShopBrandImageOption", ShopBrandImageOption);

export default ShopBrandImageOption;
