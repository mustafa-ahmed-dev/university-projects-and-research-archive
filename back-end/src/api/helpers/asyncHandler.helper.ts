// import logger from "./logger.helper";
// import prismaErrorHandler from "./prismaErrorHandler.helper";

async function asyncHandler<Type>(promise: Promise<Type>) {
  try {
    const data = await promise;
    return [data, null];
  } catch (error) {
    // prismaErrorHandler(error);
    // console.error(error);
    // logger.log("error", error.message);
    return [null, error];
  }
}

export default asyncHandler;
