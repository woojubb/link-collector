import express from "express";
import linkHandler from "./link";
const router = express.Router();

router.get('/', (req, res) => {
    const response = {message: "Hello"};
    res.json({ response });
});

router.get('/rss', (req, res) => {
    const response = {message: "rss"};
    res.json({ response });
});

router.use('/link', linkHandler);

export default router;