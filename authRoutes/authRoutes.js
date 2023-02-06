const Router = require("express");
const controller = require("../authController/authController.js");

const router = new Router();

router.post("/singup", controller.singup);
router.post("/singin", controller.singin);
router.get("/info", controller.info);
router.get("/latency", controller.latency);
router.get("/logout", controller.logout);

module.exports = router;
