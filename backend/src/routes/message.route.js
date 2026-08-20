import { Router } from "express";
import {
    sendMessage,
    getMessages,
    getConversations
} from "../controllers/message.controller.js";
import { VerifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();

router.use(VerifyJWT);

router.route("/conversations").get(getConversations);
router.route("/:transactionId").post(sendMessage);
router.route("/:transactionId").get(getMessages);

export default router;
