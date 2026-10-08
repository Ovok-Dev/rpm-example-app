import test from "node:test";
import assert from "node:assert/strict";
import {
  completedKinds,
  demoEntry,
  initialDemoDiary,
  localDay,
  parseDiary,
  validateAnswers,
} from "../src/model.ts";

test("daily completion resets at the local calendar boundary", () => {
  const beforeMidnight = new Date(2026, 9, 8, 23, 59);
  const nextMorning = new Date(2026, 9, 9, 8);
  assert.equal(
    completedKinds([demoEntry("ecg", beforeMidnight)], nextMorning).size,
    0,
  );
});

test("two ECG readings count as one daily task", () => {
  const now = new Date();
  assert.equal(
    completedKinds(
      [demoEntry("ecg", now), demoEntry("ecg", new Date(now.getTime() + 1))],
      now,
    ).size,
    1,
  );
});

test("seeded history leaves today available to complete", () => {
  const now = new Date(2026, 9, 8, 11);
  assert.equal(completedKinds(initialDemoDiary(now), now).size, 0);
});

test("questionnaire requires all three supported answers", () => {
  assert.equal(
    validateAnswers({ breathing: "As usual", swelling: "No swelling" }),
    false,
  );
});

test("a demo reading survives persistence", () => {
  const entry = demoEntry("weight");
  assert.deepEqual(parseDiary(JSON.stringify([entry])), [entry]);
});

test("stored history is read with the newest record first", () => {
  const history = initialDemoDiary(new Date(2026, 9, 8));
  assert.equal(
    parseDiary(JSON.stringify(history.reverse()))[0]?.recordedAt,
    new Date(2026, 9, 7, 8, 15).toISOString(),
  );
});

test("a corrupt record is rejected instead of replacing the diary", () => {
  assert.throws(() => parseDiary('[{"kind":"weight","weight":null}]'));
});

test("non-finite waveform samples are rejected", () => {
  assert.throws(() =>
    parseDiary(JSON.stringify([{ ...demoEntry("ecg"), waveform: [0, null] }])),
  );
});

test("local day uses the local calendar", () => {
  assert.equal(localDay(new Date(2026, 9, 8, 0, 1)), "2026-10-8");
});
