import React, { useState } from "react";
import PropTypes from "prop-types";
import { Components } from "@reactioncommerce/reaction-components";
import InlineAlert from "@reactioncommerce/components/InlineAlert/v1";
import { Grid, Button, Card, CardHeader, CardContent, IconButton, Typography, makeStyles } from "@material-ui/core";
import CloseIcon from "mdi-material-ui/Close";
import ImportIcon from "mdi-material-ui/Download";
import { useDropzone } from "react-dropzone";
import { i18next } from "/client/api";
import { Session } from "meteor/session";
import Chip from "@reactioncommerce/catalyst/Chip";
import withCreateProduct from "../hocs/withCreateProduct";

const useStyles = makeStyles((theme) => ({
  leftIcon: {
    marginRight: theme.spacing(1)
  },
  leftChip: {
    marginRight: theme.spacing(1)
  },
  helpText: {
    marginLeft: "20px",
    letterSpacing: "0.28px",
    fontWeight: theme.typography.fontWeightRegular
  },
  cardHeaderTitle: {
    letterSpacing: "0.3px"
  },
  cardContainer: {
    alignItems: "center"
  }
}));

/**
 * ProductTable component
 * @param {Object} props Component props
 * @returns {Node} React node
 */
function ProductTable({ onCreateProduct }) {
  const [files, setFiles] = useState([]);
  const [isFiltered, setFiltered] = useState(false);
  const [isClosed, setClosed] = useState(true);
  const [filteredProductIdsCount, setFilteredProductIdsCount] = useState(0);
  const [noProductsFoundError, setNoProductsFoundError] = useState(false);

  const onDrop = (accepted) => {
    if (accepted.length === 0) return;
    setFiles(accepted);
    setNoProductsFoundError(false);
  };

  const importFiles = (newFiles) => {
    let productIds = [];

    newFiles.map((file) => {
      const output = [];
      const reader = new FileReader();
      reader.readAsText(file);
      reader.onloadend = () => {
        const parse = require("csv-parse");

        parse(reader.result, {
          trim: true,
          // eslint-disable-next-line camelcase
          skip_empty_lines: true
        })
          .on("readable", function () {
            let record;
            // eslint-disable-next-line no-cond-assign
            while (record = this.read()) {
              output.push(record);
            }
          })
          .on("end", () => {
            output.map((outputarray) => {
              productIds = productIds.concat(outputarray);
              return;
            });
            Session.set("filterByProductIds", productIds);
            setClosed(true);
            setFiltered(true);
          });
      };
      return;
    });
  };

  const handleDelete = (deletedFilename) => {
    const newFiles = files.filter((file) => file.name !== deletedFilename);
    setFiles(newFiles);
    if (newFiles.length === 0) {
      setFiltered(false);
      Session.delete("filterByProductIds");
      Session.set("productGrid/selectedProducts", []);
    } else if (isFiltered) {
      importFiles(newFiles);
    }
  };

  const { getRootProps, getInputProps } = useDropzone({
    onDrop,
    multiple: true,
    disablePreview: true,
    accept: "text/csv",
    disableClick: true
  });

  const classes = useStyles();

  let displayCard;
  let displayButton;
  if (isClosed === true) {
    displayCard = "none";
    if (isFiltered === true) {
      displayButton = "none";
    } else {
      displayButton = "block";
    }
  } else {
    displayCard = "block";
    displayButton = "none";
  }

  const closeCard = () => {
    setClosed(false);
  };

  const setFilteredCount = (count) => {
    if (count === 0) {
      setFiltered(false);
      Session.delete("filterByProductIds");
      setFiles([]);
      setNoProductsFoundError(true);
      Session.set("productGrid/selectedProducts", []);
    }
    setFilteredProductIdsCount(count);
  };

  const iconComponents = {
    iconDismiss: <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" /><path d="M0 0h24v24H0z" fill="none" /></svg>
  };

  // eslint-disable-next-line react/no-multi-comp
  const renderMissedFilterItems = () => {
    if (!Session.get("filterByProductIds")) {
      return null;
    }
    const filterProductIds = Session.get("filterByProductIds").length;
    if (isFiltered && filteredProductIdsCount < filterProductIds) {
      const missing = filterProductIds - filteredProductIdsCount;
      return (
        <Grid item sm={12}>
          <InlineAlert
            isDismissable
            components={iconComponents}
            alertType="error"
            title={i18next.t("admin.productListIdsNotFound", { missing, all: filterProductIds }) || "Product Ids not found"}
            message={i18next.t("admin.missingFilteredProducts", { count: missing })}
          />
        </Grid>
      );
    }
    return null;
  };

  return (
    <Grid container spacing={3}>
      { noProductsFoundError ? (
        <Grid item sm={12}>
          <InlineAlert
            isDismissable
            components={iconComponents}
            alertType="error"
            title={i18next.t("admin.noProductsFoundTitle") || "No Product Ids found"}
            message={i18next.t("admin.noProductsFoundText")}
          />
        </Grid>
      ) : null }
      <Grid item sm={12} style={{ display: displayCard }}>
        <Card raised>
          <CardHeader
            className={classes.cardHeaderTitle}
            action={
              <IconButton aria-label="close" onClick={() => setClosed(true)}>
                <CloseIcon/>
              </IconButton>
            }
            title={i18next.t("admin.importCard.title")}
          />
          <CardContent>
            { files.length > 0 ? (
              <Grid container spacing={1} className={classes.cardContainer}>
                <Grid item sm={12}>
                  {files.map((file, idx) => (
                    <Chip
                      variant="default"
                      color="primary"
                      label={file.name}
                      key={idx}
                      className={classes.leftChip}
                      onDelete={() => handleDelete(file.name)}
                    />
                  ))}
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
        </Card>
      </Grid>
      <Grid item sm={12} style={{ display: displayButton }}>
        <Button
          color="primary"
          onClick={onCreateProduct}
          variant="contained"
        >
          {i18next.t("admin.createProduct") || "Create product"}
        </Button>
      </Grid>
      { isFiltered ? (
        <Grid item sm={12}>
          <InlineAlert
            isDismissable
            components={iconComponents}
            alertType="information"
            title={i18next.t("admin.productListFiltered") || "Product list filtered"}
            message={i18next.t("admin.showingFilteredProducts", { count: filteredProductIdsCount })}
          />
        </Grid>
      ) : null }
      {renderMissedFilterItems()}
      <Grid item sm={12}>
        <Components.ProductsAdmin
          onShowFilterByFile={() => closeCard()}
          setFilteredProductIdsCount={setFilteredCount}
          files={files}
          handleDelete={handleDelete}
          isFiltered={isFiltered}
        />
      </Grid>
    </Grid>
  );
}

ProductTable.propTypes = {
  onCreateProduct: PropTypes.func
};

export default withCreateProduct(ProductTable);
