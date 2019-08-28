import React, { useState } from "react";
import PropTypes from "prop-types";
import { i18next } from "/client/api";
import CloseIcon from "mdi-material-ui/Close";
import Select from "@reactioncommerce/catalyst/Select";
import SplitButton from "@reactioncommerce/catalyst/SplitButton";
import classNames from "classnames";
import { useMutation, useApolloClient } from "@apollo/react-hooks";
import {
  Grid,
  Card as MuiCard,
  CardActions,
  CardHeader,
  CardContent,
  IconButton,
  makeStyles
} from "@material-ui/core";
import { getTags } from "./helpers";
import { ADD_TAGS_TO_PRODUCTS, REMOVE_TAGS_FROM_PRODUCTS } from "./mutations";


const ACTION_OPTIONS = [{
  label: "Add tags to products",
  type: "ADD"
}, {
  label: "Remove tags from products",
  isDestructive: true,
  type: "REMOVE"
}];

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
function TagSelector({ isVisible, selectedProductIds, setVisibility }) {
  const apolloClient = useApolloClient();
  const [selectedTagIds, setSelectedTagIds] = useState([]);
  const [addTagsToProducts, { data: addTagsResult, loading: addTagsLoading }] = useMutation(ADD_TAGS_TO_PRODUCTS);
  const [removeTagsFromProducts, { data: removeTagsResult, loading: removeTagsLoading }] = useMutation(REMOVE_TAGS_FROM_PRODUCTS);
  const classes = useStyles();
  const cardClasses = classNames({
    [classes.hidden]: true,
    [classes.visible]: isVisible
  });

  /**
   * @summary Loads tags based on user input
   * @param {String} query user input
   * @returns {Array} Array of tag options
   */
  function loadOptions(query) {
    const options = getTags(apolloClient, query);

    return options;
  }

  /**
   * @param {Array} tags User selected tags
   * @returns {undefined}
   */
  function handleOnSelection(tags) {
    const tagIds = tags.map(({ value }) => (value));
    setSelectedTagIds(tagIds);
  }

  /**
   *
   * @param {Object} option The selected action option
   * @param {Integer} index The index of the selected action option
   * @returns {undefined}
   */
  async function handleTagsAction(option) {
    switch (option.type) {
      case "ADD":
        addTagsToProducts({
          variables: {
            input: {
              productIds: selectedProductIds,
              tagIds: selectedTagIds
            }
          }
        });
        break;
      case "REMOVE":
        removeTagsFromProducts({
          variables: {
            input: {
              productIds: selectedProductIds,
              tagIds: selectedTagIds
            }
          }
        });

        break;
      default:
        break;
    }
  }

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
            options={ACTION_OPTIONS}
            onClick={handleTagsAction}
            isWaiting={addTagsLoading || removeTagsLoading}
          />
        </CardActions>
      </MuiCard>
    </Grid>
  );
}

TagSelector.propTypes = {
  isVisible: PropTypes.bool,
  selectedProductIds: PropTypes.array,
  setVisibility: PropTypes.func
};

export default TagSelector;

