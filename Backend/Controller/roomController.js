const roomModel = require("../Models/Room");
const expenseModel = require("../Models/Expense");
const settlementModel = require("../Models/Settlement");
const userModel = require("../Models/User");
const createRoom = async (req, res) => {
  try {
    const { name } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({ message: "Room name is required" });
    }

    const cleanName = name.trim();
    const roomName = cleanName.charAt(0).toUpperCase() + cleanName.slice(1);
    const owner = req.userId;

    const existingRoom = await roomModel.findOne({
      name: roomName,
      owner,
    });

    if (existingRoom) {
      return res.status(409).json({
        message: "You already have a room with this name",
      });
    }

    const newRoom = new roomModel({
      name: roomName,
      owner,
      members: [owner],
    });

    await newRoom.save();

    return res.status(201).json({
      message: "Room created successfully",
      room: {
        _id: newRoom._id,
        name: newRoom.name,
        owner: newRoom.owner,
        members: newRoom.members,
      },
    });
  } catch (error) {
    console.error("Error creating room:", error);
    return res.status(500).json({ message: "Error creating room" });
  }
};

const addMember = async (req, res) => {
  try {
    const { roomId } = req.params;
    const { userId } = req.body;

    if (!userId) {
      return res.status(400).json({ message: "User ID is required" });
    }

    /* ---------- FETCH ROOM ---------- */
    const room = await roomModel.findById(roomId);
    if (!room) {
      return res.status(404).json({ message: "Room not found" });
    }

    /* ---------- OWNER CHECK ---------- */
    if (room.owner.toString() !== req.userId.toString()) {
      return res.status(403).json({ message: "Only owner can add members" });
    }

    /* ---------- USER EXISTS CHECK ---------- */
    const userExists = await userModel.findById(userId);
    if (!userExists) {
      return res.status(404).json({ message: "User not found" });
    }

    /* ---------- ALREADY MEMBER CHECK ---------- */
    if (room.members.some((id) => id.toString() === userId.toString())) {
      return res.status(409).json({ message: "User already a member" });
    }

    /* ---------- ADD MEMBER ---------- */
    room.members.push(userId);
    await room.save();
    const addedMember = await userModel
      .findById(userId)
      .select("_id name email profilePhoto");

    return res.status(200).json({
      message: "Member added successfully",
      addedMember,
    });
  } catch (error) {
    console.error("Add member error:", error);
    return res.status(500).json({ message: "Error adding member" });
  }
};

