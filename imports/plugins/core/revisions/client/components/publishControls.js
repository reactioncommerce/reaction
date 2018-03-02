import React, { Component } from "react";
import PropTypes from "prop-types";
import { Components } from "@reactioncommerce/reaction-components";
import {
  Button,
  FlatButton,
  IconButton,
  Divider,
  DropDownMenu,
  MenuItem,
  Switch,
  Icon
} from "/imports/plugins/core/ui/client/components";
import SimpleDiff from "./simpleDiff";
import { Translatable } from "/imports/plugins/core/ui/client/providers";

/** TMP **/
import { Reaction } from "/client/api";

class PublishControls extends Component {
  static propTypes = {
    documentIds: PropTypes.arrayOf(PropTypes.string),
    documents: PropTypes.arrayOf(PropTypes.object),
    isEnabled: PropTypes.bool,
    isPreview: PropTypes.bool,
    onAction: PropTypes.func,
    onAddProduct: PropTypes.func,
    onPublishClick: PropTypes.func,
    onViewContextChange: PropTypes.func,
    onVisibilityChange: PropTypes.func,
    revisions: PropTypes.arrayOf(PropTypes.object),
    showViewAsControls: PropTypes.bool,
    translation: PropTypes.shape({
      lang: PropTypes.string
    })
  }

  static defaultProps = {
    showViewAsControls: true
  }

  constructor(props) {
    super(props);

    this.state = {
      showDiffs: false
    };

    this.handleToggleShowChanges = this.handleToggleShowChanges.bind(this);
    this.handlePublishClick = this.handlePublishClick.bind(this);
  }

  handleToggleShowChanges() {
    this.setState({
      showDiffs: !this.state.showDiffs
    });
  }

  handlePublishClick() {
    if (this.props.onPublishClick) {
      this.props.onPublishClick(this.props.revisions);
    }
  }

  handleVisibilityChange = (event, value) => {
    if (this.props.onVisibilityChange) {
      let isDocumentVisible = false;

      if (value === "public") {
        isDocumentVisible = true;
      }

      this.props.onVisibilityChange(event, isDocumentVisible, this.props.documentIds);
    }
  }

  handleAction = (event, value) => {
    if (this.props.onAction) {
      this.props.onAction(event, value, this.props.documentIds);
    }
  }

  onViewContextChange = (event, isChecked) => {
    if (typeof this.props.onViewContextChange === "function") {
      this.props.onViewContextChange(event, isChecked ? "customer" : "administrator");
    }
  }

  get showChangesButtonLabel() {
    if (!this.showDiffs) {
      return "Show Changes";
    }

    return "Hide Changes";
  }

  get showChangesButtoni18nKeyLabel() {
    if (!this.showDiffs) {
      return "app.showChanges";
    }

    return "app.hideChanges";
  }

  get primaryRevision() {
    const { revisions } = this.props;
    if (Array.isArray(revisions) && revisions.length) {
      const primaryDocumentId = this.props.documentIds[0];
      return revisions.find((revision) => revision.documentId === primaryDocumentId);
    }
    return false;
  }

  get revisionIds() {
    if (this.hasRevisions) {
      return this.props.revisions.map((revision) => revision._id);
    }
    return false;
  }

  get hasRevisions() {
    return Array.isArray(this.props.revisions) && this.props.revisions.length;
  }

  get diffs() {
    return this.props.revisions;
  }

  get showDiffs() {
    return this.diffs && this.state.showDiffs;
  }

  get isVisible() {
    if (Array.isArray(this.props.revisions) && this.props.revisions.length && this.primaryRevision) {
      const primaryRevisionObj = this.primaryRevision;

      if (primaryRevisionObj.documentData.isVisible) {
        return "public";
      }
    } else if (Array.isArray(this.props.documents) && this.props.documents.length) {
      const primaryDocument = this.props.documents[0];

      if (primaryDocument.isVisible) {
        return "public";
      }
    }

    return "private";
  }

  /**
   * Getter hasChanges
   * @return {Boolean} one or more revision has changes
   */
  get hasChanges() {
    // Verify we even have any revision at all
    if (this.hasRevisions) {
      // Loop through all revisions to determine if they have changes
      const diffHasActualChanges = this.props.revisions.map((revision) => {
        // We probably do have chnages to publish
        // Note: Sometimes "updatedAt" will cause false positives, but just incase, lets
        // enable the publish button anyway.
        if ((Array.isArray(revision.diff) && revision.diff.length) || revision.documentType !== "product") {
          return true;
        }

        // If all else fails, we will disable the button
        return false;
      });

      // If even one revision has changes we should enable the publish button
      return diffHasActualChanges.some((element) => element === true);
    }

    // No revisions, no publishing
    return false;
  }

  renderChanges() {
    if (this.showDiffs) {
      const diffs = this.props.revisions.map((revision) => <SimpleDiff diff={revision.diff} key={revision._id} />);

      return (
        <div>
          {diffs}
        </div>
      );
    }
    return null;
  }

