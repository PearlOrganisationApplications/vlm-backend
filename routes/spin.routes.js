const express = require("express");
const authMiddleware = require("../middlewares/auth.middleware");
const { spinNow, getLogic, getSpinDetailById } = require("../controllers/spin.controller");

const router = express.Router();

router.get("/get-rewards", getLogic);

router.post("/spin-now",  authMiddleware, spinNow);


router.get("/get-spin-history/:id", getSpinDetailById );
module.exports = router;