import React, { Component } from "react";
import PropTypes from "prop-types";
import { withRouter } from "react-router";
import { compose } from "recompose";
import { Logger, Reaction } from "/client/api";
import { FileRecord } from "@reactioncommerce/file-collections";
import withOpaqueShopId from "/imports/plugins/core/graphql/lib/hocs/withOpaqueShopId";
import { Query, withApollo } from "react-apollo";
import TagForm from "../components/TagForm";
import { getTag, tagListingQuery } from "../../lib/queries";
import { setTagHeroMediaMutation } from "../../lib/mutations";

class TagFormPageWithData extends Component {
  static propTypes = {
    client: PropTypes.object,
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

  get tagId() {
    const { match } = this.props;
    return (match && match.params.tagId) || null;
  }

  handleCreate = (tag) => {
    this.props.history.push(`/operator/tags/edit/${tag._id}`);
  }

  handleCancel = () => {
    this.props.history.push("/operator/tags");
  }

  handleUpload = (files) => {
    const { shopId, client } = this.props;
    const userId = Reaction.getUserId();

    if (!this.tagId) {
      Alerts.toast("Save tag before uploading a hero image.", "error");
      return;
    }

    // Only allow one file to be uploaded at a time
    const file = files[0];

    // Convert it to a FileRecord
    const fileRecord = FileRecord.fromFile(file);

    // Set metadata
    fileRecord.metadata = {
      createdBy: userId,
      shopId,
      type: "tag-hero-image"
    };

    // Listen for upload progress events
    fileRecord.on("uploadProgress", (uploadProgress) => {
      this.setState({ uploadProgress });
    });

    // Do the upload. chunkSize is optional and defaults to 5MB
    fileRecord.upload({})
      // We insert only AFTER the server has confirmed that all chunks were uploaded
      .then(async () => {
        const refetchQueries = [{
          query: tagListingQuery,
          variables: {
            shopId
          }
        }];

        await client.mutate({
          mutation: setTagHeroMediaMutation,
          variables: {
            input: {
              id: this.tagId,
              shopId,
              fileRecord: fileRecord.document
            }
          },
          refetchQueries
        });

        this.setState({ uploadProgress: null });

        return null;
      })
      .catch((error) => {
        this.setState({ uploadProgress: null });
        Logger.error(error);
      });
  };

  render() {
    const { client, shopId } = this.props;

    // Id there's a tagId param, then try to find
    // that tag and render the edit form
    if (this.tagId) {
      return (
        <Query query={getTag} variables={{ slugOrId: this.tagId }} fetchPolicy="network-only">
          {({ data }) => {
            const tag = data && data.tag;

            // Render the edit tag form
            return (
              <TagForm
                client={client}
                shopId={shopId}
                tag={tag}
                onCancel={this.handleCancel}
                onHeroUpload={this.handleUpload}
              />
            );
          }}
        </Query>
      );
    }

    // Render the create tag form
    return (
      <TagForm
        client={client}
        shopId={shopId}
        onHeroUpload={this.handleUpload}
        onCancel={this.handleCancel}
        onCreate={this.handleCreate}
      />
    );
  }
}

export default compose(
  withApollo,
  withRouter,
  withOpaqueShopId
)(TagFormPageWithData);
