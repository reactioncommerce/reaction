import React, { useEffect, useState } from "react";
import gql from "graphql-tag";
import PropTypes from "prop-types";
import Logger from "/client/modules/logger";
import { i18next } from "/client/api";
import { Components } from "@reactioncommerce/reaction-components";
import { useMutation } from "@apollo/react-hooks";
import Table from "@material-ui/core/Table";
import TableHead from "@material-ui/core/TableHead";
import TableBody from "@material-ui/core/TableBody";
import TableCell from "@material-ui/core/TableCell";
import TableRow from "@material-ui/core/TableRow";
import getOpaqueIds from "/imports/plugins/core/core/client/util/getOpaqueIds";
import withProductMedia from "../hocs/withProductMedia";
import ProductMediaItem from "./ProductMediaItem";

const archiveMediaRecordMutation = gql`
  mutation ArchiveMediaRecord($input: ArchiveMediaRecordInput!) {
    archiveMediaRecord(input: $input) {
      mediaRecord {
        _id
      }
    }
  }
`;

const updateMediaRecordPriorityMutation = gql`
mutation UpdateMediaRecordPriorityMutation($input: UpdateMediaRecordPriorityInput!) {
  updateMediaRecordPriority(input: $input) {
    mediaRecord {
      _id
    }
  }
}
`;

/**
 * ProductMediaGallery
 * @param {Object} props Component props
 * @returns {Node} React component
 */
function ProductMediaGallery(props) {
  const {
    editable,
    media,
    productId, // internal (for now)
    shopId, // internal (for now)
    variantId // internal (for now)
  } = props;

  const [opaqueProductId, setOpaqueProductId] = useState(null);
  const [opaqueShopId, setOpaqueShopId] = useState(null);
  const [opaqueVariantId, setOpaqueVariantId] = useState(null);

  const [archiveMediaRecord] = useMutation(archiveMediaRecordMutation, { ignoreResults: true });
  const [updateMediaRecordPriority] = useMutation(updateMediaRecordPriorityMutation, { ignoreResults: true });

  const handleRemoveMedia = (mediaToRemove) => {
    const imageUrl = mediaToRemove.url({ store: "medium" });
    const mediaRecordId = mediaToRemove._id;

    Alerts.alert({
      title: "Remove Media?",
      type: "warning",
      showCancelButton: true,
      imageUrl,
      imageHeight: 150
    }, async (isConfirm) => {
      if (isConfirm) {
        const [
          opaqueMediaRecordId
        ] = await getOpaqueIds([
          { namespace: "MediaRecord", id: mediaRecordId }
        ]);

        archiveMediaRecord({
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

  const handleSetMediaPriority = async (mediaRecord, priority) => {
    const [
      opaqueMediaRecordId
    ] = await getOpaqueIds([
      { namespace: "MediaRecord", id: mediaRecord._id }
    ]);

    updateMediaRecordPriority({
      variables: {
        input: {
          mediaRecordId: opaqueMediaRecordId,
          priority,
          shopId: opaqueShopId
        }
      },
      onError(error) {
        Logger.error(error);
        Alerts.toast("Unable to update media priority", "error", {
          autoHide: 10000
        });
      }
    });
  };

  useEffect(() => {
    const getIDs = async () => {
      const [
        opaqueProductIdResult,
        opaqueShopIdResult,
        opaqueVariantIdResult
      ] = await getOpaqueIds([
        { namespace: "Product", id: productId },
        { namespace: "Shop", id: shopId },
        { namespace: "Product", id: variantId }
      ]);

      setOpaqueProductId(opaqueProductIdResult);
      setOpaqueShopId(opaqueShopIdResult);
      setOpaqueVariantId(opaqueVariantIdResult);
    };
    getIDs();
  }, [productId, shopId, variantId]);

  if (editable) {
    let count = (Array.isArray(media) && media.length) || 0;
    const hasMedia = count > 0;

    const getFileMetadata = () => {
      count += 1;
      return {
        productId: opaqueProductId,
        variantId: opaqueVariantId,
        priority: count
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
                  onRemoveMedia={handleRemoveMedia}
                  onSetMediaPriority={handleSetMediaPriority}
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
                  shopId={opaqueShopId}
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
  onSetMediaPriority: PropTypes.func,
  productId: PropTypes.string,
  shopId: PropTypes.string,
  variantId: PropTypes.string
};

export default withProductMedia(ProductMediaGallery);
