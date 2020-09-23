import chalk = require("chalk");
import * as path from "path";
import actions from "./actions";
import NodePlop from "..";
export default function (plop: NodePlop.API): any {
  const project = plop.$project;
  const pages = project.page.loadListPath();
  return {
    prompts: [
      {
        type: "list",
        name: "page",
        required: true,
        message: "请选择入口页",
        choices: pages,
        when(): boolean {
          return pages.length > 1;
        },
      },
      {
        type: "input",
        name: "path",
        required: true,
        message: "请输入页面访问路径",
        validate(value: string): boolean | string {
          if (value) {
            return true;
          }
          return "请输入页面访问路径";
        },
      },
      {
        type: "input",
        name: "title",
        message: "请输入页面标题",
      },
    ],
    actions(answers: any): ReturnType<typeof actions.add> {
      answers.page = answers.page || pages[0];
      const { path: pagePath } = answers;
      return [
        ...actions.add(answers, project),
        [
          `页面 ${chalk.blue(path.join(pagePath, "index.vue"))} 已经添加成功。`,
          `需要注意以下几点：`,
          `  入口 JS 文件为 ${chalk.yellow(
            `src/views/${answers.page}/views/${answers.path}/index.vue`
          )}`,
        ].join("\n"),
      ];
    },
  };
}
