// import { getMockDoc } from "simpl-schema-mockdoc";

import _ from "lodash";
import faker from "faker";
import SimpleSchema from "simpl-schema";

SimpleSchema.extendOptions(["mockValue"]);

const getMockDoc = (schema, prefix, addId) => {
  const docPrefix = prefix || "mock";
  const mockDoc = {};
  const model = schema._schema;

  // const seed = _.chain(docPrefix)
  //   .split("")
  //   .map((char) => char.charCodeAt())
  //   .sum()
  //       .value();

  // const seed = _.flow(_.split(""), _.map((char) => char.charCodeAt()), _.sum())(docPrefix);

  const seed = Array.prototype.reduce.cal(docPrefix, (sum, char) => sum + char.charCodeAt(), 0);

  faker.seed(seed);

  if (process.env.NODE_ENV !== "test" || !schema) {
    return mockDoc;
  }

  Object.keys(model).forEach((key) => {
    let fieldValue = null;

    // If field defined by parent
    const currentMockValue = _.get(mockDoc, `${key.replace(".$", ".0")}`);
    if (!_.isUndefined(currentMockValue, key)) {
      return;
    }

    const defField = _.get(model[key], "type.definitions[0]") || model[key];

    try {
      if (model[key].mockValue !== undefined) {
        fieldValue = model[key].mockValue;
      } else if (model[key].defaultValue !== undefined) {
        fieldValue = model[key].defaultValue;
      } else if (model[key].autoValue !== undefined) {
        fieldValue = model[key].autoValue.call({ operator: null });
      } else if (Array.isArray(defField.allowedValues)) {
        fieldValue = defField.allowedValues[0];
      } else {
        throw new Error("Invalid");
      }
    } catch (err) {
      // Need 'defField' for field like: `key: Boolean`
      const fieldType = defField.type || defField;

      switch (fieldType) {
        case Date:
          fieldValue = new Date(faker.random.number() * 1000);
          break;

        case Number:
        case SimpleSchema.Integer:
          fieldValue = defField.min || defField.max || faker.random.number();
          break;

        case String:
          fieldValue = `${docPrefix}${_.upperFirst(_.camelCase(key))}`;
          if (defField.regEx) {
            switch (String(defField.regEx)) {
              case String(String(SimpleSchema.RegEx.Email)):
              case String(String(SimpleSchema.RegEx.EmailWithTLD)):
                fieldValue = faker.internet.email();
                break;

              case String(SimpleSchema.RegEx.Domain):
              case String(SimpleSchema.RegEx.WeakDomain):
                fieldValue = `${faker.internet.domainName()}${faker.internet.domainWord()}`;
                break;

              case String(SimpleSchema.RegEx.IP):
              case String(SimpleSchema.RegEx.IPv4):
                fieldValue = faker.internet.ip();
                break;

              case String(SimpleSchema.RegEx.IPv6):
                fieldValue = faker.internet.ipv6();
                break;

              case String(SimpleSchema.RegEx.Url):
                fieldValue = faker.internet.url();
                break;

              case String(SimpleSchema.RegEx.Id):
                fieldValue = faker.random.alphaNumeric(17);
                break;

              case String(SimpleSchema.RegEx.ZipCode):
                fieldValue = faker.address.zipCode();
                break;

              case String(SimpleSchema.RegEx.Phone):
                fieldValue = key.match(/mobile/i)
                  ? faker.phone.phoneNumber("074## ######")
                  : faker.phone.phoneNumber("012## ######");
                break;

              default:
                break;
            }
          }
          break;

        case Boolean:
          fieldValue = defField.defaultValue !== undefined ? defField.defaultValue : faker.random.boolean();
          break;

        case Object: {
          fieldValue = {};
          break;
        }

        case Array:
          fieldValue = [];
          break;

        default:
          if (fieldType instanceof SimpleSchema || _.get(fieldType, "_schema")) {
            fieldValue = getMockDoc(fieldType, prefix);
          }
          break;
      }
    }

    _.set(mockDoc, key.replace(".$", ".0"), fieldValue);
  });

  if (addId) {
    mockDoc._id = faker.random.alphaNumeric(17);
  }

  return mockDoc;
};

const clearMockValues = (schema) => {
  if (process.env.NODE_ENV === "test") {
    return schema;
  }

  _.each(schema._schema, (field, key) => {
    schema._schema[key] = _.omit(field, "mockValue");
  });
  return schema;
};

/**
 * @const {Object} Factory - todo
 * @todo write const desciption
 */
export const Factory = {};

/**
 * @name createFactoryForSchema
 * @function
 * @summary Creates Factory[propName] for building fake documents with the given schema.
 * @param {String} propName The property name to add to the `Factory` object. This should match the
 *   schema variable's name.
 * @param {SimpleSchema} schema A SimpleSchema instance
 */
export function createFactoryForSchema(propName, schema) {
  // eslint-disable-next-line
  if (Factory.hasOwnProperty(propName)) {
    throw new Error(`Factory already has a "${propName}" property`);
  }

  console.log("factory created?", propName);

  Factory[propName] = {
    makeOne(props) {
      const doc = getMockDoc(schema, "mock", true);
      Object.assign(doc, props);
      return doc;
    },
    makeMany(length, props) {
      return Array.from({ length }).map(() => this.makeOne(props));
    }
  };
}
