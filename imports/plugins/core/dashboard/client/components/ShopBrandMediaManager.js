import React from "react";
import PropTypes from "prop-types";
import { Components, composeWithTracker, registerComponent } from "@reactioncommerce/reaction-components";
import { Media } from "/imports/plugins/core/files/client";

/**
 * ShopBrandMediaManager
 * @param {Object} props Component props
 * @returns {Node} React component
 */
function ShopBrandMediaManager(props) {
  const { afterSetBrandImage, brandMedia, shop } = props;

  if (!shop) return null;

  const selectedMediaId = shop.brandAssets && shop.brandAssets.navbarBrandImageId;
  const metadata = { type: "brandAsset" };

  return (
    <div>
      <div className="rui gallery-thumbnails">
        {(brandMedia || []).map((media) => (
          <Components.ShopBrandImageOption
            afterSetBrandImage={afterSetBrandImage}
            key={media._id}
            isSelected={selectedMediaId === media._id}
            media={media}
          />
        ))}
      </div>
      <Components.MediaUploader canUploadMultiple metadata={metadata} shopId={shop._id} />
    </div>
  );
}

ShopBrandMediaManager.propTypes = {
  afterSetBrandImage: PropTypes.func,
  brandMedia: PropTypes.arrayOf(PropTypes.shape({
    _id: PropTypes.string.isRequired
  })),
  shop: PropTypes.shape({
    _id: PropTypes.string,
    brandAssets: PropTypes.shape({
      navbarBrandImageId: PropTypes.string
    })
  })
};

const composer = (props, onData) => {
  const { shop } = props;

  if (!shop) return;

  const brandMedia = Media.findLocal({
    "metadata.shopId": shop.internalId,
    "metadata.type": "brandAsset"
  });

  onData(null, { brandMedia });
};

registerComponent("ShopBrandMediaManager", ShopBrandMediaManager, composeWithTracker(composer));

export default composeWithTracker(composer)(ShopBrandMediaManager);
