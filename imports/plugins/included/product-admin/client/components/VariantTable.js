import React from "react";
import PropTypes from "prop-types";
import { Link } from "react-router-dom";
import Card from "@material-ui/core/Card";
import CardHeader from "@material-ui/core/CardHeader";
import IconButton from "@material-ui/core/IconButton";
import Table from "@material-ui/core/Table";
import TableHead from "@material-ui/core/TableHead";
import TableBody from "@material-ui/core/TableBody";
import TableCell from "@material-ui/core/TableCell";
import TableRow from "@material-ui/core/TableRow";
import PencilIcon from "mdi-material-ui/Pencil";
import PlusIcon from "mdi-material-ui/Plus";


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
    items,
    onCreate
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
        title="Options"
      />
      <Table>
        <TableHead>
          <TableRow>
            <TableCell />
            <TableCell>Title</TableCell>
            <TableCell>Price</TableCell>
            <TableCell>Status</TableCell>
            <TableCell>Visible</TableCell>
            <TableCell />
          </TableRow>
        </TableHead>
        <TableBody>
          {items.map((item) => (
            <TableRow>
              <TableCell>
                {(Array.isArray(item.media) && item.media.length &&
                  <img alt="" src={item.media[0].url({ store: "thumbnail" })} width={36} />
                ) || "-"}
              </TableCell>
              <TableCell>
                <Link to={getURL(item)}>
                  {item.title || item.optionTitle || item.name}
                </Link>
              </TableCell>
              <TableCell>{item.price}</TableCell>
              <TableCell>Status</TableCell>
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
  items: PropTypes.arrayOf(PropTypes.object),
  onCreate: PropTypes.func
};

export default VariantTable;
