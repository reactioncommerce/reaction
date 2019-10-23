import React, { useState } from "react";
import PropTypes from "prop-types";
import gql from "graphql-tag";
import { withRouter } from "react-router-dom";
import { useMutation } from "@apollo/react-hooks";
import { Components } from "@reactioncommerce/reaction-components";
import InlineAlert from "@reactioncommerce/components/InlineAlert/v1";
import { Grid, Button } from "@material-ui/core";
import { useDropzone } from "react-dropzone";
import { i18next, Reaction } from "/client/api";
import getOpaqueIds from "/imports/plugins/core/core/client/util/getOpaqueIds";
import decodeOpaqueId from "/imports/utils/decodeOpaqueId.js";
import { Session } from "meteor/session";
import CloseIcon from "mdi-material-ui/Close";
import FilterByFileCard from "./FilterByFileCard";
import TagSelector from "./TagSelector";

const CREATE_PRODUCT = gql`
mutation createProduct($input: CreateProductInput!) {
  createProduct(input: $input) {
    product {
      _id
    }
  }
}
`;

/**
 * ProductTable component
 * @param {Object} props Component props
 * @returns {Node} React node
 */
function ProductTable({ history }) {
  // Filter by file state
  const [files, setFiles] = useState([]);
  const [isFiltered, setFiltered] = useState(false);
  const [isFilterByFileVisible, setFilterByFileVisible] = useState(false);
  const [isTagSelectorVisible, setTagSelectorVisible] = useState(false);
  const [filteredProductIdsCount, setFilteredProductIdsCount] = useState(0);
  const [noProductsFoundError, setNoProductsFoundError] = useState(false);
  const [createProduct, { error: createProductError }] = useMutation(CREATE_PRODUCT);

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
        <Grid item sm={12} >
          <InlineAlert
            isDismissable
            components={{ iconDismiss: <CloseIcon style={{ fontSize: 14 }} /> }}
            alertType="error"
            message={i18next.t("admin.missingFilteredProducts", { count: missing })}
          />
        </Grid>
      );
    }
    return null;
  };

  const createProductMutation = async () => {
    const [opaqueShopId] = await getOpaqueIds([{ namespace: "Shop", id: Reaction.getShopId() }]);

    const { data } = await createProduct({ variables: { input: { shopId: opaqueShopId } } });

    if (data) {
      const { createProduct: { product } } = data;
      const { id: decodedId } = decodeOpaqueId(product._id);

      history.push(`/operator/products/${decodedId}`);
    }
  };

  const selectedProductIds = Session.get("productGrid/selectedProducts");

  return (
    <Grid container spacing={3}>
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
      {(!isFiltered && !isTagSelectorVisible && !isFilterByFileVisible) && (
        <Grid item sm={12}>
          <Grid container spacing={2}>
            <Grid item sm={12}>
              <Button
                color="primary"
                onClick={createProductMutation}
                variant="contained"
              >
                {i18next.t("admin.createProduct") || "Create product"}
              </Button>
            </Grid>
            {createProductError &&
              <Grid item sm={12}>
                <InlineAlert
                  isDismissable
                  components={{ iconDismiss: <CloseIcon style={{ fontSize: 14 }} /> }}
                  alertType="error"
                  message={createProductError.message}
                />
              </Grid>
            }
          </Grid>
        </Grid>
      )}
      {isFiltered && (
        <Grid item sm={12} >
          {noProductsFoundError && (
            <InlineAlert
              alertType="error"
              components={{ iconDismiss: <CloseIcon style={{ fontSize: 14 }} /> }}
              isDismissable
              message={i18next.t("admin.noProductsFoundText")}
            />
          )}
          <InlineAlert
            isDismissable
            isAutoClosing
            components={{ iconDismiss: <CloseIcon style={{ fontSize: 14 }} /> }}
            alertType="information"
            message={i18next.t("admin.showingFilteredProducts", { count: filteredProductIdsCount })}
          />
        </Grid>
      )}
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
  history: PropTypes.object
};

export default withRouter(ProductTable);
