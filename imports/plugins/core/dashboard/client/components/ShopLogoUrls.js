import React, { Component, Fragment } from "react";
import PropTypes from "prop-types";
import gql from "graphql-tag";
import styled from "styled-components";
import { Form } from "reacto-form";
import { Mutation } from "react-apollo";
import Button from "@material-ui/core/Button";
import Card from "@material-ui/core/Card";
import CardHeader from "@material-ui/core/CardHeader";
import CardActions from "@material-ui/core/CardActions";
import CardContent from "@material-ui/core/CardContent";
import Grid from "@material-ui/core/Grid";
import ErrorsBlock from "@reactioncommerce/components/ErrorsBlock/v1";
import Field from "@reactioncommerce/components/Field/v1";
import TextInput from "@reactioncommerce/components/TextInput/v1";
import { Components } from "@reactioncommerce/reaction-components";
import { i18next } from "/client/api";
import withShop from "/imports/plugins/core/graphql/lib/hocs/withShop";

const PaddedField = styled(Field)`
  margin-bottom: 30px;
`;

const RightAlignedGrid = styled(Grid)`
  text-align: right;
`;

const updateShopMutation = gql`
  mutation updateShopMutation($input: UpdateShopInput!) {
    updateShop(input: $input) {
      clientMutationId
      shop {
        _id
        shopLogoUrls {
          primaryShopLogoUrl
        }
      }
    }
  }
`;

class ShopLogoUrls extends Component {
  static propTypes = {
    refetchShop: PropTypes.func,
    shop: PropTypes.shape({
      shopLogoUrls: PropTypes.shape({
        primaryShopLogoUrl: PropTypes.string
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
    const { primaryShopLogoUrl } = data;

    // return null;
    mutation({
      variables: {
        input: {
          shopId,
          shopLogoUrls: {
            primaryShopLogoUrl
          }
        }
      }
    });
  }

  render() {
    const { refetchShop, shop } = this.props;
    if (!shop) return null;

    const { shopLogoUrls } = shop;
    const { primaryShopLogoUrl } = shopLogoUrls || {};

    return (
      <Card>
        <CardHeader
          subheader={i18next.t("shopSettings.shopLogo.description")}
          title={i18next.t("shopSettings.shopLogo.title")}
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
                    name="primaryShopLogoUrl"
                    label={i18next.t("shopSettings.shopLogo.primaryShopLogoUrlTitle")}
                    labelFor="primaryShopLogoUrlInput"
                  >
                    <TextInput
                      id="primaryShopLogoUrlInput"
                      name="primaryShopLogoUrl"
                      placeholder={i18next.t("shopSettings.shopLogo.primaryShopLogoUrlDescription")}
                      value={primaryShopLogoUrl || ""}
                    />
                    <ErrorsBlock names={["primaryShopLogoUrl"]} />
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
        <CardContent>
          <Components.ShopBrandMediaManager afterSetBrandImage={refetchShop} shop={shop} />
        </CardContent>
      </Card>
    );
  }
}

export default withShop(ShopLogoUrls);
