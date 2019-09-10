import React, { useState } from "react";
import PropTypes from "prop-types";
import { i18next } from "/client/api";
import CloseIcon from "mdi-material-ui/Close";
import Select from "@reactioncommerce/catalyst/Select";
import SplitButton from "@reactioncommerce/catalyst/SplitButton";
import { useApolloClient } from "@apollo/react-hooks";
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
import Notifications from "./Notifications";

const ACTION_OPTIONS = [{
  label: "Add tags to products",
  type: "ADD"
}, {
  label: "Remove tags from products",
  isDestructive: true,
  type: "REMOVE"
}];

const useStyles = makeStyles((theme) => ({
  cardRoot: {
    overflow: "visible",
    padding: theme.spacing(2),
    marginTop: theme.spacing(4)
  },
  cardContainer: {
    alignItems: "center"
  },
  cardActions: {
    padding: theme.spacing(2),
    justifyContent: "flex-end"
  },
  hidden: {
    display: "none"
  },
  visible: {
    display: "block"
  }
}));

/**
 * TagSelector component
 * @param {Object} props Component props
 * @returns {React.Component} A React component
 */
function TagSelector({ isVisible, selectedProductIds, setVisibility }) {
  const apolloClient = useApolloClient();
  const [selectedTags, setSelectedTags] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [response, setResponse] = useState({ isInvalid: false });
  const classes = useStyles();

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
    setSelectedTags(tags);
  }

  /**
   *
   * @param {Object} option The selected action option
   * @param {Integer} index The index of the selected action option
   * @returns {Object} A response
   */
  async function handleTagsAction(option) {
    const tagIds = selectedTags && selectedTags.map(({ value }) => (value));

    // Prevent user from executing action if he/she has not
    // yet selected at least one tag
    if (!tagIds.length) {
      return setResponse({ isInvalid: true });
    }

    let mutationName;
    const tags = selectedTags && selectedTags.map((tag) => `\u201c${tag.label}\u201d `).join(", ").replace("'", "\u2019");
    let data; let loading; let error;
    setResponse({});
    setIsLoading(true);
    switch (option.type) {
      case "ADD":
        mutationName = "addTagsToProducts";

        ({ data, loading, error } = await apolloClient.mutate({
          mutation: ADD_TAGS_TO_PRODUCTS,
          variables: {
            input: {
              productIds: selectedProductIds,
              tagIds
            },
            fetchPolicy: "no-cache"
          }
        }));

        setIsLoading(loading);

        break;
      case "REMOVE":
        mutationName = "removeTagsFromProducts";

        ({ data, loading, error } = await apolloClient.mutate({
          mutation: REMOVE_TAGS_FROM_PRODUCTS,
          variables: {
            input: {
              productIds: selectedProductIds,
              tagIds
            },
            fetchPolicy: "no-cache"
          }
        }));

        setIsLoading(loading);

        break;
      default:
        break;
    }

    let updatedCount; let foundCount; let foundAndNotUpdated = 0;
    if (data && data && data[mutationName]) {
      ({ updatedCount } = data[mutationName]);
      ({ foundCount } = data[mutationName]);
      foundAndNotUpdated = foundCount - updatedCount;
    }

    setVisibility(false);
    setSelectedTags([]);

    return setResponse({
      isInvalid: false,
      error,
      tags,
      foundAndNotUpdated,
      operationType: option.type,
      updatedCount
    });
  }

  return (
    <Grid item sm={12} >
      {response && Notifications(response)}
      {isVisible &&
        <MuiCard classes={{ root: classes.cardRoot }}>
          <CardHeader
            action={
              <IconButton aria-label="close" onClick={() => setVisibility(false)}>
                <CloseIcon />
              </IconButton>
            }
            title={i18next.t("admin.addRemoveTags.title")}
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
                  placeholder={i18next.t("admin.addRemoveTags.tagsInputPlaceholder")}
                />
              </Grid>
            </Grid>
          </CardContent>
          <CardActions className={classes.cardActions}>
            <SplitButton
              color="primary"
              options={ACTION_OPTIONS}
              onClick={handleTagsAction}
              isWaiting={isLoading}
            />
          </CardActions>
        </MuiCard>
      }
    </Grid>
  );
}

TagSelector.propTypes = {
  isVisible: PropTypes.bool,
  selectedProductIds: PropTypes.array,
  setVisibility: PropTypes.func
};

export default TagSelector;

