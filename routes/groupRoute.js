const express = require("express");
const router = express.Router();

const { requireAuth } = require("../middleware/authmiddleware");

const groupController = require("../controllers/groupController");

router.get("/", requireAuth, groupController.group_get);

router.post("/create", requireAuth, groupController.group_post);

router.delete('/delete/:id', requireAuth, groupController.group_delete);

router.post('/invite',requireAuth, groupController.invite_post);

router.get('/accept-invitation', groupController.accept_invitation_get);

router.get("/accept-invitation/:groupId", groupController.accept_invitation_groupId_get);

router.post('/addExpense', groupController.addExpense_post);

module.exports = router;
