import React, { Component, Fragment } from "react";
import PropTypes from "prop-types";
import gql from "graphql-tag";
import { Meteor } from "meteor/meteor";
import { Query } from "react-apollo";
import { compose, withState } from "recompose";
import { Link } from "react-router-dom";
import { withComponents } from "@reactioncommerce/components-context";
import { CustomPropTypes } from "@reactioncommerce/components/utils";
import { Logger, i18next } from "/client/api";
import ButtonBase from "@material-ui/core/ButtonBase";
import Menu from "@material-ui/core/Menu";
import MenuItem from "@material-ui/core/MenuItem";

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
    }),
    menuAnchorEl: PropTypes.any,
    setMenuAnchorEl: PropTypes.func
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
    const {
      components: { ProfileImage },
      menuAnchorEl,
      setMenuAnchorEl
    } = this.props;

    if (this.state.hasError) return null;

    return (
      <Query query={getViewer}>
        {({ loading, data }) => {
          if (loading) return null;

          return (
            <Fragment>
              <ButtonBase
                centerRipple={true}
                onClick={(event) => {
                  setMenuAnchorEl(event.currentTarget);
                }}
              >
                <ProfileImage viewer={data.viewer} {...this.props} />
              </ButtonBase>

              <Menu
                id="profile-actions-menu"
                anchorEl={menuAnchorEl}
                open={Boolean(menuAnchorEl)}
                onClose={() => setMenuAnchorEl(null)}
              >
                <Link to={"/operator/profile"}>
                  <MenuItem>{i18next.t("admin.userAccountDropdown.profileLabel")}</MenuItem>
                </Link>
                <MenuItem onClick={() => Meteor.logout()}>{i18next.t("accountsUI.signOut")}</MenuItem>
              </Menu>
            </Fragment>
          );
        }}
      </Query>
    );
  }
}

export default compose(
  withComponents,
  withState("menuAnchorEl", "setMenuAnchorEl", null)
)(ProfileImageWithData);
