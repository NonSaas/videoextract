import express from "express";
import { extractVideoSource } from "../controllers/videoController";

const router = express.Router();

router.post("/extract", extractVideoSource);

export default router;
