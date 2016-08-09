import React, { Component, PropTypes } from "react";
import { Button } from "/imports/plugins/core/ui/client/components";
import SimpleDiff from "./simpleDiff";
import { Translatable } from "/imports/plugins/core/ui/client/providers";
import { Translation } from "/imports/plugins/core/ui/client/components";


class PublishControls extends Component {
  constructor(props) {
    super(props);

    this.state = {
      showDiff: false
    };

    this.handleToggleShowChanges = this.handleToggleShowChanges.bind(this);
    this.handlePublishClick = this.handlePublishClick.bind(this);
  }

  handleToggleShowChanges() {
    this.setState({
      showDiff: !this.state.showDiff
    });
  }

  handlePublishClick() {
    if (this.props.onPublishClick) {
      this.props.onPublishClick(this.props.revision.documentId);
    }
  }

  get showChangesButtonLabel() {
    if (!this.showDiff) {
      return "Show Changes";
    }

    return "Hide Changes";
  }

  get showChangesButtoni18nKeyLabel() {
    if (!this.showDiff) {
      return "app.showChanges";
    }

    return "app.hideChanges";
  }

  get diff() {
    return this.props.revision && this.props.revision.diff;
  }

  get showDiff() {
    return this.diff && this.state.showDiff;
  }

  renderChanges() {
    if (this.showDiff) {
      return (
        <SimpleDiff diff={this.diff} />
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
        {this.showDiff && <hr />}
        {this.renderChanges()}
      </div>
    );
  }
}

PublishControls.propTypes = {
  onPublishClick: PropTypes.func,
  translation: PropTypes.shape({
    lang: PropTypes.string
  }),
  revision: PropTypes.object
};

export default Translatable()(PublishControls);
