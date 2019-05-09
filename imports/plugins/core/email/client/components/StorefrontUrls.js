import React, { Component } from "react";
import PropTypes from "prop-types";
import gql from "graphql-tag";
import { Mutation } from "react-apollo";
import Button from "@material-ui/core/Button";
import Card from "@material-ui/core/Card";
import CardHeader from "@material-ui/core/CardHeader";
import CardContent from "@material-ui/core/CardContent";
import { Components } from "@reactioncommerce/reaction-components";
import { i18next } from "/client/api";
import withPrimaryShop from "/imports/plugins/core/graphql/lib/hocs/withPrimaryShop";


const updatShopUrlsMutation = gql`
  mutation updatShopUrlsMutation($input: UpdateShopUrlsInput!) {
    updateShopUrls(input: $input) {
      clientMutationId
      shop {
        _id
        storefrontUrls {
          storefrontHomeUrl
          storefrontOrderUrl
          storefrontOrdersUrl
          storefrontAccountProfileUrl
        }
      }
    }
  }
`;

class StorefrontUrls extends Component {
  static propTypes = {
    shop: PropTypes.shape({
      storefrontUrls: PropTypes.shape({
        storefrontHomeUrl: PropTypes.string,
        storefrontOrderUrl: PropTypes.string,
        storefrontOrdersUrl: PropTypes.string,
        storefrontAccountProfileUrl: PropTypes.string
      })
    })
  };

  static defaultProps = {}

  state = {
    storefrontHomeUrl: this.props.shop.storefrontUrls.storefrontHomeUrl,
    storefrontOrderUrl: this.props.shop.storefrontUrls.storefrontOrderUrl,
    storefrontOrdersUrl: this.props.shop.storefrontUrls.storefrontOrdersUrl,
    storefrontAccountProfileUrl: this.props.shop.storefrontUrls.storefrontAccountProfileUrl
  }

  handleFieldChange = (event, value, field) => {
    this.setState({
      [field]: value
    });
  }

  handleUpdateUrls(mutation) {
    const { storefrontHomeUrl, storefrontOrderUrl, storefrontOrdersUrl, storefrontAccountProfileUrl } = this.state;

    mutation({
      variables: {
        input: {
          shopId: "cmVhY3Rpb24vc2hvcDpKOEJocTN1VHRkZ3daeDNyeg==",
          storefrontUrls: {
            storefrontHomeUrl,
            storefrontOrderUrl,
            storefrontOrdersUrl,
            storefrontAccountProfileUrl
          }
        }
      }
    });
  }

  render() {
    return (
      <Card>
        <CardHeader
          subheader={i18next.t("shopSettings.storefrontUrls.description", "Use these fields to provide your storefronts URL's to various pages to use for links inside of emails.")}
          title={i18next.t("shopSettings.storefrontUrls.title", "Storefront Urls")}
        />
        <CardContent>
          <Components.TextField
            i18nKeyLabel="shopSettings.storefrontUrls.storefrontHomeUrlTitle"
            i18nKeyPlaceholder="shopSettings.storefrontUrls.storefrontHomeUrlTitle"
            label="Homepage URL"
            name="storefrontHomeUrl"
            onBlur={this.handleFieldBlur}
            onChange={this.handleFieldChange}
            onReturnKeyDown={this.handleFieldBlur}
            placeholder="Homepage URL"
            ref="storefrontHomeUrlInput"
            value={this.state.storefrontHomeUrl}
          />
          <Components.TextField
            i18nKeyLabel="shopSettings.storefrontUrls.storefrontOrderUrlTitle"
            i18nKeyPlaceholder="shopSettings.storefrontUrls.storefrontOrderUrlTitle"
            label="Single Order page URL"
            name="storefrontOrderUrl"
            onBlur={this.handleFieldBlur}
            onChange={this.handleFieldChange}
            onReturnKeyDown={this.handleFieldBlur}
            placeholder="Single Order page URL"
            ref="storefrontOrderUrlInput"
            value={this.state.storefrontOrderUrl}
          />
          <Components.TextField
            i18nKeyLabel="shopSettings.storefrontUrls.storefrontOrdersUrlTitle"
            i18nKeyPlaceholder="shopSettings.storefrontUrls.storefrontOrdersUrlTitle"
            label="Orders page URL"
            name="storefrontOrdersUrl"
            onBlur={this.handleFieldBlur}
            onChange={this.handleFieldChange}
            onReturnKeyDown={this.handleFieldBlur}
            placeholder="Orders page URL"
            ref="storefrontOrdersUrlInput"
            value={this.state.storefrontOrdersUrl}
          />
          <Components.TextField
            i18nKeyLabel="shopSettings.storefrontUrls.storefrontAccountProfileUrlTitle"
            i18nKeyPlaceholder="shopSettings.storefrontUrls.storefrontAccountProfileUrlTitle"
            label="Account Profile page URL"
            name="storefrontAccountProfileUrl"
            onBlur={this.handleFieldBlur}
            onChange={this.handleFieldChange}
            onReturnKeyDown={this.handleFieldBlur}
            placeholder="Account Profile page URL"
            ref="storefrontAccountProfileUrlInput"
            value={this.state.storefrontAccountProfileUrl}
          />
          <Mutation mutation={updatShopUrlsMutation}>
            {(mutationFunc) => (
              <Button
                color="primary"
                onClick={() => this.handleUpdateUrls(mutationFunc)}
                variant="contained"
              >
                {i18next.t("shopSettings.storefrontUrls.update", "Update storefront Urls")}
              </Button>
            )}

          </Mutation>
        </CardContent>
      </Card>
    );
  }
}

export default withPrimaryShop(StorefrontUrls);
