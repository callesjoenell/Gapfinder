import { describe, it, expect } from "vitest";
import { computeCurrentPriceCents } from "./pricing";

const MS_PER_WEEK = 7 * 24 * 60 * 60 * 1000;
const LAUNCH = 1_700_000_000_000; // arbitrary fixed launch date

describe("computeCurrentPriceCents", () => {
  it("returns 200 cents ($2) before launch date", () => {
    const before = LAUNCH - 1;
    expect(computeCurrentPriceCents(LAUNCH, before)).toBe(200);
  });

  it("returns 200 cents ($2) on launch day (week 0)", () => {
    expect(computeCurrentPriceCents(LAUNCH, LAUNCH)).toBe(200);
  });

  it("returns 200 cents when nowMs equals launchDate exactly", () => {
    expect(computeCurrentPriceCents(LAUNCH, LAUNCH)).toBe(200);
  });

  it("returns 400 cents ($4) after 7 days (week 1)", () => {
    const week1 = LAUNCH + MS_PER_WEEK;
    expect(computeCurrentPriceCents(LAUNCH, week1)).toBe(400);
  });

  it("returns 800 cents ($8) after 14 days (week 2)", () => {
    const week2 = LAUNCH + 2 * MS_PER_WEEK;
    expect(computeCurrentPriceCents(LAUNCH, week2)).toBe(800);
  });

  it("returns 1600 cents ($16) after 21 days (week 3)", () => {
    const week3 = LAUNCH + 3 * MS_PER_WEEK;
    expect(computeCurrentPriceCents(LAUNCH, week3)).toBe(1600);
  });

  it("returns 3200 cents ($32) after 28 days (week 4)", () => {
    const week4 = LAUNCH + 4 * MS_PER_WEEK;
    expect(computeCurrentPriceCents(LAUNCH, week4)).toBe(3200);
  });

  it("returns 6400 cents ($64) after 35 days (week 5)", () => {
    const week5 = LAUNCH + 5 * MS_PER_WEEK;
    expect(computeCurrentPriceCents(LAUNCH, week5)).toBe(6400);
  });

  it("caps at 6400 cents ($64) — never exceeds maximum (week 6+)", () => {
    const week6 = LAUNCH + 6 * MS_PER_WEEK;
    expect(computeCurrentPriceCents(LAUNCH, week6)).toBe(6400);
  });

  it("caps at 6400 cents far in the future", () => {
    const farFuture = LAUNCH + 52 * MS_PER_WEEK;
    expect(computeCurrentPriceCents(LAUNCH, farFuture)).toBe(6400);
  });

  it("returns 200 when nowMs defaults to current time and launch is far future", () => {
    const futureDate = Date.now() + 30 * 24 * 60 * 60 * 1000;
    expect(computeCurrentPriceCents(futureDate)).toBe(200);
  });
});
