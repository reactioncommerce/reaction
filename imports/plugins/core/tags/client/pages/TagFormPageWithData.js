import React, { Component } from "react";
import PropTypes from "prop-types";
import { Meteor } from "meteor/meteor";
import { withRouter } from "react-router";
import { compose } from "recompose";
import { Logger, Reaction } from "/client/api";
import { FileRecord } from "@reactioncommerce/file-collections";
import { Media } from "/imports/plugins/core/files/client";
import withOpaqueShopId from "/imports/plugins/core/graphql/lib/hocs/withOpaqueShopId";
import { Query, withApollo } from "react-apollo";
import TagForm from "../components/TagForm";
import { getTag } from "../../lib/queries";

class TagFormPageWithData extends Component {
  static propTypes = {
    history: PropTypes.shape({
      push: PropTypes.func.isRequired
    }),
    match: PropTypes.shape({
      params: PropTypes.shape({
        tagId: PropTypes.string
      })
    }),
    shopId: PropTypes.string.isRequired,
    tagId: PropTypes.string
  }

  handleSave = () => {
    this.props.history.push("/operator/tags");
  }

  handleCancel = () => {
    this.props.history.push("/operator/tags");
  }

  handleUpload = (files) => {
    const { tag, shopId } = this.props;
    const userId = Reaction.getUserId();

    let count = Media.findLocal({
      "metadata.tagId": tag._id
    }).length;

    // Only allow one file to be uploaded at a time
    const file = files[0];

    // Convert it to a FileRecord
    const fileRecord = FileRecord.fromFile(file);

    // Set metadata
    fileRecord.metadata = {
      createdBy: userId,
      shopId,
      tagId: tag._id,
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
        return null;
      })
      .catch((error) => {
        this.setState({ uploadProgress: null });
        Logger.error(error);
      });
  };

  render() {
    const { shopId, match } = this.props;

    // Id there's a tagId param, then try to find
    // that tag and render the edit form
    if (match && match.params.tagId) {
      return (
        <Query query={getTag} variables={{ slugOrId: match.params.tagId }} fetchPolicy="network-only">
          {({ data }) => {
            const tag = data && data.tag;

            // Render the edit tag form
            return (
              <TagForm
                shopId={shopId}
                tag={tag}
                onCancel={this.handleCancel}
                onSave={this.handleSave}
              />
            );
          }}
        </Query>
      );
    }

    // Render the create tag form
    return (
      <TagForm
        shopId={shopId}
        onCancel={this.handleCancel}
        onSave={this.handleSave}
      />
    );
  }
}

export default compose(
  withApollo,
  withRouter,
  withOpaqueShopId
)(TagFormPageWithData);
