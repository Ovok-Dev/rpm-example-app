import test from "node:test";
import assert from "node:assert/strict";
import {
  ReadingInbox,
  type ReadingInboxState,
} from "../src/device-readings.ts";
import { demoEntry, type DiaryEntry } from "../src/model.ts";

function deviceReading(id: string): DiaryEntry {
  return { ...demoEntry("weight"), id, source: "device", sync: "pending" };
}

test("a failed local save retains the device reading", async () => {
  let state: ReadingInboxState = { entries: [], busy: false };
  const reading = deviceReading("first");
  const inbox = new ReadingInbox(
    async () => {
      throw new Error("Storage unavailable");
    },
    (next) => {
      state = next;
    },
  );
  await inbox.receive(reading).catch(() => {});
  assert.deepEqual(state, { entries: [reading], busy: false });
});

test("a later device result keeps earlier failed readings available", async () => {
  let state: ReadingInboxState = { entries: [], busy: false };
  const first = deviceReading("first");
  const second = deviceReading("second");
  const inbox = new ReadingInbox(
    async () => {
      throw new Error("Storage unavailable");
    },
    (next) => {
      state = next;
    },
  );
  await inbox.receive(first).catch(() => {});
  await inbox.receive(second).catch(() => {});
  assert.deepEqual(state.entries, [first, second]);
});

test("retry saves the original reading after storage recovers", async () => {
  let available = false;
  const stored: DiaryEntry[] = [];
  const reading = deviceReading("first");
  const inbox = new ReadingInbox(
    async (entry) => {
      if (!available) throw new Error("Storage unavailable");
      stored.push(entry);
    },
    () => {},
  );
  await inbox.receive(reading).catch(() => {});
  available = true;
  await inbox.retry(reading);
  assert.deepEqual(stored, [reading]);
});

test("a successful retry clears only the recovered reading", async () => {
  let state: ReadingInboxState = { entries: [], busy: false };
  let recoveredId: string | undefined;
  const first = deviceReading("first");
  const second = deviceReading("second");
  const inbox = new ReadingInbox(
    async (entry) => {
      if (entry.id !== recoveredId) throw new Error("Storage unavailable");
    },
    (next) => {
      state = next;
    },
  );
  await inbox.receive(first).catch(() => {});
  await inbox.receive(second).catch(() => {});
  recoveredId = first.id;
  await inbox.retry(first);
  assert.deepEqual(state, { entries: [second], busy: false });
});
