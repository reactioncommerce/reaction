import React, { Component } from "react";
import PropTypes from "prop-types";
import Button from "@reactioncommerce/components/Button/v1";
import AppBar from "@material-ui/core/AppBar";
import Typography from "@material-ui/core/Typography";
import Toolbar from "@material-ui/core/Toolbar";
import { i18next } from "/client/api";
import styled from "styled-components";

const Title = styled.div`
  flex: 1;
`;

const ToolbarItem = styled.div`
  margin-left: 8px;
`;

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
    const { onDelete, onCancel, onSave, canBeDeleted, isNew } = this.props;

    let title = i18next.t("admin.tags.tags");
    let submitButtonTitle = i18next.t("admin.tags.form.submitNew");

    if (isNew) {
      title = i18next.t("admin.tags.form.formTitleUpdate");
      submitButtonTitle = i18next.t("admin.tags.form.submitUpdate");
    }

    return (
      <AppBar position="fixed" color="default">
        <Toolbar>
          <Title>
            <Typography variant="h6">{title}</Typography>
          </Title>
          {(canBeDeleted && !isNew) &&
            <ToolbarItem>
              <Button
                actionType="secondary"
                isTextOnly={true}
                onClick={onDelete}
              >
                {i18next.t("admin.tags.form.delete")}
              </Button>
            </ToolbarItem>
          }
          <ToolbarItem>
            <Button actionType="secondary" onClick={onCancel}>
              {i18next.t("admin.tags.form.cancel")}
            </Button>
          </ToolbarItem>
          <ToolbarItem>
            <Button onClick={onSave}>
              {submitButtonTitle}
            </Button>
          </ToolbarItem>
        </Toolbar>
      </AppBar>
    );
  }
}

export default TagToolbar;
