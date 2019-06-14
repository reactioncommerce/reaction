import React, { Component } from "react";
import PropTypes from "prop-types";
import Button from "@material-ui/core/Button";
import Typography from "@material-ui/core/Typography";
import withStyles from "@material-ui/core/styles/withStyles";
import { i18next } from "/client/api";
import PrimaryAppBar from "/imports/client/ui/components/PrimaryAppBar/PrimaryAppBar";

const styles = (theme) => ({
  label: {
    marginRight: theme.spacing.unit * 2
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

  render() {
    const { documentIds, onPublishClick } = this.props;

    return (
      <PrimaryAppBar>
        {this.renderChangesNotification()}
        <Button
          color="primary"
          variant="contained"
          disabled={Array.isArray(documentIds) && documentIds.length === 0}
          label="Publish"
          onClick={onPublishClick}
        >
          {i18next.t("productDetailEdit.publish")}
        </Button>
      </PrimaryAppBar>
    );
  }
}

export default withStyles(styles, { name: "RuiPublishControls" })(PublishControls);
