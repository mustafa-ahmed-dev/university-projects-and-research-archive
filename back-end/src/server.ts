import App from "./api";
import config from "./config";

import CollegeController from "./api/college/college.controller";

const app = new App([new CollegeController()], config.api.port);

app.listen();
