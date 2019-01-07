import React, { Component } from "react";
import PropTypes from "prop-types";
import { withRouter } from "react-router";
import { compose } from "recompose";
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
