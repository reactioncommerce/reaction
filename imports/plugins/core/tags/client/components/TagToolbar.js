import React, { Component } from "react";
import PropTypes from "prop-types";
import Button from "@reactioncommerce/components/Button/v1";
import { i18next } from "/client/api";
import PrimaryAppBar from "/imports/client/ui/components/PrimaryAppBar/PrimaryAppBar";

class TagToolbar extends Component {
  static propTypes = {
    canBeDeleted: PropTypes.bool,
    isNew: PropTypes.bool,
    onCancel: PropTypes.func,
    onDelete: PropTypes.func,
    onSave: PropTypes.func
  }

  static defaultProps = {
    allowsDeletion: true,
    isNew: true
  }

  render() {
    const { onDelete, onCancel, onSave, canBeDeleted } = this.props;

    return (
      <PrimaryAppBar title="Main Navigation">
        {(canBeDeleted) &&
          <Button
            actionType="secondary"
            isTextOnly={true}
            onClick={onDelete}
          >
            {i18next.t("admin.tags.form.delete")}
          </Button>
        }
        <Button actionType="secondary" onClick={onCancel}>
          {i18next.t("admin.tags.form.cancel")}
        </Button>
        <Button onClick={onSave}>
          {i18next.t("admin.tags.form.saveChanges")}
        </Button>
      </PrimaryAppBar>
    );
  }
}

export default TagToolbar;
