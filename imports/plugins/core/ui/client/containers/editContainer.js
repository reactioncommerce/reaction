import React, { Children, Component, PropTypes } from "react";
import { Reaction } from "/client/api";
import {
  EditButton,
  VisibilityButton,
  Translation
} from "/imports/plugins/core/ui/client/components";
import { composeWithTracker } from "react-komposer";
// import isEqual

class EditContainer extends Component {

  constructor(props) {
    super(props);

    this.handleEditButtonClick = this.handleEditButtonClick.bind(this);
  }

  handleEditButtonClick() {
    const props = this.props;
console.log("OPEN EDIT VIEW????", props);
    Reaction.showActionView({
      label: props.label,
      i18nKeyLabel: props.i18nKeyLabel,
      template: props.editView,
      data: props.data
    });
  }

  renderVisibilityButton() {
    let styles = {}
    let tooltip
    if (this.props.data.__draft) {
      // styles = {
      //   backgroundColor: "yellow"
      // }
    }

    if (this.props.showsVisibilityButton) {
      return (
        <VisibilityButton
          onClick={this.handleVisibilityButtonClick}
          toggleOn={this.props.data.isVisible}
          style={styles}
          tooltip="Unpublised changes"
        />
      );
    }

    return null;
  }

  renderEditButton() {
    let status;
    let tooltip;

    if (this.props.data.__draft && this.props.field) {
      const draft = this.props.data.__draft;

      if (Array.isArray(draft.diff)) {
        for (const diff of draft.diff) {
          if (diff.path[0] === this.props.field) {
            status = "warning";

            tooltip = (
              <span>
                <Translation defaultValue="Unpublised changes" i18nKey="revisions.unpublishedChanges" />
              </span>
            );
          }
        }
      }
    } else if (this.props.data.__draft) {
      status = "warning";

      tooltip = (
        <span>
          <Translation defaultValue="Unpublised changes" i18nKey="revisions.unpublishedChanges" />
        </span>
      );
    }

    return (
      <EditButton
        onClick={this.handleEditButtonClick}
        status={status}
        tooltip={tooltip}
      />
    );
  }

  render() {
    if (this.props.children) {
      if (this.props.hasPermission) {
        return React.cloneElement(this.props.children, {
          visibilityButton: this.renderVisibilityButton(),
          editButton: this.renderEditButton()
        });
      }

      return (
        Children.only(this.props.children)
      );
    }

    return (
      <div className="rui edit-container">
        {this.renderVisibilityButton()}
        {this.renderEditButton()}
      </div>
    );
  }
}

EditContainer.propTypes = {
  children: PropTypes.node,
  hasPermission: PropTypes.bool
};

function composer(props, onData) {
  onData(null, {
    hasPermission: Reaction.hasPermission(props.premissions)
  });
}

export default composeWithTracker(composer)(EditContainer);
