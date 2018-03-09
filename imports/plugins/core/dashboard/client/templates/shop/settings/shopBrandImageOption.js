import React, { Component } from "react";
import PropTypes from "prop-types";
import { Meteor } from "meteor/meteor";
import { Components, registerComponent } from "@reactioncommerce/reaction-components";
import { Media } from "/imports/plugins/core/files/client";
import { i18next, Logger } from "/client/api";

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

      Alerts.toast(i18next.t("shopSettings.shopBrandAssetsSaved"), "success");
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
    const { media } = this.props;

    return (
      <Components.MediaItem
        editable
        onClick={this.handleClick}
        onRemoveMedia={this.handleRemoveClick}
        size="small"
        source={media}
      />
    );
  }
}

registerComponent("ShopBrandImageOption", ShopBrandImageOption);

export default ShopBrandImageOption;
