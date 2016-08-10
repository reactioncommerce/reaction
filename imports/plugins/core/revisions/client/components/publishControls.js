import React, { Component, PropTypes } from "react";
import { Button } from "/imports/plugins/core/ui/client/components";
import SimpleDiff from "./simpleDiff";
import { Translatable } from "/imports/plugins/core/ui/client/providers";
import { Translation } from "/imports/plugins/core/ui/client/components";


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
      showDiff: !this.state.showDiffs
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

  get diffs() {
    return this.props.revisions;
  }

  get showDiffs() {
    return this.diff && this.state.showDiffs;
  }

  renderChanges() {
    if (this.showDiffs) {
      const diffs = this.props.revisions.map((revision) => {
        return <SimpleDiff diff={revision.diff} />;
      });

      return (
        <div>
          {diffs}
        </div>
      );
    }
    return null;
  }

  render() {
    return (
      <div className="rui publish-controls">
        <Button
          i18nKeyLabel={this.showChangesButtoni18nKeyLabel}
          label={this.showChangesButtonLabel}
          onClick={this.handleToggleShowChanges}
        />
        <Button
          i18nKeyLabel="app.publishChanges"
          label="Publish Changes"
          onClick={this.handlePublishClick}
          primary={true}
        />
        {this.showDiffs && <hr />}
        {this.renderChanges()}
      </div>
    );
  }
}

PublishControls.propTypes = {
  onPublishClick: PropTypes.func,
  revisions: PropTypes.arrayOf(PropTypes.object),
  translation: PropTypes.shape({
    lang: PropTypes.string
  })
};

export default Translatable()(PublishControls);
