import React from "react";
import PropTypes from "prop-types";
import { Link } from "react-router-dom";
import { i18next } from "/client/api";
import { compose, withStateHandlers } from "recompose";
import withStyles from "@material-ui/core/styles/withStyles";
import Card from "@material-ui/core/Card";
import CardHeader from "@material-ui/core/CardHeader";
import IconButton from "@material-ui/core/IconButton";
import Table from "@material-ui/core/Table";
import TableHead from "@material-ui/core/TableHead";
import TableBody from "@material-ui/core/TableBody";
import TableCell from "@material-ui/core/TableCell";
import TableRow from "@material-ui/core/TableRow";
import TextField from "@material-ui/core/TextField";
import PencilIcon from "mdi-material-ui/Pencil";
import PlusIcon from "mdi-material-ui/Plus";
import { isInteger } from "lodash";

const styles = () => ({
  orderField: {
    width: 70,
    maxWidth: 70
  }
});

/**
 * Get url for product, variant or option
 * @param {Object} item Product, variant or option
 * @returns {String} URL
 */
function getURL(item) {
  // Top level product
  if (item.type === "simple") {
    return `/operator/products/${item._id}`;
  }

  // Variant
  if (item.ancestors.length === 1) {
    return `/operator/products/${item.ancestors[0]}/${item._id}`;
  }

  // Option
  return `/operator/products/${item.ancestors[0]}/${item.ancestors[1]}/${item._id}`;
}

/**
 * Product list
 * @param {Object} props Component props
 * @returns {Node} Component representing a list of products, variants, or options
 */
function VariantTable(props) {
  const {
    title,
    classes,
    items,
    onCreate,
    onChangeField,
    orderForItem,
    setOrderForItem
  } = props;

  if (!Array.isArray(items)) {
    return null;
  }

  return (
    <Card>
      <CardHeader
        action={
          <IconButton onClick={onCreate}>
            <PlusIcon />
          </IconButton>
        }
        title={title || "Options"}
      />
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>{i18next.t("admin.productTable.header.order")}</TableCell>
            <TableCell />
            <TableCell>{i18next.t("admin.productTable.header.title")}</TableCell>
            <TableCell>{i18next.t("admin.productTable.header.price")}</TableCell>
            <TableCell>{i18next.t("admin.productTable.header.visible")}</TableCell>
            <TableCell />
          </TableRow>
        </TableHead>
        <TableBody>
          {items.map((item) => (
            <TableRow key={`variantTable-${item._id}`}>
              <TableCell>
                <TextField
                  className={classes.orderField}
                  id="time"
                  margin="dense"
                  variant="outlined"
                  type="numeric"
                  value={orderForItem[item._id] || item.index || ""}
                  onKeyDown={(event) => {
                    if (event.keyCode === 13) {
                      onChangeField(item, "index", event.target.value);
                    }
                  }}
                  onBlur={(event) => {
                    onChangeField(item, "index", event.target.value);
                  }}
                  onChange={(event) => {
                    setOrderForItem(item._id, event.target.value);
                  }}
                />
              </TableCell>
              <TableCell>
                {(Array.isArray(item.media) && item.media.length &&
                  <img alt="" src={item.media[0].url({ store: "thumbnail" })} width={36} />
                ) || "-"}
              </TableCell>
              <TableCell>
                <Link to={getURL(item)}>
                  {item.optionTitle || item.title || item.name}
                </Link>
              </TableCell>
              <TableCell>{item.displayPrice}</TableCell>
              <TableCell>{item.isVisible ? "Visible" : "Hidden"}</TableCell>
              <TableCell>
                <Link to={getURL(item)}>
                  <IconButton>
                    <PencilIcon />
                  </IconButton>
                </Link>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Card>
  );
}

VariantTable.propTypes = {
  classes: PropTypes.object,
  items: PropTypes.arrayOf(PropTypes.object),
  onChangeField: PropTypes.func,
  onCreate: PropTypes.func,
  orderForItem: PropTypes.object,
  setOrderForItem: PropTypes.func,
  title: PropTypes.string
};


const stateHandler = withStateHandlers(({ items }) => {
  const orderForItem = {};

  if (Array.isArray(items)) {
    items.forEach((item) => {
      orderForItem[item._id] = item.index;
    });
  }

  return {
    orderForItem
  };
}, {
  setOrderForItem: ({ orderForItem }) => (_id, value) => {
    const intValue = parseInt(value, 10);
    return {
      orderForItem: {
        ...orderForItem,
        [_id]: isInteger(intValue) ? intValue : ""
      }
    };
  }
});

export default compose(
  withStyles(styles, { name: "RuiVariantTable" }),
  stateHandler
)(VariantTable);
