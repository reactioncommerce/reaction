import React from "react";
import PropTypes from "prop-types";
import { Logger } from "/client/api";
import { compose, setDisplayName } from "recompose";

export const BlocksTable = {}; // storage for separate elements of each block
export const BlockComponents = {};

/**
 * @name Blocks
 * @method
 * @memberof Components/Helpers
 * @param {Object} props Component props
 * @returns {React.Component} returns a React component containing requested blocks
 */
export function Blocks(props) {
  const {
    region,
    children,
    blockProps
  } = props;
  const blocks = BlockComponents[region];
  if (!blocks) return null;

  const elements = blocks.map((BlockComponent, key) => (
    <BlockComponent key={key} {...blockProps} />
  ));

  return children(elements);
}

Blocks.defaultProps = {
  children: (blocks) => blocks
};

Blocks.propTypes = {
  children: PropTypes.func.isRequired
};


/**
 * @example // Register a component and container(s) with a name.
 * // The raw component can then be extended or replaced.
 *
 * // Structure of a component in the list:
 *
 * BlocksTable.MyComponent = {
 *    name: 'MyComponent',
 *    hocs: [fn1, fn2],
 *    rawComponent: React.Component
 * }
 * @name registerComponent
 * @method
 * @memberof Components/Helpers
 * @param {Object} options The name of the component to register.
 * @param {Object} options.name The name of the component to register.
 * @param {Object} options.component The name of the component to register.
 * @param {Object} options.region The name of the component to register.
 * @param {Object} options.priority The name of the component to register.
 * @param {Object} options.priority The name of the component to register.
 * @param {React.Component} rawComponent Interchangeable/extendable component.
 * @param {Function|Array} hocs The HOCs to wrap around the raw component.
 *
 * @returns {React.Component} returns the final wrapped component
 */
export function registerBlock(options) {
  const {
    name,
    component,
    region,
    priority,
    hocs = []
  } = options;

  if (!region) {
    throw new Error("A region is required for registerBlock");
  }

  if (!name) {
    throw new Error("A name is required for registerBlock");
  }

  if (!component) {
    throw new Error("A component is required for registerBlock");
  }

  if (!BlocksTable[region]) {
    BlocksTable[region] = {};
  }

  // store the component in the table
  BlocksTable[region][name] = {
    name,
    rawComponent: component,
    region,
    priority,
    hocs: Array.isArray(hocs) ? hocs : [hocs]
  };
}


/**
 * @name registerBlockHOC
 * @method
 * @summary Register containers (HOC) with a name.
 * If some containers already exist for the component, they will be extended.
 * @param {String} regionName The name of region the block belongs to.
 * @param {String} blockName The name of the block.
 * @param {Function|Array} hocs The HOCs to wrap around the raw component.
 * @memberof Components/Helpers
 * @returns {undefined}
 */
export function registerBlockHOC(regionName, blockName, hocs = []) {
  if (!regionName || !blockName || !hocs) {
    throw new Error("A name and HOC(s) are required for registerBlockHOC");
  }

  const newHOCs = Array.isArray(hocs) ? hocs : [hocs];

  const existingComponent = BlocksTable[regionName][blockName];

  // Check to see if this component has already been registered and whether it has
  // HOC's to merge with our new ones. If not, just register it like a new component.
  // This allows us to register HOCs _before_ registering the UI component.
  // Just keep in mind that the resulting component will definitely throw an error
  // if a UI component doesn't eventually get registered.
  if (!!existingComponent && !!existingComponent.hocs) {
    const existingHOCs = existingComponent.hocs;

    BlocksTable[name] = {
      name,
      hocs: [...newHOCs, ...existingHOCs]
    };
  } else {
    BlocksTable[name] = {
      name,
      hocs: newHOCs
    };
  }
}


/**
 * @name getBlock
 * @method
 * @summary Get a block registered with registerBlock({ name, component, hocs, region }).
 * @param {String} regionName The name of region the block belongs to.
 * @param {String} blockName The name of the block.
 * @returns {Function|React.Component} A (wrapped) React component
 * @memberof Components/Helpers
 */
