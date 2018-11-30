import React, { Component } from "react";
import PropTypes from "prop-types";
import gql from "graphql-tag";
import { Query } from "react-apollo";
import { withComponents } from "@reactioncommerce/components-context";
import { CustomPropTypes } from "@reactioncommerce/components/utils";
import { Logger } from "/client/api";

const getViewer = gql`
  query getViewer {
    viewer {
      name
      primaryEmailAddress
    }
  }
`;

class ProfileImageWithData extends Component {
  static propTypes = {
    components: PropTypes.shape({
      ProfileImage: CustomPropTypes.component.isRequired
    })
  };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  state = {
    hasError: false
  }

  componentDidCatch(error, info) {
    Logger.error(error, info);
  }

  render() {
    const { components: { ProfileImage } } = this.props;

    if (this.state.hasError) return null;

    return (
      <Query query={getViewer}>
        {({ loading, data }) => {
          if (loading) return null;

          return (
            <ProfileImage viewer={data.viewer} {...this.props} />
          );
        }}
      </Query>
    );
  }
}

export default withComponents(ProfileImageWithData);
