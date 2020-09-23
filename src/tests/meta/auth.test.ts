import { project } from "../global";
import * as path from "path";
describe("Auth", () => {
  test("addItem", () => {
    expect(project.auth.load()).toEqual({});
    project.auth.addItem("a");
    expect(project.auth.load()).toEqual({ a: true });
  });
  test("removeItem", () => {
    project.auth.removeItem("a");
    expect(project.auth.load()).toEqual({});

    project.auth.removeItem("a");
    expect(project.auth.load()).toEqual({});
  });
  test("path", () => {
    expect(project.auth.fullPath).toEqual(
      path.join(project.fullPath, ".vusion/auth-cache.json")
    );
  });
});
