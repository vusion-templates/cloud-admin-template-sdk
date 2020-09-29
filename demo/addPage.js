const { Project } = require("../dist/lib/index");
const path = require("path");
async function b() {
  const project = new Project(
    path.join(__dirname, "../../cloud-admin-template")
  );
  await project.page.add({
    name: "aaaa",
    title: "xxx",
    auth: true,
    template: "login-page",
  });
  console.log("addPage");
}
b();
