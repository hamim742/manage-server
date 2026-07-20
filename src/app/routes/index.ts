import { Router } from "express";

export const router = Router();

const routes: Array<{ path: string; route: Router }> = [
  // Add modular routes here, e.g.:
  // {
  //   path: "/user",
  //   route: userRoutes,
  // }
];

routes.forEach((route) => {
  router.use(route.path, route.route);
});
