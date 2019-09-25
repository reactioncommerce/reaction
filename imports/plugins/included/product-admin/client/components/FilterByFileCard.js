import React from "react";
import PropTypes from "prop-types";
import { i18next } from "/client/api";
import {
  Grid,
  Grow,
  Button,
  Card as MuiCard,
  CardHeader,
  CardContent,
  IconButton,
  Typography,
  makeStyles
} from "@material-ui/core";
import CloseIcon from "mdi-material-ui/Close";
import ImportIcon from "mdi-material-ui/Download";
import Chip from "@reactioncommerce/catalyst/Chip";
import classNames from "classnames";

const useStyles = makeStyles((theme) => ({
  cardContainer: {
    alignItems: "center"
  },
  hidden: {
    display: "none"
  },
  visible: {
    display: "block"
  },
  helpText: {
    marginLeft: theme.spacing(2)
  },
  leftIcon: {
    marginRight: theme.spacing(1)
  },
  leftChip: {
    marginRight: theme.spacing(1)
  }
}));

/**
 * FilterByFileCard component
 * @param {Object} props Component props
 * @returns {React.Component} A React component
 */
export default function FilterByFileCard(props) {
  const {
    files,
    getInputProps,
    getRootProps,
    handleDelete,
    importFiles,
    isFilterByFileVisible,
    setFilterByFileVisible
  } = props;
  const classes = useStyles();

  const cardClasses = classNames({
    [classes.hidden]: true,
    [classes.visible]: isFilterByFileVisible
  });

  return (
    <Grid item sm={12} className={cardClasses}>
      <Grow
        in={isFilterByFileVisible}
        mountOnEnter
        style={{ transformOrigin: "center top" }}
        timeout={180}
        unmountOnExit
      >
        <MuiCard>
          <CardHeader
            action={
              <IconButton aria-label="close" onClick={() => setFilterByFileVisible(false)}>
                <CloseIcon />
              </IconButton>
            }
            title={i18next.t("admin.importCard.title")}
          />
          <CardContent>
            {files.length > 0 ? (
              <Grid container spacing={1} className={classes.cardContainer}>
                <Grid item sm={12}>
                  {
                    files.map((file, index) => (
                      <Chip
                        label={file.name}
                        key={index}
                        className={classes.leftChip}
                        onDelete={() => handleDelete(file.name)}
                      />
                    ))
                  }
                </Grid>
                <Grid item sm={12}>
                  <Button
                    variant="contained"
                    color="primary"
                    style={{ float: "right" }}
                    onClick={() => importFiles(files)}
                  >
                    {i18next.t("admin.importCard.filterProducts")}
                  </Button>
                </Grid>
              </Grid>
            ) : (
              <Grid container spacing={1} className={classes.cardContainer}>
                <Grid item sm={12}>
                  <Button
                    {...getRootProps({ className: "dropzone" })}
                    variant="contained"
                    color="primary"
                  >
                    <input {...getInputProps()} />
                    <ImportIcon className={classes.leftIcon} />
                    {i18next.t("admin.importCard.import")}
                  </Button>
                  <Typography variant="caption" display="inline" className={classes.helpText}>
                    {i18next.t("admin.importCard.importHelpText")}
                  </Typography>
                </Grid>
              </Grid>
            )}
          </CardContent>
        </MuiCard>
      </Grow>
    </Grid>
  );
}

FilterByFileCard.propTypes = {
  files: PropTypes.array,
  getInputProps: PropTypes.func,
  getRootProps: PropTypes.func,
  handleDelete: PropTypes.func,
  importFiles: PropTypes.func,
  isFilterByFileVisible: PropTypes.bool,
  setFilterByFileVisible: PropTypes.func
};

