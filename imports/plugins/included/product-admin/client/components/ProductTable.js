import React, { useState } from "react";
import PropTypes from "prop-types";
import { Components } from "@reactioncommerce/reaction-components";
import InlineAlert from "@reactioncommerce/components/InlineAlert/v1";
import { Grid, Button } from "@material-ui/core";
import { useDropzone } from "react-dropzone";
import { i18next } from "/client/api";
import { Session } from "meteor/session";
import CloseIcon from "mdi-material-ui/Close";
import withCreateProduct from "../hocs/withCreateProduct";
import FilterByFileCard from "./FilterByFileCard";
import TagSelector from "./TagSelector";

/**
 * ProductTable component
 * @param {Object} props Component props
 * @returns {Node} React node
 */
function ProductTable({ onCreateProduct }) {
  // Filter by file state
  const [files, setFiles] = useState([]);
  const [isFiltered, setFiltered] = useState(false);
  const [isFilterByFileVisible, setFilterByFileVisible] = useState(false);
  const [isTagSelectorVisible, setTagSelectorVisible] = useState(false);
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
            setFilterByFileVisible(false);
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

  const handleShowFilterByFile = (isVisible) => {
    if (isTagSelectorVisible) setTagSelectorVisible(false);
    setFilterByFileVisible(isVisible);
  };

  const handleDisplayTagSelector = (isVisible) => {
    if (isFilterByFileVisible) setFilterByFileVisible(false);
    setTagSelectorVisible(isVisible);
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
            components={{ iconDismiss: <CloseIcon style={{ fontSize: 14 }} /> }}
            alertType="error"
            title={i18next.t("admin.productListIdsNotFound", { missing, all: filterProductIds }) || "Product Ids not found"}
            message={i18next.t("admin.missingFilteredProducts", { count: missing })}
          />
        </Grid>
      );
    }
    return null;
  };

  const selectedProductIds = Session.get("productGrid/selectedProducts");

  return (
    <Grid container spacing={3}>
      {noProductsFoundError ? (
        <Grid item sm={12}>
          <InlineAlert
            alertType="error"
            components={{ iconDismiss: <CloseIcon style={{ fontSize: 14 }} /> }}
            isDismissable
            message={i18next.t("admin.noProductsFoundText")}
            title={i18next.t("admin.noProductsFoundTitle") || "No Product Ids found"}
          />
        </Grid>
      ) : null}
      <FilterByFileCard
        isFilterByFileVisible={isFilterByFileVisible}
        files={files}
        getInputProps={getInputProps}
        getRootProps={getRootProps}
        importFiles={importFiles}
        handleDelete={handleDelete}
        setFilterByFileVisible={setFilterByFileVisible}
      />
      <TagSelector
        isVisible={isTagSelectorVisible}
        setVisibility={setTagSelectorVisible}
        selectedProductIds={selectedProductIds}
      />
      {(!isFiltered && !isTagSelectorVisible) && (
        <Grid item sm={12} >
          <Button
            color="primary"
            onClick={onCreateProduct}
            variant="contained"
          >
            {i18next.t("admin.createProduct") || "Create product"}
          </Button>
        </Grid>
      )}
      {isFiltered ? (
        <Grid item sm={12}>
          <InlineAlert
            isDismissable
            isAutoClosing
            components={{ iconDismiss: <CloseIcon style={{ fontSize: 14 }} /> }}
            alertType="information"
            title={i18next.t("admin.productListFiltered") || "Product list filtered"}
            message={i18next.t("admin.showingFilteredProducts", { count: filteredProductIdsCount })}
          />
        </Grid>
      ) : null}
      {renderMissedFilterItems()}
      <Grid item sm={12}>
        <Components.ProductsAdmin
          onShowFilterByFile={(isVisible) => handleShowFilterByFile(isVisible)}
          onDisplayTagSelector={(isVisible) => handleDisplayTagSelector(isVisible)}
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
