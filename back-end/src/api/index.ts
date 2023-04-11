import express from "express";
import cors from "cors";
import { PrismaClient } from "@prisma/client";
import helmet from "helmet";

import apiLimiter from "./middleware/apiLimiter.middleware";
import Controller from "./abstracts/Controller";
import errorMiddleware from "./middleware/errorHandler.middleware";
import notFoundMiddleware from "./middleware/notFound.middleware";

class App {
  public app: express.Application;
  public port: number;

  constructor(controllers: Controller[], port: number) {
    this.app = express();
    this.port = port;

    this.initializeMiddleware();
    this.initializeControllers(controllers);
    this.initializeErrorHandling();
    this.app.use(notFoundMiddleware);
  }

  private initializeMiddleware() {
    this.app.use(cors());
    this.app.use(helmet());
    this.app.use(express.json());
    this.app.use(express.urlencoded({ extended: true })); // Apply the rate limiting middleware to API calls only
    this.app.use(apiLimiter);

    // put all middleware here
  }

  private initializeErrorHandling() {
    this.app.use(errorMiddleware);
  }

  private async connectDB() {
    const prisma = new PrismaClient();
    await prisma.$connect();
  }

  public async listen() {
    try {
      await this.connectDB();

      console.log("Database connected successfully");
    } catch (error) {
      console.error(error);
      process.exit(1);
    }

    this.app.listen(this.port, () => {
      console.log(`App is listening on port ${this.port}`);
    });
  }

  private initializeControllers(controllers: Controller[]) {
    controllers.forEach((controller) => {
      this.app.use(controller.mainRoute, controller.router);
    });
  }
}

export default App;