const createExpense = async (req, res) => {
  try {
    const { roomId } = req.params;
    const { title, paidBy, totalAmount, splitType, members } = req.body;

    /* ---------------- BASIC VALIDATION ---------------- */
    if (!title || !title.trim()) {
      return res.status(400).json({ message: "Expense title is required" });
    }

    if (!paidBy || totalAmount == null || !splitType || !members?.length) {
      return res.status(400).json({ message: "Invalid expense data" });
    }

    if (totalAmount <= 0) {
      return res.status(400).json({ message: "Amount must be greater than 0" });
    }

    if (!["equal", "custom"].includes(splitType)) {
      return res.status(400).json({ message: "Invalid split type" });
    }

    /* ---------------- FETCH ROOM ---------------- */
    const room = await roomModel.findById(roomId);
    if (!room) {
      return res.status(404).json({ message: "Room not found" });
    }

    /* ---------------- OWNER AUTHORIZATION ---------------- */
    if (room.owner.toString() !== req.userId.toString()) {
      return res.status(403).json({ message: "Only owner can add expenses" });
    }

    /* ---------------- ROOM SIZE RULE ---------------- */
    if (room.members.length < 2) {
      return res.status(400).json({
        message: "Cannot create expense in a room with less than 2 members",
      });
    }

    /* ---------------- VALIDATE PAID BY ---------------- */
    if (!room.members.some((id) => id.toString() === paidBy.toString())) {
      return res.status(400).json({ message: "Payer must be a room member" });
    }

    /* ---------------- UNIQUE TITLE CHECK ---------------- */
    const existingExpense = await expenseModel.findOne({
      room: roomId,
      title: title.trim(),
    });

    if (existingExpense) {
      return res.status(409).json({
        message: "An expense with this title already exists in the room",
      });
    }

    /* ---------------- INVOLVEMENT CHECK ---------------- */
    const involvedMembers =
      splitType === "equal" ? members : members.map((m) => m.userId);

    const otherMembers = involvedMembers.filter(
      (id) => id.toString() !== paidBy.toString(),
    );

    if (otherMembers.length === 0) {
      return res.status(400).json({
        message: "Expense must involve at least one other member",
      });
    }

    /* ---------------- SPLIT CALCULATION ---------------- */
    let splits = [];

    if (splitType === "equal") {
      const share = Number((totalAmount / members.length).toFixed(2));

      for (const userId of members) {
        if (!room.members.some((id) => id.toString() === userId.toString())) {
          return res.status(400).json({ message: "Invalid split member" });
        }
      }

      splits = members.map((userId) => ({
        user: userId,
        amount: share,
      }));
    }

    if (splitType === "custom") {
      let sum = 0;

      for (const m of members) {
        if (!room.members.some((id) => id.toString() === m.userId.toString())) {
          return res.status(400).json({ message: "Invalid split member" });
        }

        if (m.amount <= 0) {
          return res.status(400).json({ message: "Invalid split amount" });
        }

        sum += m.amount;
      }

      if (sum !== totalAmount) {
        return res.status(400).json({
          message: "Split amounts must equal total amount",
        });
      }

      splits = members.map((m) => ({
        user: m.userId,
        amount: m.amount,
      }));
    }

    /* ---------------- SAVE EXPENSE ---------------- */
    const expense = new expenseModel({
      room: roomId,
      title: title.trim(),
      paidBy,
      totalAmount,
      splits,
    });

    await expense.save();
    const populatedExpense = await expenseModel
      .findById(expense._id)
      .populate("paidBy", "name _id")
      .populate("splits.user", "name _id");

    return res.status(201).json({
      message: "Expense created successfully",
      expense: populatedExpense,
    });
  } catch (error) {
    console.error("Create expense error:", error);
    return res.status(500).json({ message: "Error creating expense" });
  }
};

const searchUsersForRoom = async (req, res) => {
  try {
    const { roomId } = req.params;
    const { query } = req.query;

    if (!query || !query.trim()) {
      return res.status(400).json({ message: "Search query is required" });
    }

    const searchText = query.trim();

    const room = await roomModel.findById(roomId);
    if (!room) {
      return res.status(404).json({ message: "Room not found" });
    }

    // owner-only access
    if (room.owner.toString() !== req.userId.toString()) {
      return res.status(403).json({ message: "Only owner can search users" });
    }

    const users = await userModel
      .find({
        $and: [
          {
            $or: [
              { name: { $regex: searchText, $options: "i" } },
              { email: { $regex: searchText, $options: "i" } },
            ],
          },
          {
            _id: { $nin: room.members },
          },
        ],
      })
      .select("_id name email profilePhoto")
      .limit(10);

    return res.status(200).json(users);
  } catch (error) {
    console.error("User search error:", error);
    return res.status(500).json({ message: "Error searching users" });
  }
};

