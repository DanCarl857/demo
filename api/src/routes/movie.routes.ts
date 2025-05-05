import { Router } from "express";
import syncData from "../controllers/syncData.controller";
import getData from "../controllers/getData.controller";

const router = Router();

router.post("/sync", syncData);
router.get("/search", getData);

export default router;
