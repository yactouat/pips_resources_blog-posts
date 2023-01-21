import fs from "fs";

import postIsMoreRecent from "../../src/meta/post-is-more-recent";

describe("post is more recent tests", () => {
  test("a post updated the same day is more recent if hour is specified", () => {
    const somePostUpdated = fs.readFileSync(
      "tests/post-is-more-recent/some-post-updated.md",
      "utf8"
    );
    const somePost = fs.readFileSync(
      "tests/post-is-more-recent/some-post.md",
      "utf8"
    );
    expect(postIsMoreRecent(somePostUpdated, somePost)).toBe(true);
  });

  test("multiple updates per day are allowed", () => {
    const somePostUpdated = fs.readFileSync(
      "tests/post-is-more-recent/some-post-updated.md",
      "utf8"
    );
    const somePostUpdatedEarlier = fs.readFileSync(
      "tests/post-is-more-recent/some-post-updated-earlier.md",
      "utf8"
    );
    expect(postIsMoreRecent(somePostUpdated, somePostUpdatedEarlier)).toBe(
      true
    );
  });
});
