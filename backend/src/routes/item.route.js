import { Router } from "express";
import {
    createItem,
    updateItem,
    deleteItem,
    markUnavailable,
    getMyItems,
    getAllItems,
    getItemById
} from "../controllers/item.controller.js";
import { upload } from "../middlewares/multer.middleware.js";
import { VerifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();

// Public browsing routes
router.route("/").get(getAllItems);
router.route("/:itemId").get(getItemById);

// Protected routes (require login)
router.use(VerifyJWT);
router.route("/").post(upload.array("photos", 5), createItem);
router.route("/my-items").get(getMyItems);
router.route("/:itemId").patch(updateItem);
router.route("/:itemId").delete(deleteItem);
router.route("/:itemId/availability").patch(markUnavailable);

export default router;
