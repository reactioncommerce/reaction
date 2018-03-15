import { expect } from "meteor/practicalmeteor:chai";
import { sinon } from "meteor/practicalmeteor:sinon";
import { DDP } from "meteor/ddp-client";
import ConnectionDataStore from "./connectionDataStore";

describe("ConnectionDataStore", () => {
  describe("used outside of a connection", () => {
    it("sets/gets cached data", () => {
      ConnectionDataStore.set("key", "val");

      expect(ConnectionDataStore.get("key")).to.equal("val");
    });

    it("clears cached data", () => {
      ConnectionDataStore.set("key", "val");

      expect(ConnectionDataStore.get("key")).to.equal("val");

      ConnectionDataStore.clear("key");

      expect(ConnectionDataStore.get("key")).to.be.undefined;
    });
  });

  describe("within the context of a connection", () => {
    let mockConnection;

    beforeEach(() => {
      mockConnection = {};

      sinon.stub(DDP._CurrentMethodInvocation, "get")
        .returns({ connection: mockConnection });

      ConnectionDataStore.set("key", "val");
    });

    afterEach(() => {
      mockConnection = undefined;

      DDP._CurrentMethodInvocation.get.restore();
    });

    it("sets/gets cached data", () => {
      expect(ConnectionDataStore.get("key")).to.equal("val");
    });

    it("stores data on the connection object", () => {
      expect(mockConnection["connection-data"].key).to.equal("val");
    });
  });

  describe("within the context of a multiple connections", () => {
    let mockConnection;
    let mockConnection2;

    beforeEach(() => {
      mockConnection = {};
      mockConnection2 = {};

      sinon.stub(DDP._CurrentMethodInvocation, "get")
        .returns({ connection: mockConnection });

      ConnectionDataStore.set("key", "val");

      DDP._CurrentMethodInvocation.get.restore();

      sinon.stub(DDP._CurrentMethodInvocation, "get")
        .returns({ connection: mockConnection2 });

      ConnectionDataStore.set("key2", "val2");
    });

    afterEach(() => {
      mockConnection = undefined;
      mockConnection2 = undefined;

      DDP._CurrentMethodInvocation.get.restore();
    });

    // we are now in the context of the second connection
    it("does not access previous connection's data", () => {
      expect(ConnectionDataStore.get("key")).to.be.undefined;
    });

    it("does not modify previous connection's data", () => {
      expect(mockConnection["connection-data"]).not.to.have.property("key2");
    });

    it("does modify _this_ connection's data", () => {
      expect(ConnectionDataStore.get("key2")).to.equal("val2");
      expect(mockConnection2["connection-data"].key2).to.equal("val2");
    });
  });
});