export function getBlock(regionName, blockName) {
  const block = BlocksTable[regionName][blockName];

  if (!block) {
    throw new Error(`Block ${blockName} in region ${regionName} not registered.`);
  }

  const hocs = block.hocs.map((hoc) => (Array.isArray(hoc) ? hoc[0](hoc[1]) : hoc));

  return compose(...hocs, setDisplayName(`Reaction(${name})`))(block.rawComponent);
}

/**
 * @name getBlocks
 * @method
 * @summary Get a component registered with registerComponent(name, component, ...hocs).
 * @param {String} regionName The name of the region to get.
 * @returns {Function|React.Component} A (wrapped) React component
 * @memberof Components/Helpers
 */
export function getBlocks(regionName) {
  const region = BlocksTable[regionName];

  if (!region) {
    Logger.warn(`No blocks available for region named ${regionName}.`);
    return null;
  }

  const blocks = Object
    .values(region)
    .sort((blockA, blockB) => blockA.priority - blockB.priority)
    .map((block) => {
      const { rawComponent: rawComponent, name } = block;
      const hocs = block.hocs.map((hoc) => (Array.isArray(hoc) ? hoc[0](hoc[1]) : hoc));
      return compose(...hocs, setDisplayName(`ReactionBlock(${regionName}-${name})`))(rawComponent);
    });

  return blocks;
}


/**
 * @name replaceBlock
 * @method
 * @summary Replace a Reaction component with a new component and optionally add one or more higher order components.
 * This function keeps track of the previous HOCs and wraps the new HOCs around previous ones
 * @param {Object} options Object containing block information
 * @param {String} options.region The region of the block that will be replaced
 * @param {String} options.block The name of the block that will be replaced
 * @param {React.Component} options.component Interchangeable/extendable component.
 * @param {Function|Array} options.hocs The HOCs to compose with the raw component.
 * @returns {Function|React.Component} A component callable with Components[name]
 * @memberof Components/Helpers
 */
export function replaceBlock({ region, block, component, hocs = [] }) {
  const previousBlock = BlocksTable[region][block];

  if (!previousBlock) {
    throw new Error(`Block '${block}' of region ${region} not found. Use registerComponent to create it.`);
  }

  const newHocs = Array.isArray(hocs) ? hocs : [hocs];

  return registerBlock({
    name: block,
    region,
    component,
    hocs: [...newHocs, ...previousBlock.hocs]
  });
}


/**
 * @name getRawBlockComponent
 * @method
 * @summary Get the raw UI component without any possible HOCs wrapping it.
 * @param {String} regionName The name of the block region.
 * @param {String} blockName The name of the block component to get.
 * @returns {Function|React.Component} A React component
 * @memberof Components/Helpers
 */
export const getRawBlockComponent = (regionName, blockName) => BlocksTable[regionName][blockName].rawComponent;


/**
 * @name getBlockHOCs
 * @method
 * @summary Get the raw UI component without any possible HOCs wrapping it.
 * @param {String} regionName The name of the block region.
 * @param {String} blockName The name of the block component to get HOCs from.
 * @returns {Function|React.Component} Array of HOCs
 * @memberof Components/Helpers
 */
export const getBlockHOCs = (regionName, blockName) => BlocksTable[regionName][blockName].hocs;


/**
 * @name copyBlockHOCs
 * @method
 * @summary Wrap a new component with the HOCs from a different component
 * @param {String} sourceRegionName The name of the block region
 * @param {String} sourceBlockName The name of the block component to get the HOCs from
 * @param {Function|React.Component} targetBlock Block component to wrap
 * @returns {Function|React.Component} A new component wrapped with the HOCs of the source component
 * @memberof Components/Helpers
 */
export function copyBlockHOCs(sourceRegionName, sourceBlockName, targetBlock) {
  const sourceComponent = BlocksTable[sourceRegionName][sourceBlockName];
  return compose(...sourceComponent.hocs)(targetBlock);
}

/**
 * @name loadRegisteredBlocks
 * @method
 * @summary Populate the final BlockComponents object with the contents of the lookup table.
 * This should only be called once on app startup.
 * @returns {Object} An object containing all of the registered blocks by region
 * @memberof Components/Helpers
 **/
export function loadRegisteredBlocks() {
  Object.keys(BlocksTable).forEach((regionName) => {
    BlockComponents[regionName] = getBlocks(regionName);
  });
  return BlockComponents;
}
