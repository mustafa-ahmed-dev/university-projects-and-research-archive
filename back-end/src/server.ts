import App from "./api";
import config from "./config";

import CollegeController from "./api/college/college.controller";
import DepartmentController from "./api/department/department.controller";
import UserController from "./api/user/user.controller";
import PermissionController from "./api/permission/permission.controller";
import SupervisorController from "./api/supervisor/supervisor.controller";
import ProjectController from "./api/project/project.controller";
import StudentController from "./api/student/student.controller";

const app = new App(
  [
    new CollegeController(),
    new DepartmentController(),
    new UserController(),
    new PermissionController(),
    new SupervisorController(),
    new ProjectController(),
    new StudentController(),
  ],
  config.api.port
);

app.listen();
