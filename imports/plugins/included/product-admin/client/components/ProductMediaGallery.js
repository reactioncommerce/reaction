import React from "react";
import PropTypes from "prop-types";
import { i18next } from "/client/api";
import { Components } from "@reactioncommerce/reaction-components";
import Table from "@material-ui/core/Table";
import TableHead from "@material-ui/core/TableHead";
import TableBody from "@material-ui/core/TableBody";
import TableCell from "@material-ui/core/TableCell";
import TableRow from "@material-ui/core/TableRow";
import withProductMedia from "../hocs/withProductMedia";
import ProductMediaItem from "./ProductMediaItem";

/**
 * ProductMediaGallery
 * @param {Object} props Component props
 * @returns {Node} React component
 */
function ProductMediaGallery(props) {
  const {
    editable,
    media,
    onRemoveMedia,
    onSetMediaPriority,
    productId,
    shopId,
    variantId
  } = props;

  if (editable) {
    let count = (Array.isArray(media) && media.length) || 0;
    const hasMedia = count > 0;

    const getFileMetadata = () => {
      count += 1;
      return {
        productId,
        variantId,
        shopId,
        priority: count,
        toGrid: 1 // we need number
      };
    };

    const onUploadError = (error) => {
      Alerts.toast(error.reason || error.message, "error");
    };

    return (
      <div className="rui media-gallery">
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>{i18next.t("admin.productTable.header.order")}</TableCell>
              <TableCell>{"Media"}</TableCell>
              <TableCell />
            </TableRow>
          </TableHead>
          <TableBody>
            {!!hasMedia && (
              (media || []).map((mediaItem) => (
                <ProductMediaItem
                  editable={editable}
                  key={mediaItem._id}
                  onSetMediaPriority={onSetMediaPriority}
                  onRemoveMedia={onRemoveMedia}
                  size="small"
                  source={mediaItem}
                />
              ))
            )}
            <TableRow>
              <TableCell colSpan={3}>
                <Components.MediaUploader
                  canUploadMultiple
                  metadata={getFileMetadata}
                  onError={onUploadError}
                />
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </div>
    );
  }

  return (
    <Table>
      <TableHead>
        <TableRow>
          <TableCell>{i18next.t("admin.productTable.header.order")}</TableCell>
          <TableCell>{"Media"}</TableCell>
          <TableCell />
        </TableRow>
      </TableHead>
      <TableBody>
        {this.renderRows()}
      </TableBody>
    </Table>
  );
}

ProductMediaGallery.propTypes = {
  editable: PropTypes.bool, // eslint-disable-line react/boolean-prop-naming
  media: PropTypes.arrayOf(PropTypes.object),
  onRemoveMedia: PropTypes.func,
  onSetMediaPriority: PropTypes.func,
  productId: PropTypes.string,
  shopId: PropTypes.string,
  variantId: PropTypes.string
};

ProductMediaGallery.defaultProps = {
  onRemoveMedia() {}
};


export default withProductMedia(ProductMediaGallery);
