import React, { Children, Component, PropTypes } from "react";
import { Reaction } from "/client/api";
import { EditButton, VisibilityButton, Translation } from "/imports/plugins/core/ui/client/components";
import { composeWithTracker } from "react-komposer";

class EditContainer extends Component {

  handleEditButtonClick = (event) => {
    const props = this.props;

    if (this.props.onEditButtonClick) {
      const returnValue = this.props.onEditButtonClick(event, props);

      if (returnValue === false) {
        return returnValue;
      }
    }

    Reaction.showActionView({
      label: props.label,
      i18nKeyLabel: props.i18nKeyLabel,
      template: props.editView,
      data: props.data
    });
  }

  renderVisibilityButton() {
    if (this.props.showsVisibilityButton) {
      return (
        <VisibilityButton
          onClick={this.handleVisibilityButtonClick}
          toggleOn={this.props.data.isVisible}
          tooltip="Unpublised changes"
        />
      );
    }

    return null;
  }

  renderEditButton() {
    let status;
    let tooltip;
    let hasChange = false;

    if (this.props.data.__draft && this.props.field) {
      const draft = this.props.data.__draft;

      if (Array.isArray(draft.diff)) {
        for (const diff of draft.diff) {
          let hasChangedField = false;

          if (Array.isArray(this.props.field)) {
            if (this.props.field.indexOf(diff.path[0]) >= 0) {
              hasChangedField = true;
            }
          } else if (typeof this.props.field === "string" && this.props.field === diff.path[0]) {
            hasChangedField = true;
          }

          if (hasChangedField) {
            status = "warning";

            tooltip = (
              <span>
                <Translation defaultValue="Unpublised changes" i18nKey="revisions.unpublishedChanges" />
              </span>
            );

            hasChange = true;
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

    if (this.props.autoHideEditButton && hasChange === false) {
      return null;
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
      <span className="rui edit-container">
        {this.renderVisibilityButton()}
        {this.renderEditButton()}
      </span>
    );
  }
}

EditContainer.propTypes = {
  autoHideEditButton: PropTypes.bool,
  children: PropTypes.node,
  data: PropTypes.object,
  field: PropTypes.oneOfType([PropTypes.string, PropTypes.array]),
  hasPermission: PropTypes.bool,
  onEditButtonClick: PropTypes.func,
  showsVisibilityButton: PropTypes.bool
};

function composer(props, onData) {
  onData(null, {
    hasPermission: Reaction.hasPermission(props.premissions)
  });
}

export default composeWithTracker(composer)(EditContainer);
