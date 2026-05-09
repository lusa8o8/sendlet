import { Router, type IRouter } from "express";
import healthRouter from "./health";
import deliverRouter from "./deliver";

const router: IRouter = Router();

router.use(healthRouter);
router.use(deliverRouter);

export default router;
