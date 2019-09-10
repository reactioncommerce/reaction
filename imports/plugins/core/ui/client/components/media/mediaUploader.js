import React, { useState } from "react";
import PropTypes from "prop-types";
import { Meteor } from "meteor/meteor";
import { useDropzone } from "react-dropzone";
import Button from "@material-ui/core/Button";
import LinearProgress from "@material-ui/core/LinearProgress";
import { FileRecord } from "@reactioncommerce/file-collections";
import { registerComponent } from "@reactioncommerce/reaction-components";
import { i18next, Logger } from "/client/api";

/**
 * @summary media/insert method wrapped in Promise
 * @param {Object} doc The FileRecord.document
 * @return {Promise<Object>} Method call result
 */
function mediaInsertPromise(doc) {
  return new Promise((resolve, reject) => {
    Meteor.call("media/insert", doc, (error, result) => {
      if (error) {
        reject(error);
      } else {
        resolve(result);
      }
    });
  });
}

/**
 * MediaUploader
 * @param {Object} props Component props
 * @returns {Node} React component
 */
function MediaUploader(props) {
  const { canUploadMultiple, metadata, onError, onFiles } = props;

  const [isUploading, setIsUploading] = useState(false);

  const uploadFiles = (acceptedFiles) => {
    const filesArray = Array.from(acceptedFiles);

    setIsUploading(true);

    const promises = filesArray.map(async (browserFile) => {
      const fileRecord = FileRecord.fromFile(browserFile);

      if (metadata) {
        if (typeof metadata === "function") {
          fileRecord.metadata = metadata();
        } else {
          fileRecord.metadata = metadata;
        }
      }

      await fileRecord.upload({});

      // We insert only AFTER the server has confirmed that all chunks were uploaded
      return mediaInsertPromise(fileRecord.document);
    });

    Promise.all(promises)
      .then(() => {
        setIsUploading(false);
        return null;
      })
      .catch((error) => {
        setIsUploading(false);
        if (onError) {
          onError(error);
        } else {
          Logger.error(error);
        }
      });
  };

  const { getRootProps, getInputProps } = useDropzone({
    accept: "image/jpg, image/png, image/jpeg",
    disableClick: true,
    disablePreview: true,
    multiple: canUploadMultiple,
    onDrop(files) {
      if (files.length === 0) return;

      // Pass onFiles func to circumvent default uploader
      if (onFiles) {
        onFiles(files);
      } else {
        uploadFiles(files);
      }
    }
  });

  return (
    <div {...getRootProps({ className: "dropzone" })}>
      <input {...getInputProps()} />
      {isUploading ? <LinearProgress /> : <Button fullWidth size="large">{i18next.t("reactionUI.components.mediaUploader.dropFiles")}</Button>}
    </div>
  );
}

MediaUploader.propTypes = {
  canUploadMultiple: PropTypes.bool,
  metadata: PropTypes.oneOfType([PropTypes.object, PropTypes.func]),
  onError: PropTypes.func,
  onFiles: PropTypes.func
};

MediaUploader.defaultProps = {
  canUploadMultiple: false
};

registerComponent("MediaUploader", MediaUploader);

export default MediaUploader;
