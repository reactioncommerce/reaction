import React, { Component, Fragment } from "react";
import PropTypes from "prop-types";
import { Mutation } from "react-apollo";
import { Form } from "reacto-form";
import Button from "@material-ui/core/Button";
import Grid from "@material-ui/core/Grid";
import Link from "@material-ui/core/Link";
import ErrorsBlock from "@reactioncommerce/components/ErrorsBlock/v1";
import Field from "@reactioncommerce/components/Field/v1";
import TextInput from "@reactioncommerce/components/TextInput/v1";
import { i18next, Reaction } from "/client/api";
import updateOrderFulfillmentGroupMutation from "../graphql/mutations/updateOrderFulfillmentGroup";

class OrderCardFulfillmentGroupTrackingNumber extends Component {
  static propTypes = {
    classes: PropTypes.object,
    fulfillmentGroup: PropTypes.object,
    orderId: PropTypes.string
  };

  state = {
    isEditing: this.props.fulfillmentGroup.tracking === null,
    trackingNumber: this.props.fulfillmentGroup.tracking
  }

  handleFormChange = (value) => {
    this.formValue = value;
  };

  handleSubmitForm = () => {
    const hasPermission = Reaction.hasPermission(["reaction-orders", "order/fulfillment"], Reaction.getUserId(), Reaction.getShopId());

    if (hasPermission) {
      this.form.submit();
    }
  };

  handleToggleEdit = () => {
    const hasPermission = Reaction.hasPermission(["reaction-orders", "order/fulfillment"], Reaction.getUserId(), Reaction.getShopId());

    if (hasPermission) {
      this.setState({
        isEditing: !this.state.isEditing
      });
    }
  };

  handleUpdateFulfillmentGroupTrackingNumber = (data, mutation) => {
    const hasPermission = Reaction.hasPermission(["reaction-orders", "order/fulfillment"], Reaction.getUserId(), Reaction.getShopId());

    if (hasPermission) {
      const { fulfillmentGroup, orderId } = this.props;
      const { tracking } = data;

      mutation({
        variables: {
          orderFulfillmentGroupId: fulfillmentGroup._id,
          orderId,
          tracking
        }
      });

      this.setState({
        isEditing: false,
        trackingNumber: tracking
      });
    }
  }

  render() {
    const hasPermission = Reaction.hasPermission(["reaction-orders", "order/fulfillment"], Reaction.getUserId(), Reaction.getShopId());
    const { fulfillmentGroup } = this.props;
    const { isEditing, trackingNumber } = this.state;

    if (hasPermission) {
      if (isEditing) {
        return (
          <Mutation mutation={updateOrderFulfillmentGroupMutation}>
            {(mutationFunc) => (
              <Fragment>
                <Form
                  ref={(formRef) => {
                    this.form = formRef;
                  }}
                  onChange={this.handleFormChange}
                  onSubmit={(data) => this.handleUpdateFulfillmentGroupTrackingNumber(data, mutationFunc)}
                  value={fulfillmentGroup}
                >
                  <Field
                    name="tracking"
                    labelFor="trackingInput"
                  >
                    <TextInput
                      id="trackingInput"
                      name="tracking"
                      placeholder={i18next.t("shopSettings.storefrontUrls.tracking", "Tracking")}
                      value={trackingNumber || ""}
                    />
                    <ErrorsBlock names={["tracking"]} />
                  </Field>

                  {trackingNumber ?
                    <Grid container alignItems="center" justify="flex-end" spacing={1}>
                      <Grid item>
                        <Button color="primary" size="small" variant="outlined" onClick={this.handleToggleEdit}>
                          {i18next.t("app.cancel", "Cancel")}
                        </Button>
                      </Grid>
                      <Grid item>
                        <Button color="primary" size="small" variant="contained" onClick={this.handleSubmitForm}>
                          {i18next.t("app.save", "Save")}
                        </Button>
                      </Grid>
                    </Grid>
                    :
                    <Button color="primary" size="small" variant="outlined" onClick={this.handleSubmitForm}>
                      {i18next.t("app.add", "Add")}
                    </Button>
                  }
                </Form>
              </Fragment>
            )}
          </Mutation>
        );
      }
    }

    return (
      <Link
        component="button"
        variant="body2"
        onClick={() => { this.handleToggleEdit(); }}
      >
        {trackingNumber || "Not available"}
      </Link>
    );
  }
}

export default OrderCardFulfillmentGroupTrackingNumber;
