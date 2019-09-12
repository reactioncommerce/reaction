import React, { Component } from "react";
import PropTypes from "prop-types";
import gql from "graphql-tag";
import { Mutation } from "react-apollo";
import Button from "@material-ui/core/Button";
import Typography from "@material-ui/core/Typography";
import withStyles from "@material-ui/core/styles/withStyles";
import { i18next } from "/client/api";
import PrimaryAppBar from "/imports/client/ui/components/PrimaryAppBar/PrimaryAppBar";

const publishProductsToCatalog = gql`
  mutation ($productIds: [ID]!) {
    publishProductsToCatalog(productIds: $productIds) {
      product {
        productId
        title
        isDeleted
        supportedFulfillmentTypes
        variants {
          _id
          title
          options {
            _id
            title
          }
        }
      }
    }
  }
`;

const styles = (theme) => ({
  label: {
    marginRight: theme.spacing(2)
  }
});

class PublishControls extends Component {
  static propTypes = {
    classes: PropTypes.object,
    documentIds: PropTypes.arrayOf(PropTypes.string),
    documents: PropTypes.arrayOf(PropTypes.object),
    onPublishClick: PropTypes.func,
    revisions: PropTypes.arrayOf(PropTypes.object)
  }

  renderChangesNotification = () => {
    const { classes, documents } = this.props;

    if (Array.isArray(documents) && documents.length) {
      const currentProductHash = (documents[0].currentProductHash) || null;
      const publishedProductHash = (documents[0].publishedProductHash) || null;

      if (currentProductHash !== publishedProductHash) {
        return <Typography className={classes.label}>{"Product has unpublished changes"}</Typography>;
      }
    }

    return null;
  }

  renderOnCompletedAlert = () => Alerts.toast(i18next.t("admin.catalogProductPublishSuccess"), "success");

  renderOnErrorAlert = (error) => Alerts.toast(error.message, "error");

  render() {
    const { documentIds, onPublishClick } = this.props;

    return (
      <PrimaryAppBar>
        {this.renderChangesNotification()}
        <Mutation mutation={publishProductsToCatalog} onCompleted={() => this.renderOnCompletedAlert()} onError={(error) => this.renderOnErrorAlert(error)}>
          {(mutationFunc) => (
            <Button
              color="primary"
              variant="contained"
              disabled={Array.isArray(documentIds) && documentIds.length === 0}
              label="Publish"
              onClick={() => onPublishClick(mutationFunc)}
            >
              {i18next.t("productDetailEdit.publish")}
            </Button>
          )}
        </Mutation>
      </PrimaryAppBar>
    );
  }
}

export default withStyles(styles, { name: "RuiPublishControls" })(PublishControls);
