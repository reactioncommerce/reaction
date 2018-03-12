import React, { Component } from "react";
import PropTypes from "prop-types";
import Dropzone from "react-dropzone";
import { FileRecord } from "@reactioncommerce/file-collections";
import { Components, registerComponent } from "@reactioncommerce/reaction-components";
import { Logger } from "/client/api";
import { Media } from "/imports/plugins/core/files/client";

class MediaUploader extends Component {
  static propTypes = {
    metadata: PropTypes.object
  };

  constructor(props) {
    super(props);

    this.state = {
      isUploading: false
    };
  }

  componentDidMount() {
    this._isMounted = true;
  }

  componentWillUnmount() {
    this._isMounted = false;
  }

  uploadFiles = (acceptedFiles) => {
    const { metadata } = this.props;
    const filesArray = Array.from(acceptedFiles);
    if (filesArray.length === 0) return;

    this.setState({ isUploading: true });

    const promises = [];
    filesArray.forEach((browserFile) => {
      const fileRecord = FileRecord.fromFile(browserFile);

      if (metadata) fileRecord.metadata = metadata;

      const promise = fileRecord.upload({})
        // We insert only AFTER the server has confirmed that all chunks were uploaded
        .then(() => Media.insert(fileRecord))
        .catch((error) => {
          Logger.error(error);
        });

      promises.push(promise);
    });

    Promise.all(promises).then(() => {
      if (!this._isMounted) return;
      this.setState({ isUploading: false });
    });
  };

  render() {
    const { isUploading } = this.state;

    return (
      <Dropzone
        accept="image/jpg, image/png, image/jpeg"
        className="rui button btn btn-default btn-block"
        disabled={!!isUploading}
        onDrop={this.uploadFiles}
      >
        <div className="contents">
          {!!isUploading && <div style={{ marginLeft: "auto", marginRight: "auto" }}><Components.CircularProgress indeterminate={true} /></div>}
          {!isUploading && <span className="title">
            <Components.Translation defaultValue="Click or drop images here to upload media" i18nKey="mediaUploader.dropFiles" />
          </span>}
        </div>
      </Dropzone>
    );
  }
}

registerComponent("MediaUploader", MediaUploader);

export default MediaUploader;
