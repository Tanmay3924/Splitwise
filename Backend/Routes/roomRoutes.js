const express = require("express");
const router = express.Router();
const authMiddleware = require("../Middleware/authMiddleware");
const {
  createRoom,
  addMember,
  createExpense,
  searchUsersForRoom,
  removeMemberFromRoom,
  deleteRoom,
  getMyRooms,
  roomMetaData,
  getRoomMembers,
  getRoomExpenses,
  createSettlement,
  confirmSettlement,
  rejectSettlement,
  getSettlements,
  getRoomBalances,
} = require("../Controller/roomController");
router.post("/rooms", authMiddleware, createRoom);
router.get("/rooms", authMiddleware, getMyRooms);
router.delete("/rooms/:roomId", authMiddleware, deleteRoom);
router.post("/rooms/:roomId/members", authMiddleware, addMember);
router.post("/rooms/:roomId/expenses", authMiddleware, createExpense);
router.post("/rooms/:roomId/users/search", authMiddleware, searchUsersForRoom);
router.get("/rooms/:roomId/meta", authMiddleware, roomMetaData);
router.delete(
  "/rooms/:roomId/members/:userId",
  authMiddleware,
  removeMemberFromRoom,
);
router.get("/rooms/:roomId/members", authMiddleware, getRoomMembers);
router.get("/rooms/:roomId/expenses", authMiddleware, getRoomExpenses);
router.post("/rooms/:roomId/settlements", authMiddleware, createSettlement);
router.post(
  "/settlements/:settlementId/confirm",
  authMiddleware,
  confirmSettlement,
);
router.post(
  "/settlements/:settlementId/reject",
  authMiddleware,
  rejectSettlement,
);
router.get("/rooms/:roomId/settlements", authMiddleware, getSettlements);
router.get("/rooms/:roomId/balances", authMiddleware, getRoomBalances);

module.exports = router;
