import React from "react";
import PropTypes from "prop-types";
import Button from "@reactioncommerce/catalyst/Button";
import { i18next } from "/client/api";
import PrimaryAppBar from "/imports/client/ui/components/PrimaryAppBar/PrimaryAppBar";

/**
 * Tag toolbar component
 * @param {Object} props Component props
 * @returns {React.Component} Tag toolbar component
 */
function TagToolbar(props) {
  const { canBeDeleted, onDelete, onCancel, onSave, title } = props;

  return (
    <PrimaryAppBar title={title}>
      {(canBeDeleted) &&
        <Button
          isTextOnly={true}
          onClick={onDelete}
        >
          {i18next.t("admin.tags.form.delete")}
        </Button>
      }
      <Button variant="outlined" onClick={onCancel}>
        {i18next.t("admin.tags.form.cancel")}
      </Button>
      <Button variant="contained" color="primary" onClick={onSave}>
        {i18next.t("admin.tags.form.saveChanges")}
      </Button>
    </PrimaryAppBar>
  );
}

TagToolbar.propTypes = {
  canBeDeleted: PropTypes.bool,
  isNew: PropTypes.bool,
  onCancel: PropTypes.func,
  onDelete: PropTypes.func,
  onSave: PropTypes.func,
  title: PropTypes.string
};

TagToolbar.defaultProps = {
  allowsDeletion: true,
  isNew: true
};

export default TagToolbar;
