const { RtcTokenBuilder, RtcRole } = require("agora-access-token");
const LiveSession = require("../models/LiveSession");
const crypto = require("crypto");

const APP_ID = "29d6739b70184513807b7d32b0df397f";
const APP_CERTIFICATE = "52690861dab74014b962aec56fec944a";
const TOKEN_EXPIRY_SECONDS = 3600;

// ─── Helper: Generate Token ───────────────────────────────────────────────────
const generateToken = (channelName, uid, role) => {
  const currentTime = Math.floor(Date.now() / 1000);
  const privilegeExpireTime = currentTime + TOKEN_EXPIRY_SECONDS;

  const token = RtcTokenBuilder.buildTokenWithUid(
    APP_ID,
    APP_CERTIFICATE,
    channelName,
    uid,
    role,
    privilegeExpireTime
  );

  return token;
};

// ─────────────────────────────────────────────────────────────────────────────
// Generate Token Only
// POST /api/agora/token/generate
// Body: { channelName, uid, role: "publisher" | "subscriber" }
// ─────────────────────────────────────────────────────────────────────────────
exports.generateAgoraToken = async (req, res) => {
  try {
    const { channelName, uid, role } = req.body;

    if (!channelName || !uid || !role) {
      return res.status(400).json({
        success: false,
        message: "channelName, uid and role are required",
      });
    }

    if (!["publisher", "subscriber"].includes(role)) {
      return res.status(400).json({
        success: false,
        message: "role must be 'publisher' or 'subscriber'",
      });
    }

    const agoraRole = role === "publisher" ? RtcRole.PUBLISHER : RtcRole.SUBSCRIBER;
    const token = generateToken(channelName, parseInt(uid), agoraRole);

    return res.status(200).json({
      success: true,
      data: {
        token,
        channelName,
        uid: parseInt(uid),
        role,
        appId: APP_ID,
        expiresInSeconds: TOKEN_EXPIRY_SECONDS,
      },
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// TEACHER: Create ONE-ON-ONE Session
// POST /api/agora/session/one-on-one
// Body: { title, teacherId, invitedStudentId }
// ─────────────────────────────────────────────────────────────────────────────
exports.createOneOnOneSession = async (req, res) => {
  try {
    const { title, teacherId, invitedStudentId } = req.body;

    if (!title || !teacherId || !invitedStudentId) {
      return res.status(400).json({
        success: false,
        message: "title, teacherId and invitedStudentId are required",
      });
    }

    const channelName = 1v1_${crypto.randomBytes(6).toString("hex")};
    const uid = Math.floor(Math.random() * 100000);
    const token = generateToken(channelName, uid, RtcRole.PUBLISHER);

    const session = await LiveSession.create({
      channelName,
      teacher: teacherId,
      title,
      sessionType: "ONE_ON_ONE",
      invitedStudent: invitedStudentId,
      maxStudents: 1,
      isLive: true,
      startedAt: new Date(),
    });

    return res.status(201).json({
      success: true,
      message: "1-on-1 session created",
      data: {
        sessionId: session._id,
        sessionType: "ONE_ON_ONE",
        channelName,
        token,
        uid,
        appId: APP_ID,
        title,
        invitedStudent: invitedStudentId,
      },
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// TEACHER: Create ONE-TO-MANY Session
// POST /api/agora/session/live-class
// Body: { title, teacherId, maxStudents (optional) }
// ─────────────────────────────────────────────────────────────────────────────
exports.createOneToManySession = async (req, res) => {
  try {
    const { title, teacherId, maxStudents } = req.body;

    if (!title || !teacherId) {
      return res.status(400).json({
        success: false,
        message: "title and teacherId are required",
      });
    }

    const channelName = live_${crypto.randomBytes(6).toString("hex")};
    const uid = Math.floor(Math.random() * 100000);
    const token = generateToken(channelName, uid, RtcRole.PUBLISHER);

    const session = await LiveSession.create({
      channelName,
      teacher: teacherId,
      title,
      sessionType: "ONE_TO_MANY",
      maxStudents: maxStudents || null,
      isLive: true,
      startedAt: new Date(),
    });

    return res.status(201).json({
      success: true,
      message: "Live class session created",
      data: {
        sessionId: session._id,
        sessionType: "ONE_TO_MANY",
        channelName,
        token,
        uid,
        appId: APP_ID,
        title,
        maxStudents: maxStudents || "unlimited",
      },
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// STUDENT: Join Session
// POST /api/agora/session/join/:channelName
// Body: { studentId }
// ─────────────────────────────────────────────────────────────────────────────
exports.joinSession = async (req, res) => {
  try {
    const { channelName } = req.params;
    const { studentId } = req.body;

    if (!studentId) {
      return res.status(400).json({ success: false, message: "studentId is required" });
    }

    const session = await LiveSession.findOne({ channelName, isLive: true });

    if (!session) {
      return res.status(404).json({ success: false, message: "No active session found" });
    }

    // ONE_ON_ONE: sirf invited student join kar sakta hai
    if (session.sessionType === "ONE_ON_ONE") {
      const isInvited = session.invitedStudent?.toString() === studentId.toString();
      if (!isInvited) {
        return res.status(403).json({ success: false, message: "You are not invited to this session" });
      }
      const alreadyJoined = session.students.some(s => s.toString() === studentId.toString());
      if (alreadyJoined) {
        return res.status(400).json({ success: false, message: "You have already joined this session" });
      }
    }

    // ONE_TO_MANY: capacity check
    if (session.sessionType === "ONE_TO_MANY" && session.maxStudents) {
      if (session.students.length >= session.maxStudents) {
        return res.status(400).json({ success: false, message: "Session is full" });
      }
    }

    const uid = Math.floor(Math.random() * 100000);
    const token = generateToken(channelName, uid, RtcRole.SUBSCRIBER);

    const alreadyInList = session.students.some(s => s.toString() === studentId.toString());
    if (!alreadyInList) {
      session.students.push(studentId);
      await session.save();
    }

    return res.status(200).json({
      success: true,
      message: "Joined session successfully",
      data: {
        sessionId: session._id,
        sessionType: session.sessionType,
        channelName,
        token,
        uid,
        appId: APP_ID,
        title: session.title,
        teacherId: session.teacher,
      },
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// TEACHER: End Session
// PUT /api/agora/session/:sessionId/end
// Body: { teacherId }
// ─────────────────────────────────────────────────────────────────────────────
exports.endSession = async (req, res) => {
  try {
    const { sessionId } = req.params;
    const { teacherId } = req.body;

    if (!teacherId) {
      return res.status(400).json({ success: false, message: "teacherId is required" });
    }

    const session = await LiveSession.findOne({ _id: sessionId, teacher: teacherId });
    if (!session) {
      return res.status(404).json({ success: false, message: "Session not found" });
    }

    session.isLive = false;
    session.endedAt = new Date();
    await session.save();

    return res.status(200).json({
      success: true,
      message: "Session ended",
      data: { sessionId: session._id, endedAt: session.endedAt },
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// Get All Active Sessions
// GET /api/agora/session/active?type=ONE_TO_MANY
// ─────────────────────────────────────────────────────────────────────────────
exports.getActiveSessions = async (req, res) => {
  try {
    const { type } = req.query;
    const filter = { isLive: true };
    if (type) filter.sessionType = type;

    const sessions = await LiveSession.find(filter)
      .populate("teacher", "name email avatar")
      .sort({ startedAt: -1 });

    return res.status(200).json({ success: true, count: sessions.length, data: sessions });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// Get Session By ID
// GET /api/agora/session/:sessionId
// ─────────────────────────────────────────────────────────────────────────────
exports.getSessionById = async (req, res) => {
  try {
    const session = await LiveSession.findById(req.params.sessionId)
      .populate("teacher", "name email avatar")
      .populate("students", "name email")
      .populate("invitedStudent", "name email");

    if (!session) {
      return res.status(404).json({ success: false, message: "Session not found" });
    }

    return res.status(200).json({ success: true, data: session });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// Refresh Token
// POST /api/agora/token/refresh
// Body: { channelName, uid, role }
// ─────────────────────────────────────────────────────────────────────────────
exports.refreshToken = async (req, res) => {
  try {
    const { channelName, uid, role } = req.body;

    if (!channelName || !uid || !role) {
      return res.status(400).json({ success: false, message: "channelName, uid and role are required" });
    }

    const agoraRole = role === "publisher" ? RtcRole.PUBLISHER : RtcRole.SUBSCRIBER;
    const token = generateToken(channelName, parseInt(uid), agoraRole);

    return res.status(200).json({ success: true, token, expiresInSeconds: TOKEN_EXPIRY_SECONDS });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};