import { Router } from "express";
import { getReport } from "../controllers/report.controller";

const reportRouter = Router();

reportRouter.get("/", getReport);

export default reportRouter;
