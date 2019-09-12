import React from "react";
import PropTypes from "prop-types";
import withStyles from "@material-ui/core/styles/withStyles";
import TextField from "@material-ui/core/TextField";
import { compose, withStateHandlers } from "recompose";
import { isInteger } from "lodash";
import IconButton from "@material-ui/core/IconButton";
import TableCell from "@material-ui/core/TableCell";
import TableRow from "@material-ui/core/TableRow";
import CloseIcon from "mdi-material-ui/Close";

const styles = () => ({
  root: {
    position: "relative"
  },
  image: {
    height: 100
  },
  priorityField: {
    width: 120
  }
});

/**
 * ProductMediaItem
 * @param {Object} props Component props
 * @returns {Node} React component
 */
function ProductMediaItem(props) {
  const {
    classes,
    defaultSource,
    onRemoveMedia,
    onSetMediaPriority,
    priority,
    setPriority,
    size,
    source
  } = props;

  const imageSrc = (props && source.url({ store: size })) || defaultSource;

  return (
    <TableRow>
      <TableCell className={classes.priorityField}>
        <TextField
          id="time"
          margin="dense"
          variant="outlined"
          type="numeric"
          value={priority === null ? "" : priority}
          onKeyDown={(event) => {
            if (event.keyCode === 13) {
              onSetMediaPriority(source, priority);
            }
          }}
          onBlur={() => {
            onSetMediaPriority(source, priority);
          }}
          onChange={(event) => {
            setPriority(event.target.value);
          }}
        />
      </TableCell>
      <TableCell>
        <img
          alt=""
          className={classes.image}
          src={imageSrc}
        />
      </TableCell>

      <TableCell align="right">
        <IconButton
          onClick={() => {
            onRemoveMedia(source);
          }}
        >
          <CloseIcon />
        </IconButton>
      </TableCell>
    </TableRow>
  );
}

ProductMediaItem.propTypes = {
  classes: PropTypes.object,
  defaultSource: PropTypes.string,
  editable: PropTypes.bool, // eslint-disable-line react/boolean-prop-naming
  onRemoveMedia: PropTypes.func,
  onSetMediaPriority: PropTypes.func,
  priority: PropTypes.number,
  setPriority: PropTypes.func,
  size: PropTypes.string,
  source: PropTypes.object
};

ProductMediaItem.defaultProps = {
  defaultSource: "/resources/placeholder.gif",
  editable: false,
  onRemoveMedia() { },
  size: "large"
};

const stateHandler = withStateHandlers(({ source }) => ({
  priority: source.metadata.priority
}), {
  setPriority: () => (value) => {
    const intValue = parseInt(value, 10);
    return {
      priority: isInteger(intValue) ? intValue : null
    };
  }
});

export default compose(
  withStyles(styles, { name: "RuiProductMediaItem" }),
  stateHandler
)(ProductMediaItem);
