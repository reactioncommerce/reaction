import { Engine } from "json-rules-engine";
import accounting from "accounting-js";

/**
 * @summary return items from the cart that meet inclusion criteria
 * @param {Object} context - The application context
 * @param {Object} cart - the cart to evaluate for eligible items
 * @param {Object} inclusionRule - the rule to evaluate against
 * @return {Promise<Array<Object>>} - An array of eligible cart items
 */
export async function getEligibleItems(context, cart, inclusionRule) {
  const eligibleItems = [];
  const engine = new Engine();
  engine.addRule({
    ...inclusionRule,
    event: {
      type: "rulesCheckPassed"
    }
  });
  for (const item of cart.items) {
    const facts = { item };

    // eslint-disable-next-line no-await-in-loop
    const results = await engine.run(facts);
    const { failureResults } = results;
    if (failureResults.length === 0) {
      eligibleItems.push(item);
    }
  }
  return eligibleItems;
}

/**
 * @summary exclude items excluded by rule
 * @param {Object} context - The application context
 * @param {Array<Object>} eligibleItems - Items to evaluate
 * @param {Object} exclusionRule - the rule to use
 * @return {Promise<Array<Object>>} - The items with excluded items removed
 */
export async function removeIneligibleItems(context, eligibleItems, exclusionRule) {
  const engine = new Engine();
  engine.addRule({
    ...exclusionRule,
    event: {
      type: "rulesCheckPassed"
    }
  });
  const filteredItems = [];
  for (const item of eligibleItems) {
    const facts = { item };
    // eslint-disable-next-line no-await-in-loop
    const { events } = await engine.run(facts);
    if (events.length === 0) {
      filteredItems.push(item);
    }
  }
  return filteredItems;
}

/**
 * @summary calculate the total of items that are eligible for this promotion
 * @param {Object} context - The application context
 * @param {Object} cart - the cart to evaluate for eligible items
 * @param {Object} inclusionRule - the rule to evaluate against
 * @param {Object} exclusionRule - the rule to use
 * @return {Promise<number>} - The merchandise total of eligible items
 */
export default async function calculateEligibleTotal(context, cart, inclusionRule, exclusionRule) {
  const eligibleItems = [];
  if (!inclusionRule) {
    eligibleItems.push(...cart.items);
  } else {
    const items = await getEligibleItems(context, cart, inclusionRule);
    eligibleItems.push(...items);
  }

  if (eligibleItems.length === 0) return 0;
  let filteredItems;
  if (exclusionRule) {
    filteredItems = await removeIneligibleItems(context, eligibleItems, exclusionRule);
  } else {
    filteredItems = eligibleItems;
  }
  const eligibleTotal = filteredItems.reduce((prev, current) => prev + current.price.amount * current.quantity, 0);
  return Number(accounting.toFixed(eligibleTotal, 2));
}