const removeMemberFromRoom = async (req, res) => {
  try {
    const { roomId, userId } = req.params;
    const currentUserId = req.userId.toString();
    const userExists = await userModel.findById(userId);
    if (!userExists) {
      return res.status(404).json({ message: "User not found" });
    }

    /* ---------- FETCH ROOM ---------- */
    const room = await roomModel.findById(roomId);
    if (!room) {
      return res.status(404).json({ message: "Room not found" });
    }

    /* ---------- OWNER CHECK ---------- */
    if (room.owner.toString() !== currentUserId) {
      return res.status(403).json({ message: "Only owner can remove members" });
    }

    /* ---------- OWNER CANNOT REMOVE SELF ---------- */
    if (userId === currentUserId) {
      return res
        .status(400)
        .json({ message: "Owner cannot remove themselves" });
    }

    /* ---------- MEMBER CHECK ---------- */
    const memberIds = room.members.map((id) => id.toString());
    if (!memberIds.includes(userId)) {
      return res.status(404).json({ message: "User is not a room member" });
    }

    /* ---------- CALCULATE USER NET BALANCE ---------- */
    const expenses = await expenseModel.find({ room: roomId });
    const settlements = await settlementModel.find({ room: roomId });

    let net = 0; // net balance of the target user

    // expenses effect
    for (const exp of expenses) {
      const payer = exp.paidBy.toString();

      for (const split of exp.splits) {
        const uid = split.user.toString();
        const amount = split.amount;

        if (uid === userId && payer !== userId) {
          net -= amount; // owes
        }

        if (payer === userId && uid !== userId) {
          net += amount; // gets
        }
      }
    }

    // settlements effect
    for (const s of settlements) {
      if (s.from && s.from.toString() === userId) {
        net += s.amount;
      }
      if (s.to && s.to.toString() === userId) {
        net -= s.amount;
      }
    }

    /* ---------- BLOCK IF BALANCE EXISTS ---------- */
    const EPSILON = 0.01; // 1 paisa / cent
    if (Math.abs(net) > EPSILON) {
      return res.status(409).json({
        message: "User has pending balance. Please settle before removing.",
        balance: net,
      });
    }

    /* ---------- REMOVE MEMBER ---------- */
    room.members = room.members.filter((id) => id.toString() !== userId);
    await room.save();

    return res.status(200).json({
      message: "Member removed successfully",
    });
  } catch (error) {
    console.error("Remove member error:", error);
    return res.status(500).json({ message: "Error removing member" });
  }
};
const deleteRoom = async (req, res) => {
  try {
    const { roomId } = req.params;
    const currentUserId = req.userId.toString();

    /* ---------- FETCH ROOM ---------- */
    const room = await roomModel.findById(roomId);
    if (!room) {
      return res.status(404).json({ message: "Room not found" });
    }

    /* ---------- OWNER CHECK ---------- */
    if (room.owner.toString() !== currentUserId) {
      return res.status(403).json({ message: "Only owner can delete room" });
    }

    const memberIds = room.members.map((id) => id.toString());

    /* ---------- FETCH DATA ---------- */
    const expenses = await expenseModel.find({ room: roomId });
    const settlements = await settlementModel.find({ room: roomId });

    /* ---------- CALCULATE NET FOR ALL MEMBERS ---------- */
    const net = {};
    memberIds.forEach((id) => (net[id] = 0));

    // apply expenses
    for (const exp of expenses) {
      const payer = exp.paidBy.toString();

      for (const split of exp.splits) {
        const uid = split.user.toString();
        const amount = split.amount;

        if (uid !== payer) {
          net[uid] -= amount;
          net[payer] += amount;
        }
      }
    }

    // apply settlements
    for (const s of settlements) {
      const from = s.from.toString();
      const to = s.to.toString();
      const amount = s.amount;

      if (net[from] !== undefined) net[from] += amount;
      if (net[to] !== undefined) net[to] -= amount;
    }

    /* ---------- CHECK ALL BALANCES ---------- */
    const EPSILON = 0.01;

    const unsettled = Object.entries(net).filter(
      ([_, amount]) => Math.abs(amount) > EPSILON,
    );

    if (unsettled.length > 0) {
      return res.status(409).json({
        message: "Room has pending balances. Please settle before deleting.",
        pendingBalances: unsettled,
      });
    }

    /* ---------- DELETE EVERYTHING ---------- */
    await settlementModel.deleteMany({ room: roomId });
    await expenseModel.deleteMany({ room: roomId });
    await roomModel.findByIdAndDelete(roomId);

    return res.status(200).json({
      message: "Room deleted successfully",
    });
  } catch (error) {
    console.error("Delete room error:", error);
    return res.status(500).json({ message: "Error deleting room" });
  }
};

const getMyRooms = async (req, res) => {
  try {
    const userId = req.userId.toString();

    const rooms = await roomModel
      .find({ members: userId })
      .select("_id name owner members")
      .sort({ createdAt: -1 });

    return res.status(200).json(rooms);
  } catch (error) {
    console.error("Get rooms error:", error);
    return res.status(500).json({ message: "Error fetching rooms" });
  }
};

const roomMetaData = async (req, res) => {
  try {
    const { roomId } = req.params;
    const userId = req.userId;

    const room = await roomModel
      .findById(roomId)
      .populate("owner", "name")
      .select("name owner members");

    if (!room) {
      return res.status(404).json({ message: "Room not found" });
    }

    // 🔐 user must be a member
    const isMember = room.members.some(
      (memberId) => memberId.toString() === userId.toString(),
    );

    if (!isMember) {
      return res.status(403).json({ message: "Access denied" });
    }

    const isOwner = room.owner._id.toString() === userId.toString();

    res.status(201).json({
      _id: room._id,
      name: room.name,
      owner: room.owner,
      isOwner,
    });
  } catch (error) {
    console.error("ROOM META ERROR:", error);
    res.status(500).json({ message: "Failed to load room metadata" });
  }
};

