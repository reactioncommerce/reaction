import {check, Match} from "meteor/check";
import {Meteor} from "meteor/meteor";
import {Tracker} from "meteor/tracker";
import {default as StateMachine} from "javascript-state-machine";
import {Reaction} from "/lib/api";
import {StateflowSimpleStrategy} from "/lib/api/stateflow-strategies";
import {Packages, Stateflows} from "../collections";
//


//check(workflow, Schemas.Workflow);


function getWorkflowStateFromDoc(doc, locationPath) {
  // Review: Assume that it's always the first billing object we're interested in
  // ( after filtered via Reaction.getShopId() )
  const statusLocation = locationPath.replace(/\.\$/, "[0]") + ".status";
  const state = statusLocation.split(/\.|\[(\d)\]/).reduce((o, i, index) => {
    if (index % 2) {
      if (i === undefined) {
        return o;
      }
    } else {
      if (i === "") {
        return o;
      }
    }
    return o[i];
  }, doc);
  return state;
}

function findLayoutsForStateflow(stateflowName, workflowName) {
  const stateflow = Stateflows.findOne({
    name: stateflowName
  });
  const layouts = [];
  function pushLayouts(packages) {
    for (const transition of stateflow.fsm.transitions) {
      for (const pkg of packages) {
        for (const layout of pkg.layout) {
          if (layout.state === transition.from ||
            layout.state === transition.to) {
            layouts.push(layout);
          }
        }
      }
    }
  }

  // First get layouts of package's workfow-steps. They have precedence, even if there're
  // other visual representations for this workflow-step from other packages.
  const ownPackage = Packages.find({
    "layout.state": { $exists: true },
    "layout.workflow": workflowName,
    ["settings." + stateflowName]: { $exists: true }
  }).fetch();
  pushLayouts(ownPackage);

  // Visual representations of workflow-steps can be inherited. This is why we're looking
  // for components in other packages.
  const otherPackages = Packages.find({
    "layout.state": { $exists: true },
    "layout.workflow": workflowName,
    ["settings." + stateflowName]: { $exists: false }
  }).fetch();
  pushLayouts(otherPackages);

  const sortedLayouts = layouts.sort((prev, next) => prev.priority - next.priority);
  return sortedLayouts;
}

export const stateflowTransform = {
  create(options) {
    const stateflowName = this.name;
    const doc = options.doc;
    let persistedWorkflowState = doc && getWorkflowStateFromDoc(doc, this.locationPath);
    if (persistedWorkflowState === "new") {
      // Don't take the Workflow schema's default value (this should be empty anyway).
      persistedWorkflowState = undefined;
    }
    const stateflow = new StateMachine({
      ...this.fsm,
      init: options && options.init || persistedWorkflowState || this.fsm.init
    });

    let stateflowStrategy;
    if (options && options.stateflowStrategy) {
      // If stateflowStrategy is a constructor Function,
      // we're instantiating it on behalf of the caller
      if (typeof options.stateflowStrategy === "function") {
        stateflowStrategy = new options.stateflowStrategy();
      } else {
        stateflowStrategy = options.stateflowStrategy;
      }
    }
    if (!stateflowStrategy) {
      stateflowStrategy = new StateflowSimpleStrategy();
    }

    const layouts = findLayoutsForStateflow(stateflowName, this.workflow);
    const dep = new Tracker.Dependency();

    // Public API of instantiated stateflow (a.k.a. workflow).
    // This object is can also be made reactive via depend().
    const prototype = {
      /**
       *
       * @param options save: Will have no effect when used on client side in reactive computation via depend(),
       *                      because we're going to save it every time whatsoever to prevent confusion.
       *                      Otherwise the state would be lost and workflow would have first init state after tracker run.
       */
      // eslint-disable-next-line no-shadow
      pushNextState(transition, options = {save: true}) {
        const oldState = stateflow.state;
        stateflowStrategy.pushNextState
          .call(stateflow, stateflowName, transition)
          .then((newState) => {
            if (newState !== oldState) {
              if (doc && (options.save || this.isReactive)) {
                // Update collection on server
                Meteor.call("workflow/saveState", stateflowName, doc._id, oldState, newState, () => {
                  // Will result in throwing `this` instance away and **re-initialize** with fresh data from server.
                  dep.changed();
                });
              } else {
                dep.changed();
              }
            }
          });
      },
      depend() {
        this.isReactive = true;
        dep.depend();
      },
      get state() {
        return stateflow.state;
      },
      get component() {
        // Fetch the appropriate React component name to render the current workflow step,
        // if applicable.

        // TODO MJ: Review. Not sure, but somehow including at top throws errors.
        import { Components } from "@reactioncommerce/reaction-components";

        const workflowStep = layouts.find((elem) => {
          return elem.state === stateflow.state;
        });

        if (!workflowStep) {
          return undefined;
        }

        const componentName = workflowStep.template;
        const component = componentName && Components[componentName];
        if (!component) {
          return null;
        }
        return component;
      }
    };
    prototype.pushNextState.bind(stateflow);
    const wf = Object.create(prototype, {
      isReactive: {
        value: false,
        enumerable: true,
        writable: true
      }
    });
    return wf;
  }
};