  renderDeletionStatus() {
    if (this.hasChanges) {
      if (this.primaryRevision && this.primaryRevision.documentData.isDeleted) {
        return (
          <Button
            label="Archived"
            onClick={this.handleRestore}
            status="danger"
            i18nKeyLabel="app.archived"
          />
        );
      }
    }

    return null;
  }

  renderPublishButton() {
    const buttonProps = {};

    if (Array.isArray(this.props.documentIds) && this.props.documentIds.length > 1) {
      buttonProps.label = "Publish All";
      buttonProps.i18nKeyLabel = "toolbar.publishAll";
    }

    const isDisabled = Array.isArray(this.props.documentIds) && this.props.documentIds.length === 0;

    return (
      <div className="hidden-xs">
        <Button
          bezelStyle="outline"
          disabled={isDisabled}
          label="Publish"
          onClick={this.handlePublishClick}
          status="success"
          tooltip={"This product has changes that need to be published before they are visible to your customers."}
          i18nKeyLabel="productDetailEdit.publish"
          {...buttonProps}
        />
      </div>
    );
  }

  renderMoreOptionsButton() {
    return (
      <DropDownMenu
        buttonElement={<IconButton icon={"fa fa-ellipsis-v"}/>}
        handleMenuItemChange={this.handleAction}
      >
        <MenuItem label="Administrator" value="administrator" />
        <MenuItem label="Customer" value="customer" />
        <Divider />
        <MenuItem
          i18nKeyLabel="app.public"
          icon="fa fa-unlock"
          label="Public"
          selectLabel="Public"
          value="public"
        />
        <MenuItem
          i18nKeyLabel="app.private"
          label="Private"
          icon="fa fa-lock"
          selectLabel="Public"
          value="private"
        />
        <Divider />
        <MenuItem
          disabled={this.hasChanges === false}
          i18nKeyLabel="revisions.discardChanges"
          icon="fa fa-undo"
          label="Discard Changes"
          value="discard"
        />
        <Divider />
        <MenuItem
          i18nKeyLabel="app.archive"
          icon="fa fa-trash-o"
          label="Archive"
          value="archive"
        />
      </DropDownMenu>
    );
  }

  renderViewControls() {
    if (this.props.showViewAsControls) {
      let tooltip = "Private";
      let i18nKeyTooltip = "app.private";

      if (this.isVisible === "public") {
        tooltip = "Public";
        i18nKeyTooltip = "app.public";
      }

      return (
        <div className="hidden-xs">
          <FlatButton
            i18nKeyTooltip={i18nKeyTooltip}
            icon="fa fa-eye-slash"
            onIcon="fa fa-eye"
            toggle={true}
            tooltip={tooltip}
            value="public"
            onValue="private"
            toggleOn={this.isVisible === "public"}
            onToggle={this.handleVisibilityChange}
          />
        </div>
      );
    }

    return null;
  }

  renderUndoButton() {
    return (
      <FlatButton
        disabled={this.hasChanges === false}
        tooltip="Discard Changes"
        i18nKeyTooltip="revisions.discardChanges"
        icon={"fa fa-undo"}
        value="discard"
        onClick={this.handleAction}
      />
    );
  }

  renderArchiveButton() {
    return (
      <FlatButton
        tooltip="Archive"
        i18nKeyTooltip="app.archive"
        icon={"fa fa-archive"}
        value="archive"
        onClick={this.handleAction}
      />
    );
  }

  renderSettingsButton() {
    return (
      <FlatButton
        icon={"fa fa-cog"}
        value="settings"
        onClick={this.handleAction}
      />
    );
  }

  renderVisibilitySwitch() {
    return (
      <Switch
        i18nKeyLabel={"admin.dashboard.preview"}
        label={"Preview"}
        checked={this.props.isPreview}
        onChange={this.onViewContextChange}
      />
    );
  }

  renderAdminButton() {
    return (
      <FlatButton
        onClick={() => {
          Reaction.showActionView({
            i18nKeyTitle: "dashboard.coreTitle",
            title: "Dashboard",
            template: "dashboardPackages"
          });
        }}
      >
        <Icon style={{ fontSize: 24 }} icon="icon icon-reaction-logo" />
      </FlatButton>
    );
  }

  renderAddButton() {
    return (
      <FlatButton
        i18nKeyTooltip={"app.shortcut.addProduct"}
        icon={"fa fa-plus"}
        tooltip={"Add Product"}
        onClick={this.props.onAddProduct}
      />
    );
  }

  render() {
    if (this.props.isEnabled) {
      return (
        <Components.ToolbarGroup lastChild={true}>
          {this.renderDeletionStatus()}
          {this.renderUndoButton()}
          {this.renderArchiveButton()}
          {this.renderViewControls()}
          {this.renderPublishButton()}
          {/* this.renderMoreOptionsButton() */}
        </Components.ToolbarGroup>
      );
    }

    return null;
  }
}

export default Translatable()(PublishControls);
