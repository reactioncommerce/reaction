import React from "react";
import PropTypes from "prop-types";
import Dropzone from "react-dropzone";
import { i18next } from "/client/api";
import Button from "@material-ui/core/Button";
import LinearProgress from "@material-ui/core/LinearProgress";
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
  const { editable, media, onSetMediaPriority, onRemoveMedia, uploadProgress } = props;

  if (editable) {
    const hasMedia = Array.isArray(media) && media.length > 0;

    return (
      <div className="rui media-gallery">
        <Dropzone
          className="rui gallery-drop-pane"
          disableClick
          multiple
          disablePreview
          onDrop={(files) => {
            if (files.length === 0) return;
            props.onDrop(files);
          }}
          ref={(inst) => { this.dropzone = inst; }}
          accept="image/jpg, image/png, image/jpeg"
        >
          <Table padding="dense">
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
              {!!uploadProgress && (
                <TableRow>
                  <TableCell colSpan={3}>
                    <LinearProgress indeterminate={true} />
                  </TableCell>
                </TableRow>
              )}
              <TableRow>
                <TableCell colSpan={3}>
                  <Button
                    fullWidth
                    onClick={() => {
                      this.dropzone && this.dropzone.open();
                    }}
                    size="large"
                  >
                    {"Drag image or click to upload"}
                  </Button>
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </Dropzone>
      </div>
    );
  }


  return (
    <Table padding="dense">
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
  uploadProgress: PropTypes.shape({
    bytesUploaded: PropTypes.number.isRequired,
    bytesTotal: PropTypes.number.isRequired,
    percentage: PropTypes.number.isRequired
  })
};

ProductMediaGallery.defaultProps = {
  onDrop() {},
  onRemoveMedia() {}
};


export default withProductMedia(ProductMediaGallery);
