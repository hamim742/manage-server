import { Router } from "express";
import * as linkController from "./link.controller";
import { authenticate, authorizeAdmin } from "../../middleware/authenticate";

export const linkRoutes = Router();

// All link routes are admin-only
linkRoutes.use(authenticate, authorizeAdmin);

linkRoutes.post("/bulk", linkController.bulkAddLinks);
linkRoutes.get("/", linkController.getLinksByProduct);
linkRoutes.delete("/clear", linkController.deleteAllUnusedLinks);
linkRoutes.delete("/:id", linkController.deleteLink);
