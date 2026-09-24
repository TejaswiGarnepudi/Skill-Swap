import Session from '../models/Session.js';
import Group from '../models/Group.js';
import Notification from '../models/Notification.js';
import { awardTeachingCredit, spendLearningCredit } from '../services/creditService.js';

export const createSession = async (req, res) => {
  try {
    const sessionData = { ...req.body, host: req.user.id };
    if (!sessionData.participants) {
      sessionData.participants = [];
    }
    if (!sessionData.participants.includes(req.user.id)) {
      sessionData.participants.push(req.user.id);
    }
    
    // If associated with a group, notify group members
    if (sessionData.group) {
      const group = await Group.findById(sessionData.group);
      if (group) {
        // Auto-include group members as participants
        group.members.forEach(m => {
          const uid = m.user?._id || m.user || m;
          if (!sessionData.participants.includes(uid.toString())) {
            sessionData.participants.push(uid);
          }
        });

        // Notify group members
        for (const member of group.members) {
          const uid = member.user?._id || member.user || member;
          if (uid.toString() !== req.user.id) {
            await Notification.create({
              user: uid,
              type: 'session_reminder',
              title: `New Session in ${group.name}`,
              message: `A new group study session "${sessionData.title}" was scheduled.`,
              relatedId: group._id,
              relatedModel: 'Group'
            });
          }
        }
      }
    }

    const session = await Session.create(sessionData);
    const populated = await Session.findById(session._id).populate('host participants', 'name avatar');
    res.status(201).json(populated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getMySessions = async (req, res) => {
  try {
    const sessions = await Session.find({
      $or: [{ host: req.user.id }, { participants: req.user.id }]
    }).populate('host participants', 'name avatar').sort({ date: 1, time: 1 });
    res.json(sessions);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getGroupSessions = async (req, res) => {
  try {
    const sessions = await Session.find({ group: req.params.groupId })
      .populate('host participants', 'name avatar')
      .sort({ date: 1, time: 1 });
    res.json(sessions);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getUpcomingSessions = async (req, res) => {
  try {
    const sessions = await Session.find({
      $or: [{ host: req.user.id }, { participants: req.user.id }],
      date: { $gte: new Date() },
      status: 'scheduled'
    }).populate('host participants', 'name avatar').sort({ date: 1, time: 1 });
    res.json(sessions);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const joinSession = async (req, res) => {
  try {
    const session = await Session.findById(req.params.id);
    if (!session) return res.status(404).json({ message: 'Session not found' });

    if (!session.participants.includes(req.user.id)) {
      session.participants.push(req.user.id);
      await session.save();
    }
    const populated = await Session.findById(session._id).populate('host participants', 'name avatar');
    res.json(populated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const leaveSession = async (req, res) => {
  try {
    const session = await Session.findById(req.params.id);
    if (!session) return res.status(404).json({ message: 'Session not found' });

    session.participants = session.participants.filter(
      p => p.toString() !== req.user.id
    );
    await session.save();
    const populated = await Session.findById(session._id).populate('host participants', 'name avatar');
    res.json(populated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const completeSession = async (req, res) => {
  try {
    const session = await Session.findById(req.params.id);
    if (!session) return res.status(404).json({ message: 'Session not found' });

    if (session.host.toString() !== req.user.id) {
      return res.status(401).json({ message: 'Not authorized' });
    }

    session.status = 'completed';
    await session.save();

    const hours = session.duration / 60;
    
    await awardTeachingCredit(session.host, hours);
    
    for (const participantId of session.participants) {
      if (participantId.toString() !== session.host.toString()) {
        try {
          await spendLearningCredit(participantId, hours);
        } catch (e) {
          console.error(`Could not deduct credits from user ${participantId}: ${e.message}`);
        }
      }
    }

    res.json(session);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
