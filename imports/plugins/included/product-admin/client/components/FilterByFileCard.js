import React from "react";
import PropTypes from "prop-types";
import { i18next } from "/client/api";
import {
  Grid,
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
  cardHeaderTitle: {
    letterSpacing: "0.3px"
  },
  hidden: {
    display: "none"
  },
  visible: {
    display: "block"
  },
  helpText: {
    marginLeft: "20px",
    letterSpacing: "0.28px",
    fontWeight: theme.typography.fontWeightRegular
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
    isFilterByFileVisible,
    files,
    getInputProps,
    getRootProps,
    importFiles,
    setFilterByFileVisible
  } = props;
  const classes = useStyles();

  const cardClasses = classNames({ [classes.hidden]: true, [classes.visible]: !isFilterByFileVisible });

  return (
    <Grid item sm={12} className={cardClasses}>
      <MuiCard raised>
        <CardHeader
          className={classes.cardHeaderTitle}
          action={
            <IconButton aria-label="close" onClick={() => setFilterByFileVisible(true)}>
              <CloseIcon/>
            </IconButton>
          }
          title={i18next.t("admin.importCard.title")}
        />
        <CardContent>
          { files.length > 0 ? (
            <Grid container spacing={1} className={classes.cardContainer}>
              <Grid item sm={12}>
                {files.map((file, idx) => <Chip label={file.name} key={idx} className={classes.leftChip} onDelete={() => handleDelete(file.name)} />)}
              </Grid>
              <Grid item sm={12}>
                <Button
                  variant="contained"
                  color="primary"
                  style={{ float: "right" }}
                  onClick={() => importFiles(files)}
                >
                  {i18next.t("admin.importCard.button")}
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
                  <ImportIcon className={classes.leftIcon}/>
                  {i18next.t("admin.importCard.import")}
                </Button>
                <Typography variant="h5" display="inline" className={classes.helpText}>
                  {i18next.t("admin.importCard.importHelpText")}
                </Typography>
              </Grid>
            </Grid>
          )}
        </CardContent>
      </MuiCard>
    </Grid>
  );
}

FilterByFileCard.propTypes = {
  files: PropTypes.array,
  getInputProps: PropTypes.func,
  getRootProps: PropTypes.func,
  importFiles: PropTypes.func,
  isFilterByFileVisible: PropTypes.bool,
  setFilterByFileVisible: PropTypes.func
};

