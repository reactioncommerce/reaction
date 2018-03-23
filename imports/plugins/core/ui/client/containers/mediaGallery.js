import React, { Component } from "react";
import PropTypes from "prop-types";
import Measure from "react-measure";
import update from "immutability-helper";
import { compose } from "recompose";
import { registerComponent, composeWithTracker } from "@reactioncommerce/reaction-components";
import _ from "lodash";
import { FileRecord } from "@reactioncommerce/file-collections";
import { Meteor } from "meteor/meteor";
import MediaGallery from "../components/media/mediaGallery";
import { Logger, Reaction } from "/client/api";
import { ReactionProduct } from "/lib/api";
import { Revisions } from "/lib/collections";
import { isRevisionControlEnabled } from "/imports/plugins/core/revisions/lib/api";
import { Media } from "/imports/plugins/core/files/client";

const wrapComponent = (Comp) => (
  class MediaGalleryContainer extends Component {
    static propTypes = {
      editable: PropTypes.bool,
      id: PropTypes.string,
      media: PropTypes.arrayOf(PropTypes.object),
      placement: PropTypes.string
    }

    // Load first image as featuredImage
    constructor(props) {
      super(props);

      this.state = {
        dimensions: {
          width: -1,
          height: -1
        },
        featuredMedia: null,
        media: null,
        uploadProgress: null
      };
    }

    componentWillReceiveProps(nextProps) {
      // We need to do this logic only if we've temporarily set media in state for latency compensation
      if (!this.state.media) return;

      const previousMediaIds = (this.props.media || []).map(({ _id }) => _id);
      const nextMediaIds = (nextProps.media || []).map(({ _id }) => _id);

      // If added, moved, or reordered media items since last render, then we can assume
      // we got updated data in subscription, clear state, and go back to using the prop
      if (JSON.stringify(previousMediaIds) !== JSON.stringify(nextMediaIds)) {
        this.setState({ media: null });
      }
    }

    handleRemoveMedia = (media) => {
      const imageUrl = media.url({ store: "medium" });
      const mediaId = media._id;

      Alerts.alert({
        title: "Remove Media?",
        type: "warning",
        showCancelButton: true,
        imageUrl,
        imageHeight: 150
      }, (isConfirm) => {
        if (isConfirm) {
          Meteor.call("media/remove", mediaId, (error) => {
            if (error) {
              Alerts.toast(error.reason, "warning", {
                autoHide: 10000
              });
            }
          });
        }
        // show media as removed (since it will not disappear until changes are published
      });
    };

    get media() {
      return this.state.media || this.props.media;
    }

    handleMouseEnterMedia = (event, media) => {
      const { editable } = this.props;

      // It is confusing for an admin to know what the actual featured media is if it
      // changes on hover of the other media.
      if (!editable) {
        this.setState({ featuredMedia: media });
      }
    };

    handleMouseLeaveMedia = () => {
      const { editable } = this.props;

      // It is confusing for an admin to know what the actual featured media is if it
      // changes on hover of the other media.
      if (!editable) {
        this.setState({ featuredMedia: null });
      }
    };

    handleMoveMedia = (dragIndex, hoverIndex) => {
      const mediaList = this.media;
      const media = mediaList[dragIndex];

      // Apply new sort order to variant list
      const newMediaOrder = update(mediaList, {
        $splice: [
          [dragIndex, 1],
          [hoverIndex, 0, media]
        ]
      });

      // Set local state so the component does't have to wait for a round-trip
      // to the server to get the updated list of variants
      this.setState({ media: newMediaOrder });

      // Save the updated positions
      const sortedMediaIDs = newMediaOrder.map(({ _id }) => _id);
      Meteor.call("media/updatePriorities", sortedMediaIDs, (error) => {
        if (error) {
          // Go back to using media prop instead of media state so that it doesn't appear successful
          this.setState({ media: null });

          Alerts.toast(error.reason, "warning", {
            autoHide: 10000
          });
        }
      });
    };

    handleUpload = (files) => {
      const productId = ReactionProduct.selectedProductId();
      const variant = ReactionProduct.selectedVariant();
      if (typeof variant !== "object") {
        return Alerts.add("Select a variant", "danger", { autoHide: true });
      }
      const variantId = variant._id;
      const shopId = ReactionProduct.selectedProduct().shopId || Reaction.getShopId();
      const userId = Meteor.userId();
      let count = Media.findLocal({
        "metadata.variantId": variantId
      }).length;

      for (const file of files) {
        // Convert it to a FileRecord
        const fileRecord = FileRecord.fromFile(file);

        // Set metadata
        fileRecord.metadata = {
          ownerId: userId,
          productId,
          variantId,
          shopId,
          priority: count,
          toGrid: 1 // we need number
        };

        count += 1;

        // Listen for upload progress events
        fileRecord.on("uploadProgress", (uploadProgress) => {
          this.setState({ uploadProgress });
        });

        // Do the upload. chunkSize is optional and defaults to 5MB
        fileRecord.upload({})
          // We insert only AFTER the server has confirmed that all chunks were uploaded
          .then(() => {
            Meteor.call("media/insert", fileRecord.document, (error) => {
              if (error) Alerts.toast(error.reason, "error");
              this.setState({ uploadProgress: null });
            });
          })
          .catch((error) => {
            this.setState({ uploadProgress: null });
            Logger.error(error);
          });
      }
    };

    render() {
      const { width, height } = this.state.dimensions;

      return (
        <Measure
          bounds
          onResize={(contentRect) => {
            this.setState({ dimensions: contentRect.bounds });
          }}
        >
          {({ measureRef }) =>
            <div ref={measureRef}>
              <Comp
                featuredMedia={this.state.featuredMedia}
                onDrop={this.handleUpload}
                onMouseEnterMedia={this.handleMouseEnterMedia}
                onMouseLeaveMedia={this.handleMouseLeaveMedia}
                onMoveMedia={this.handleMoveMedia}
                onRemoveMedia={this.handleRemoveMedia}
                {...this.props}
                media={this.media}
                mediaGalleryHeight={height}
                mediaGalleryWidth={width}
                uploadProgress={this.state.uploadProgress}
              />
            </div>
          }
        </Measure>
      );
    }
  }
);

