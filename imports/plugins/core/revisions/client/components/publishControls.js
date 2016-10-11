import React, { Component, PropTypes } from "react";
import { Button, Translation } from "/imports/plugins/core/ui/client/components";
import SimpleDiff from "./simpleDiff";
import { Translatable } from "/imports/plugins/core/ui/client/providers";

class PublishControls extends Component {
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

  get hasRevisions() {
    return Array.isArray(this.props.revisions) && this.props.revisions.length;
  }

  get diffs() {
    return this.props.revisions;
  }

  get showDiffs() {
    return this.diffs && this.state.showDiffs;
  }

  /**
   * Getter hasChanges
   * @return {Boolean} one or more revision has changes
   */
  get hasChanges() {
    // Verify we even have any revision at all
    if (this.hasRevisions) {
      // Loop through all revisions to determin if they have changes
      const diffHasActualChanges = this.props.revisions.map((revision) => {
        // We probably do have chnages to publish
        // Note: Sometimes "updatedAt" will cause false positives, but just incase, lets
        // enable the publish button anyway.
        if (Array.isArray(revision.diff) && revision.diff.length) {
          return true;
        }

        // If all else fails, we will disable the button
        return false;
      });

      // If even one revision has changes we should enable the publish button
      return diffHasActualChanges.some((element) => {
        return element === true;
      });
    }

    // No revisions, no publishing
    return false;
  }

  renderChanges() {
    if (this.showDiffs) {
      const diffs = this.props.revisions.map((revision) => {
        return <SimpleDiff diff={revision.diff} key={revision._id} />;
      });

      return (
        <div>
          {diffs}
        </div>
      );
    }
    return null;
  }

  renderPublishButton() {
    return (
      <Button
        disabled={this.hasChanges === false}
        i18nKeyLabel="app.publishChanges"
        label="Publish Changes"
        onClick={this.handlePublishClick}
        status="success"
      />
    );
  }

  renderDescription() {
    return (
      <span>{"This product has changes that need to be published before they are visible to your customers."}</span>
    );
  }

  render() {
    if (this.props.isEnabled) {
      return (
        <div className="rui publish-controls">
          {this.renderDescription()}
          <Button
            i18nKeyLabel={this.showChangesButtoni18nKeyLabel}
            label={this.showChangesButtonLabel}
            onClick={this.handleToggleShowChanges}
            status="link"
          />
          {this.renderPublishButton()}
          {this.showDiffs && <hr />}
          {this.renderChanges()}
        </div>
      );
    }

    return (
      <div className="rui publish-controls">
        <Translation
          defaultValue="Revision control is disabled. Any changes will be published immediately."
          i18nKey="revisions.isDisabled"
        />
      </div>
    );
  }
}

PublishControls.propTypes = {
  isEnabled: PropTypes.bool,
  onPublishClick: PropTypes.func,
  revisions: PropTypes.arrayOf(PropTypes.object),
  translation: PropTypes.shape({
    lang: PropTypes.string
  })
};

export default Translatable()(PublishControls);
