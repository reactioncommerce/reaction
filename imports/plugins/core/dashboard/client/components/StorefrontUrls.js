import React, { Component, Fragment } from "react";
import PropTypes from "prop-types";
import gql from "graphql-tag";
import styled from "styled-components";
import { Form } from "reacto-form";
import { Mutation } from "react-apollo";
import { compose } from "recompose";
import withStyles from "@material-ui/core/styles/withStyles";
import Button from "@material-ui/core/Button";
import Card from "@material-ui/core/Card";
import CardHeader from "@material-ui/core/CardHeader";
import CardActions from "@material-ui/core/CardActions";
import CardContent from "@material-ui/core/CardContent";
import Grid from "@material-ui/core/Grid";
import Typography from "@material-ui/core/Typography";
import ErrorsBlock from "@reactioncommerce/components/ErrorsBlock/v1";
import Field from "@reactioncommerce/components/Field/v1";
import TextInput from "@reactioncommerce/components/TextInput/v1";
import { i18next } from "/client/api";
import withPrimaryShopId from "/imports/plugins/core/graphql/lib/hocs/withPrimaryShopId";
import withShop from "/imports/plugins/core/graphql/lib/hocs/withShop";

const PaddedField = styled(Field)`
  margin-bottom: 30px;
`;

const RightAlignedGrid = styled(Grid)`
  text-align: right;
`;

const styles = () => ({
  helpText: {
    marginTop: "10px"
  }
});

