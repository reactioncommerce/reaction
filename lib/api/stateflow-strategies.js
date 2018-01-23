
export const StateflowStrategyRegistry = {};

export function registerStrategy(name, strategy) {
  StateflowStrategyRegistry[name] = strategy;
}


/**
 * The StateflowStrategy uses Promises as return values, to allow developers to
 * customize it without bothering with Meteor's Tracker.
 */
class StateflowStrategy {
  constructor(options = { ignoreNonValidTransitions: true }) {
    // Thank you, SO!
    if (new.target === StateflowStrategy) {
      throw new TypeError("Cannot construct StateflowStrategy instances directly. Use subtype of it.");
    }
    if (this.pushNextState === undefined) {
      throw new TypeError("Concrete classes MUST override pushNextState. Return value MUST be a promise.");
    }
    this.options = options;
  }
}

class StateflowSimpleStrategy extends StateflowStrategy {
  constructor() {
    super(...arguments);
  }

  async pushNextState(stateflowName, transition) {
    let determinedTransition = transition;
    const transitions = this.transitions();
    if (transitions.length === 0) {
      // end of workflow.
      return;
    }

    if (!transition) {
      if (transitions.length > 1) {
        throw new Error("Workflow graph needs to be linear and must not contain branches. " +
          `Please change your workflow definition ${stateflowName} or use another StateflowStrategy`);
      }
      determinedTransition = transitions[0];
    } else {
      const cannotTransition = this.cannot(transition);
      if (cannotTransition) {
        if (this.options.ignoreNonValidTransitions) {
          return this.state;
        }
        throw Error(`Can't transition from ${this.state} to ${transition}`);
      }
    }

    // push to next state
    this[determinedTransition]();

    return this.state;
  }
}
registerStrategy("StateflowSimpleStrategy", StateflowSimpleStrategy);

// class StateflowServerExampleStrategy extends StateflowStrategy {
//   pushNextState(stateflow, transition) {
//     // Reach out to server asynchronously (in case this very code isn't already running there anyway)
//     // and do some custom and/or sensitive stuff
//
//     // Not sure if there's a way to write this with less boilerplate and also in a isomorphic way..
//     return new Promise((resolve, reject) => {
//       Meteor.call("workflow/myStrategy/pushNext", (error, transition) => {
//         // Result is the name of the transition to take next
//         if (error) {
//           reject(error);
//           return;
//         }
//
//         // push to next state
//         this[transition]();
//
//         resolve(this.state);
//       });
//     });
//   }
// }
