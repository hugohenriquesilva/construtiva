import { describe, expect, it } from "vitest";

import { getEmptyStateMascotSize } from "../src/utils/emptyStateMascot";

describe("empty-state mascot sizing", () => {
  it("uses a consistent aspect ratio and responsive width across available space", () => {
    const size = getEmptyStateMascotSize(400, 600);

    expect(size.width).toBeCloseTo((400 - 48) * 0.44);
    expect(size.height).toBeCloseTo(size.width / (175 / 209));
  });

  it("shrinks to fit short screens without exceeding the available height", () => {
    const size = getEmptyStateMascotSize(400, 180);

    expect(size.height).toBeCloseTo(180 * 0.42);
    expect(size.width).toBeLessThan(400);
  });

  it("caps large mascot frames to the source image width", () => {
    const size = getEmptyStateMascotSize(900, 900);

    expect(size.width).toBe(175);
    expect(size.height).toBeCloseTo(209);
  });

  it("keeps the same character height when the source image includes a speech balloon", () => {
    const withoutBalloon = getEmptyStateMascotSize(400, 600);
    const withBalloon = getEmptyStateMascotSize(400, 600, 1102 / 960);

    expect(withBalloon.height).toBeCloseTo(withoutBalloon.height);
    expect(withBalloon.width).toBeCloseTo(withBalloon.height * (1102 / 960));
  });
});
