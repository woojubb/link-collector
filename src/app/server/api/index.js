import express from "express";
import handler from "./v1";
const router = express.Router();

router.use('/v1', handler);

export default router;