const getRoomMembers = async (req, res) => {
  try {
    const { roomId } = req.params;
    const currentUserId = req.userId.toString();

    const room = await roomModel.findById(roomId).select("members");

    if (!room) {
      return res.status(404).json({ message: "Room not found" });
    }

    const isMember = room.members.some((id) => id.toString() === currentUserId);

    if (!isMember) {
      return res.status(403).json({ message: "Not a room member" });
    }

    const populatedMembers = await roomModel
      .findById(roomId)
      .populate("members", "name email profilePhoto")
      .select("members");

    return res.status(200).json({
      members: populatedMembers.members,
    });
  } catch (error) {
    console.error("Get room members error:", error);
    return res.status(500).json({
      message: "Error fetching room members",
    });
  }
};

const getRoomExpenses = async (req, res) => {
  try {
    const { roomId } = req.params;
    const userId = req.userId.toString();

    // 1️⃣ Check room exists
    const room = await roomModel.findById(roomId);
    if (!room) {
      return res.status(404).json({ message: "Room not found" });
    }

    // 2️⃣ Check membership
    const isMember = room.members.some((m) => m.toString() === userId);

    if (!isMember) {
      return res.status(403).json({ message: "Not a room member" });
    }

    // 3️⃣ Owner sees everything
    const isOwner = room.owner.toString() === userId;

    // 4️⃣ Build query dynamically
    const query = {
      room: roomId,
    };

    if (!isOwner) {
      query.$or = [{ paidBy: userId }, { "splits.user": userId }];
    }

    // 5️⃣ Fetch expenses
    const expenses = await expenseModel
      .find(query)
      .populate("paidBy", "name")
      .populate("splits.user", "name profilePhoto")
      .sort({ createdAt: -1 });

    return res.status(200).json({ expenses });
  } catch (error) {
    console.error("Get room expenses error:", error);
    return res.status(500).json({ message: "Error fetching expenses" });
  }
};

const createSettlement = async (req, res) => {
  try {
    const { roomId, to, amount } = req.body;
    const fromUserId = req.userId.toString();

    // Basic validation
    if (!amount || amount <= 0) {
      return res.status(400).json({ message: "Invalid amount" });
    }

    const newSettlement = new settlementModel({
      room: roomId,
      from: fromUserId,
      to,
      amount: Math.floor(amount), // Ensure integer payment
      status: "pending",
    });

    await newSettlement.save();
    return res
      .status(201)
      .json({ message: "Payment recorded. Awaiting confirmation." });
  } catch (error) {
    console.error("Create settlement error:", error);
    return res.status(500).json({ message: "Error creating settlement" });
  }
};

const confirmSettlement = async (req, res) => {
  try {
    const { settlementId } = req.params;
    const userId = req.userId.toString();

    const settlement = await settlementModel.findById(settlementId);
    if (!settlement) return res.status(404).json({ message: "Not found" });

    // Security: Only the person receiving money can confirm it
    if (settlement.to.toString() !== userId) {
      return res.status(403).json({ message: "Only receiver can confirm" });
    }

    if (settlement.status !== "pending") {
      return res.status(400).json({ message: "Already processed" });
    }

    settlement.status = "confirmed";
    await settlement.save();

    return res.status(200).json({ message: "Settlement confirmed" });
  } catch (error) {
    return res.status(500).json({ message: "Error confirming settlement" });
  }
};

const rejectSettlement = async (req, res) => {
  try {
    const { settlementId } = req.params;
    const userId = req.userId.toString();

    const settlement = await settlementModel.findById(settlementId);
    if (!settlement) return res.status(404).json({ message: "Not found" });

    if (settlement.to.toString() !== userId) {
      return res.status(403).json({ message: "Only receiver can reject" });
    }

    settlement.status = "rejected";
    await settlement.save();

    return res.status(200).json({ message: "Settlement rejected" });
  } catch (error) {
    return res.status(500).json({ message: "Error rejecting settlement" });
  }
};

