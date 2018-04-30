import mockContext from "/imports/test-utils/helpers/mockContext";
import findRevision from "./findRevision";

const mockCollections = { ...mockContext.collections };
const mockDocumentId = "999";

const createdAt = new Date("2018-04-16T15:34:28.043Z");
const updatedAt = new Date("2018-04-17T15:34:28.043Z");

const mockRevision = {
  _id: "333",
  documentId: mockDocumentId,
  documentData: {
    _id: mockDocumentId
  },
  workflow: {
    status: "revision/published"
  },
  documentType: "product",
  createdAt,
  updatedAt,
  diff: []
};

test("expect to return a Promise that resolves to a Product Revision object", async () => {
  mockCollections.Revisions.findOne.mockReturnValueOnce(Promise.resolve(mockRevision));
  const spec = await findRevision(mockDocumentId, mockCollections);
  expect(spec).toEqual(mockRevision);
});