function fetchMediaRevisions() {
  const productId = ReactionProduct.selectedProductId();
  const mediaRevisions = Revisions.find({
    "parentDocument": productId,
    "documentType": "image",
    "workflow.status": {
      $nin: ["revision/published"]
    }
  }).fetch();
  return mediaRevisions;
}

// resort the media in
function sortMedia(media) {
  const sortedMedia = _.sortBy(media, (m) => {
    const { priority } = (m && m.metadata) || {};
    if (!priority && priority !== 0) {
      return 1000;
    }
    return priority;
  });
  return sortedMedia;
}

// Search through revisions and if we find one for the image, stick it on the object
function appendRevisionsToMedia(props, media) {
  if (!isRevisionControlEnabled() || !Reaction.hasPermission(props.permission || ["createProduct"])) {
    return media;
  }
  const mediaRevisions = fetchMediaRevisions();
  const newMedia = [];
  for (const image of media) {
    image.revision = undefined;
    for (const revision of mediaRevisions) {
      if (revision.documentId === image._id) {
        image.revision = revision;
        image.metadata.priority = revision.documentData.priority;
      }
    }
    newMedia.push(image);
  }
  return sortMedia(newMedia);
}

function composer(props, onData) {
  let media;
  let editable;
  const viewAs = Reaction.getUserPreferences("reaction-dashboard", "viewAs", "administrator");

  if (props.media) {
    media = appendRevisionsToMedia(props, props.media);
  }

  if (viewAs === "customer") {
    editable = false;
  } else {
    editable = Reaction.hasPermission(props.permission || ["createProduct"]);
  }

  onData(null, {
    editable,
    media
  });
}

registerComponent("MediaGallery", MediaGallery, [
  composeWithTracker(composer),
  wrapComponent
]);

export default compose(
  composeWithTracker(composer),
  wrapComponent
)(MediaGallery);
