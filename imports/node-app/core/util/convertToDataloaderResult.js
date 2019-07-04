import _ from "lodash";

export default function convertToDataloaderResult(requestedIds, returnedItems, key = "id") {
    const byId = _.keyBy(returnedItems, key);
    return requestedIds.map(id => byId[id] === undefined ? null : byId[id]);
}