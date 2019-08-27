import React from "react";
import PropTypes from "prop-types";
import { i18next } from "/client/api";
import {
  Grid,
  Card as MuiCard,
  CardActions,
  CardHeader,
  CardContent,
  IconButton,
  makeStyles
} from "@material-ui/core";
import CloseIcon from "mdi-material-ui/Close";
import Select from "@reactioncommerce/catalyst/Select";
import SplitButton from "@reactioncommerce/catalyst/SplitButton";
import classNames from "classnames";
import { useApolloClient } from "@apollo/react-hooks";
import { getTags } from "./helpers";

const useStyles = makeStyles((theme) => ({
  root: {
    overflow: "visible"
  },
  cardContainer: {
    alignItems: "center"
  },
  cardHeaderTitle: {
    letterSpacing: "0.3px"
  },
  cardActions: {
    justifyContent: "flex-end"
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
 * TagSelector component
 * @param {Object} props Component props
 * @returns {React.Component} A React component
 */
function TagSelector({ isVisible, setVisibility }) {
  const classes = useStyles();
  const cardClasses = classNames({
    [classes.hidden]: true,
    [classes.visible]: isVisible
  });
  const client = useApolloClient();

  /**
   * @summary Loads tags based on user input
   * @param {String} query user input
   * @returns {Array} Array of tag options
   */
  function loadOptions(query) {
    const options = getTags(client, query);

    return options;
  }

  // Log selected value
  function handleOnSelection(value) {
    console.log("Selected value: ", value);
  }

  const actionOptions = [{
    label: "Add tags to products"
  }, {
    label: "Remove tags from products",
    isDestructive: true
  }];

  return (
    <Grid item sm={12} className={cardClasses}>
      <MuiCard classes={{ root: classes.root }} raised>
        <CardHeader
          className={classes.cardHeaderTitle}
          action={
            <IconButton aria-label="close" onClick={() => setVisibility(false)}>
              <CloseIcon />
            </IconButton>
          }
          title={i18next.t("admin.addRemoveTagsCard.title")}
        />
        <CardContent>
          <Grid container spacing={1} className={classes.cardContainer}>
            <Grid item sm={12}>
              <Select
                cacheOptions
                defaultOptions
                isAsync
                isMulti
                loadOptions={loadOptions}
                onSelection={handleOnSelection}
                placeholder="Enter one or more tags"
              />
            </Grid>
          </Grid>
        </CardContent>
        <CardActions className={classes.cardActions}>
          <SplitButton
            color="primary"
            options={actionOptions}
            onClick={(option, index) => alert(`Selected option "${option.label}" at index (${index})`)}
          />
        </CardActions>
      </MuiCard>
    </Grid>
  );
}

TagSelector.propTypes = {
  isVisible: PropTypes.bool,
  setVisibility: PropTypes.func
};

export default TagSelector;

