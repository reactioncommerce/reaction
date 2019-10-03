import React from "react";
import gql from "graphql-tag";
import PropTypes from "prop-types";
import { Meteor } from "meteor/meteor";
import { useMutation } from "@apollo/react-hooks";
import { Components, registerComponent } from "@reactioncommerce/reaction-components";
import Radio from "@material-ui/core/Radio";
import FormControlLabel from "@material-ui/core/FormControlLabel";
import Logger from "/client/modules/logger";
import { i18next } from "/client/api";
import getOpaqueIds from "/imports/plugins/core/core/client/util/getOpaqueIds";

const deleteMediaRecordMutation = gql`
  mutation DeleteMediaRecord($input: DeleteMediaRecordInput!) {
    deleteMediaRecord(input: $input) {
      mediaRecord {
        _id
      }
    }
  }
`;

/**
 * ShopBrandImageOption
 * @param {Object} props Component props
 * @returns {Node} React component
 */
function ShopBrandImageOption(props) {
  const {
    afterSetBrandImage,
    isSelected,
    media
  } = props;

  const [deleteMediaRecord] = useMutation(deleteMediaRecordMutation, { ignoreResults: true });

  const handleClick = () => {
    if (isSelected) return;

    const asset = { mediaId: media._id, type: "navbarBrandImage" };

    Meteor.call("shop/updateBrandAssets", asset, (error, result) => {
      if (error || result !== 1) {
        return Alerts.toast(i18next.t("shopSettings.shopBrandAssetsFailed"), "error");
      }

      if (afterSetBrandImage) afterSetBrandImage();

      return Alerts.toast(i18next.t("shopSettings.shopBrandAssetsSaved"), "success");
    });
  };

  const handleRemoveMedia = (mediaToRemove) => {
    const imageUrl = mediaToRemove.url({ store: "medium" });
    const mediaRecordId = mediaToRemove._id;

    Alerts.alert({
      confirmButtonText: "Remove",
      imageHeight: 150,
      imageUrl,
      showCancelButton: true,
      title: "Remove this brand image?",
      type: "warning"
    }, async (isConfirm) => {
      if (isConfirm) {
        const [
          opaqueMediaRecordId,
          opaqueShopId
        ] = await getOpaqueIds([
          { namespace: "MediaRecord", id: mediaRecordId },
          { namespace: "Shop", id: mediaToRemove.metadata.shopId }
        ]);

        deleteMediaRecord({
          variables: {
            input: {
              mediaRecordId: opaqueMediaRecordId,
              shopId: opaqueShopId
            }
          },
          onError(error) {
            Logger.error(error);
            Alerts.toast("Unable to remove media", "error", {
              autoHide: 10000
            });
          }
        });
      }
    });
  };

  return (
    <div>
      <Components.MediaItem
        editable
        onClick={handleClick}
        onRemoveMedia={handleRemoveMedia}
        size="small"
        source={media}
      />

      <FormControlLabel
        control={
          <Radio
            checked={isSelected}
            onClick={handleClick}
          />
        }
        label="Use as shop logo"
      />
    </div>
  );
}

ShopBrandImageOption.propTypes = {
  afterSetBrandImage: PropTypes.func,
  isSelected: PropTypes.bool,
  media: PropTypes.object.isRequired
};

registerComponent("ShopBrandImageOption", ShopBrandImageOption);

export default ShopBrandImageOption;
