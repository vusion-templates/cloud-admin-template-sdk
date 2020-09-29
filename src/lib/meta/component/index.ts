import Utils, { PlopConfig } from "../utils";
export interface AddComponent {
  name: string;
  directory: string;
}
export default class Component {
  static add(answers: AddComponent, config: PlopConfig): Promise<any> {
    const plop = Utils.getPlop(config);
    return plop
      .getGenerator("add-component")
      .runActions(answers)
      .then((data) => {
        if (data.failures && data.failures.length) {
          throw data.failures
            .map((e) => {
              if (!e) {
                return "";
              } else if (e.message) {
                return e;
              } else {
                return JSON.stringify(e);
              }
            })
            .join("\n");
        }
        return data;
      });
  }
}
