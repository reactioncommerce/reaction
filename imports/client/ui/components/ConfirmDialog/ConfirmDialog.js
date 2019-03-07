import React, { Component, Fragment } from "react";
import PropTypes from "prop-types";
import Button from "@material-ui/core/Button";
import Dialog from "@material-ui/core/Dialog";
import DialogActions from "@material-ui/core/DialogActions";
import DialogContent from "@material-ui/core/DialogContent";
import DialogContentText from "@material-ui/core/DialogContentText";
import DialogTitle from "@material-ui/core/DialogTitle";

class ConfirmDialog extends Component {
  static propTypes = {
    cancelActionText: PropTypes.string,
    children: PropTypes.func.isRequired,
    confirmActionText: PropTypes.string,
    message: PropTypes.oneOfType([PropTypes.string, PropTypes.node]),
    onConfirm: PropTypes.func,
    title: PropTypes.oneOfType([PropTypes.string, PropTypes.node])
  }

  static defaultProps = {
    cancelActionText: "Cancel",
    confirmActionText: "OK",
    onConfirm() {}
  }

  state = {
    isOpen: false
  }

  handleClose = () => {
    this.setState({
      isOpen: false
    });
  }

  handleConfirm = () => {
    this.props.onConfirm();
    this.handleClose();
  }

  handleOpen = () => {
    this.setState({
      isOpen: true
    });
  }

  render() {
    const { children, title, message, confirmActionText, cancelActionText } = this.props;
    const { isOpen } = this.state;

    return (
      <Fragment>
        {children({
          openDialog: this.handleOpen
        })}
        <Dialog
          aria-labelledby="confirm-action-dialog-title"
          maxWidth="sm"
          onClose={this.handleClose}
          open={isOpen}
        >
          <DialogTitle id="confirm-action-dialog-title">{title}</DialogTitle>
          {message && (
            <DialogContent>
              <DialogContentText>{message}</DialogContentText>
            </DialogContent>
          )}

          <DialogActions>
            <Button onClick={this.handleClose} color="primary" variant="outlined">
              {cancelActionText}
            </Button>
            <Button onClick={this.handleConfirm} color="primary" variant="contained">
              {confirmActionText}
            </Button>
          </DialogActions>
        </Dialog>
      </Fragment>
    );
  }
}

export default ConfirmDialog;
