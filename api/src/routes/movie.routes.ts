import { Router } from "express";
import syncData from "../controllers/syncData.controller";
import getData from "../controllers/getData.controller";

const router = Router();

router.get("/search", getData);
router.get("/sync", syncData);

export default router;
