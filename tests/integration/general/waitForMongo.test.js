import { checkWaitRetry } from "../../../.reaction/waitForMongo";

test("should work in immediate success case", async () => {
  const outLog = [];
  function out(message) {
    outLog.push(message);
  }
  async function check() {}
  try {
    await checkWaitRetry({ out, check, max: 2, waitMs: 10 });
  } catch (error) {
    expect(error).toBeFalsy();
    expect(outLog).toEqual([]);
  }
});

test("should work for timeout case with 1 progress dot", async () => {
  const outLog = [];
  function out(message) {
    outLog.push(message);
  }
  async function check() {
    throw new Error("unit-test-error");
  }
  try {
    await checkWaitRetry({ out, check, max: 12, waitMs: 10 });
    expect(false).toBeTruthy("Should have thrown");
  } catch (error) {
    expect(error).toBeTruthy();
    expect(error.message).toContain("Timed out");
    expect(outLog).toEqual(["unit-test-error", "."]);
  }
});

test("should retry until success before first progress dot", async () => {
  const outLog = [];
  function out(message) {
    outLog.push(message);
  }
  let failCount = 9;
  async function check() {
    failCount -= 1;
    if (failCount >= 0) {
      throw new Error("unit-test-error");
    }
  }
  try {
    await checkWaitRetry({ out, check, waitMs: 10 });
    expect(outLog).toEqual(["unit-test-error"]);
  } catch (error) {
    expect(error).toBeFalsy();
  }
});

test("should retry until success with progress dots", async () => {
  const outLog = [];
  function out(message) {
    outLog.push(message);
  }
  let failCount = 30;
  async function check() {
    failCount -= 1;
    if (failCount >= 0) {
      throw new Error("unit-test-error");
    }
  }
  try {
    await checkWaitRetry({ out, check, max: 40, waitMs: 10 });
    expect(outLog).toEqual(["unit-test-error", ".", ".", "."]);
  } catch (error) {
    expect(error).toBeFalsy();
  }
});
