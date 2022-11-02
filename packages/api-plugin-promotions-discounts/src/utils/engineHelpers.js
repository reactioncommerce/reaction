import { Engine } from "json-rules-engine";

/**
 * @summary Add the custom operators to the engine
 * @param {Object} context - The application context
 * @param {Object} rules - The rule to add the operators to
 * @returns {Object} Engine - The engine with the operators added
 */
export default function createEngine(context, rules) {
  const engine = new Engine();
  const { promotions: { operators } } = context;
  Object.keys(operators).forEach((operatorKey) => {
    engine.addOperator(operatorKey, operators[operatorKey]);
  });

  engine.addRule({
    ...rules,
    event: {
      type: "rulesCheckPassed"
    }
  });

  return engine;
}
