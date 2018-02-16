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

  handleClick = (event) => {
    event.preventDefault();
    event.stopPropagation();

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

  handleKeyPress = (event) => {
    if (event.keyCode === 13) this.handleClick(event);
  };

  handleRemoveClick = (event) => {
    event.preventDefault();
    event.stopPropagation();

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
      <div
        className="rui media-gallery"
        onClick={this.handleClick}
        onKeyPress={this.handleKeyPress}
        role="button"
        tabIndex={0}
      >
        <img alt="" className="img-responsive" src={media.url({ store: "thumbnail" })} />
        <div className="rui badge-container">
          <Components.IconButton
            icon="fa fa-times"
            onClick={this.handleRemoveClick}
            i18nKeyTooltip="admin.mediaGallery.deleteImage"
            tooltip="Click to remove image"
          />
        </div>
      </div>
    );
  }
}

registerComponent("ShopBrandImageOption", ShopBrandImageOption);

export default ShopBrandImageOption;
