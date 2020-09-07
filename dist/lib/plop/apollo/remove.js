"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function default_1(plop) {
    const project = plop.$project;
    return {
    // prompts: [
    //     {
    //         type: 'list',
    //         name: 'name',
    //         message: '请输入数据实体名称',
    //         required: true,
    //         choices: project.apollo.loadEntityGQLFilePath(name),
    //     },
    // ],
    // actions(answers): ReturnType<typeof actions.removeEntity> {
    //     return [
    //         ...actions.removeEntity(answers, project),
    //         [
    //             `接口${chalk.blue(answers.name)} 已经被删除。`
    //         ].join('\n'),
    //     ];
    // },
    };
}
exports.default = default_1;
