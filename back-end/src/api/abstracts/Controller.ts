import { Router } from "express";
import { DocType } from "@prisma/client";

abstract class Controller {
  public router: Router;
  public mainRoute: string;
  public initializeRoutes() {}
  public docType: DocType;

  constructor(mainRoute: string, docType: DocType) {
    this.mainRoute = mainRoute;
    this.router = Router();
    this.docType = docType;
  }
}

export default Controller;