const updateShopMutation = gql`
  mutation updateShopMutation($input: UpdateShopInput!) {
    updateShop(input: $input) {
      clientMutationId
      shop {
        _id
        storefrontUrls {
          storefrontHomeUrl
          storefrontLoginUrl
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
    classes: PropTypes.object,
    shop: PropTypes.shape({
      storefrontUrls: PropTypes.shape({
        storefrontHomeUrl: PropTypes.string,
        storefrontLoginUrl: PropTypes.string,
        storefrontOrderUrl: PropTypes.string,
        storefrontOrdersUrl: PropTypes.string,
        storefrontAccountProfileUrl: PropTypes.string
      })
    })
  };

  handleFormChange = (value) => {
    this.formValue = value;
  };

  handleSubmitForm = () => {
    this.form.submit();
  };

  handleUpdateUrls(data, mutation) {
    const {
      shop: { _id: shopId }
    } = this.props;
    const { storefrontHomeUrl, storefrontLoginUrl, storefrontOrderUrl, storefrontOrdersUrl, storefrontAccountProfileUrl } = data;

    // return null;
    mutation({
      variables: {
        input: {
          shopId,
          storefrontUrls: {
            storefrontHomeUrl,
            storefrontLoginUrl,
            storefrontOrderUrl,
            storefrontOrdersUrl,
            storefrontAccountProfileUrl
          }
        }
      }
    });
  }

  render() {
    const { classes, shop } = this.props;

    if (!shop) return null; // Data may not have loaded yet

    const { storefrontUrls } = shop;
    const { storefrontHomeUrl, storefrontLoginUrl, storefrontOrderUrl, storefrontOrdersUrl, storefrontAccountProfileUrl } = storefrontUrls || {};

    return (
      <Card>
        <CardHeader
          subheader={i18next.t(
            "shopSettings.storefrontUrls.description",
            "Use these fields to provide your storefronts URL's to various pages to use for links inside of emails."
          )}
          title={i18next.t("shopSettings.storefrontUrls.title", "Storefront Urls")}
        />
        <Mutation mutation={updateShopMutation}>
          {(mutationFunc) => (
            <Fragment>
              <Form
                ref={(formRef) => {
                  this.form = formRef;
                }}
                onChange={this.handleFormChange}
                onSubmit={(data) => this.handleUpdateUrls(data, mutationFunc)}
                value={shop}
              >
                <CardContent>
                  <PaddedField
                    name="storefrontHomeUrl"
                    label={i18next.t("shopSettings.storefrontUrls.storefrontHomeUrlTitle", "Homepage URL")}
                    labelFor="storefrontHomeUrlInput"
                  >
                    <TextInput
                      id="storefrontHomeUrlInput"
                      name="storefrontHomeUrl"
                      placeholder={i18next.t("shopSettings.storefrontUrls.storefrontHomeUrlDescription", "URL of your shops homepage")}
                      value={storefrontHomeUrl || ""}
                    />
                    <ErrorsBlock names={["storefrontHomeUrl"]} />
                  </PaddedField>
                  <PaddedField
                    name="storefrontLoginUrl"
                    label={i18next.t("shopSettings.storefrontUrls.storefrontLoginUrlTitle", "Login URL")}
                    labelFor="storefrontLoginUrlInput"
                  >
                    <TextInput
                      id="storefrontLoginUrlInput"
                      name="storefrontLoginUrl"
                      placeholder={i18next.t("shopSettings.storefrontUrls.storefrontLoginUrlDescription", "URL of your shops login form")}
                      value={storefrontLoginUrl || ""}
                    />
                    <ErrorsBlock names={["storefrontHomeUrl"]} />
                  </PaddedField>
                  <PaddedField
                    name="storefrontOrderUrl"
                    label={i18next.t("shopSettings.storefrontUrls.storefrontOrderUrlTitle", "Single Order page URL")}
                    labelFor="storefrontOrderUrlInput"
                  >
                    <TextInput
                      id="storefrontOrderUrlInput"
                      name="storefrontOrderUrl"
                      placeholder={
                        i18next.t(
                          "shopSettings.storefrontUrls.storefrontOrderUrlDescription",
                          "URL of your shops single order page, with `:orderId` and `:token` variables provided"
                        )
                      }
                      value={storefrontOrderUrl || ""}
                    />
                    <Typography className={classes.helpText} variant="caption">
                      {i18next.t(
                        "shopSettings.storefrontUrls.storefrontOrderUrlHelpText",
                        "In order for links inside of order emails to work, you must provide both an `:orderId` and `:token` in this field. These act as placeholders that are replaced with the correct data in your email template when an order email is generated. For example: http://shop.example.com/my-orders/:orderId?token=:token"
                      )}
                    </Typography>
                    <ErrorsBlock names={["storefrontOrderUrl"]} />
                  </PaddedField>
                  <PaddedField
                    name="storefrontOrdersUrl"
                    label={i18next.t("shopSettings.storefrontUrls.storefrontOrdersUrlTitle", "Orders page URL")}
                    labelFor="storefrontOrdersUrlInput"
                  >
                    <TextInput
                      id="storefrontOrdersUrlInput"
                      name="storefrontOrdersUrl"
                      placeholder={i18next.t("shopSettings.storefrontUrls.storefrontOrdersUrlDescription", "URL of your shops orders page")}
                      value={storefrontOrdersUrl || ""}
                    />
                    <ErrorsBlock names={["storefrontOrdersUrl"]} />
                  </PaddedField>
                  <PaddedField
                    name="storefrontAccountProfileUrl"
                    label={i18next.t("shopSettings.storefrontUrls.storefrontAccountProfileUrlTitle", "Account Profile page URL")}
                    labelFor="storefrontAccountProfileUrlInput"
                  >
                    <TextInput
                      id="storefrontAccountProfileUrlInput"
                      name="storefrontAccountProfileUrl"
                      placeholder={
                        i18next.t(
                          "shopSettings.storefrontUrls.storefrontAccountProfileUrlDescription",
                          "URL of your shops account profile homepage"
                        )
                      }
                      value={storefrontAccountProfileUrl || ""}
                    />
                    <ErrorsBlock names={["storefrontAccountProfileUrl"]} />
                  </PaddedField>
                </CardContent>
                <CardActions>
                  <Grid container alignItems="center" justify="flex-end">
                    <RightAlignedGrid item xs={12}>
                      <Button color="primary" variant="contained" onClick={this.handleSubmitForm}>
                        {i18next.t("app.save")}
                      </Button>
                    </RightAlignedGrid>
                  </Grid>
                </CardActions>
              </Form>
            </Fragment>
          )}
        </Mutation>
      </Card>
    );
  }
}

export default compose(
  withPrimaryShopId,
  withShop,
  withStyles(styles, { name: "RuiStorefrontUrls" })
)(StorefrontUrls);