const getSettlements = async (req, res) => {
  try {
    const { roomId } = req.params;
    const userId = req.userId.toString();

    const room = await roomModel.findById(roomId);
    if (!room) return res.status(404).json({ message: "Room not found" });

    const memberIds = room.members.map((id) => id.toString());
    if (!memberIds.includes(userId)) {
      return res.status(403).json({ message: "Not a room member" });
    }

    const isOwner = room.owner.toString() === userId;

    // Build Query: Owners see all, Users see only their Sent/Received
    const query = isOwner
      ? { room: roomId }
      : { room: roomId, $or: [{ from: userId }, { to: userId }] };

    const settlements = await settlementModel
      .find(query)
      .populate("from", "name profilePhoto")
      .populate("to", "name profilePhoto")
      .sort({ createdAt: -1 });

    return res.status(200).json({ settlements });
  } catch (error) {
    console.error("Get settlements error:", error);
    return res.status(500).json({ message: "Error fetching settlements" });
  }
};
const getRoomBalances = async (req, res) => {
  try {
    const { roomId } = req.params;
    const userId = req.userId.toString();

    // 1. Fetch Room and Members
    const room = await roomModel
      .findById(roomId)
      .populate("members", "name profilePhoto upiId");

    if (!room) {
      return res.status(404).json({ message: "Room not found" });
    }

    // 2. Security: Member Check
    const memberIds = room.members.map((m) => m._id.toString());
    if (!memberIds.includes(userId)) {
      return res.status(403).json({ message: "Not a room member" });
    }

    const isOwner = room.owner.toString() === userId;

    // 3. Initialize Net Balances Map
    const net = {};
    for (const m of room.members) {
      net[m._id.toString()] = 0;
    }

    // 4. Apply Expenses (Debt Creation)
    const expenses = await expenseModel.find({ room: roomId });
    for (const exp of expenses) {
      const payer = exp.paidBy.toString();
      for (const split of exp.splits) {
        const uid = split.user.toString();
        if (uid !== payer) {
          // Use Math.round(*100)/100 to prevent floating point precision errors
          net[uid] = Math.round((net[uid] - split.amount) * 100) / 100;
          net[payer] = Math.round((net[payer] + split.amount) * 100) / 100;
        }
      }
    }

    // 5. Apply Settlements (Debt Resolution)
    // IMPORTANT: Include "pending" so the user doesn't see a debt they just "Marked as Paid"
    const settlements = await settlementModel.find({
      room: roomId,
      status: { $in: ["confirmed", "pending"] },
    });

    for (const s of settlements) {
      const fromId = s.from.toString();
      const toId = s.to.toString();
      if (net[fromId] !== undefined && net[toId] !== undefined) {
        net[fromId] = Math.round((net[fromId] + s.amount) * 100) / 100;
        net[toId] = Math.round((net[toId] - s.amount) * 100) / 100;
      }
    }

    // 6. Simplify Debts (Greedy Algorithm)
    const balances = [];
    const EPSILON = 0.01;
    const debtors = [];
    const creditors = [];

    for (const id in net) {
      if (net[id] < -EPSILON) debtors.push({ id, amount: Math.abs(net[id]) });
      if (net[id] > EPSILON) creditors.push({ id, amount: net[id] });
    }

    let d = 0,
      c = 0;
    while (d < debtors.length && c < creditors.length) {
      const settleAmount = Math.min(debtors[d].amount, creditors[c].amount);
      const finalAmount = Math.floor(settleAmount); // Round down to prevent overpayment errors

      if (finalAmount > 0) {
        balances.push({
          from: debtors[d].id,
          to: creditors[c].id,
          amount: finalAmount,
        });
      }

      debtors[d].amount -= settleAmount;
      creditors[c].amount -= settleAmount;
      if (debtors[d].amount < EPSILON) d++;
      if (creditors[c].amount < EPSILON) c++;
    }

    // 7. Populate and Filter
    const populatedBalances = balances.map((b) => ({
      from: room.members.find((m) => m._id.toString() === b.from),
      to: room.members.find((m) => m._id.toString() === b.to),
      amount: b.amount,
    }));

    const visibleBalances = isOwner
      ? populatedBalances
      : populatedBalances.filter(
          (b) =>
            b.from._id.toString() === userId || b.to._id.toString() === userId,
        );

    return res.status(200).json({ balances: visibleBalances });
  } catch (error) {
    console.error("Get balances error:", error);
    return res.status(500).json({ message: "Error fetching balances" });
  }
};

module.exports = {
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
};
