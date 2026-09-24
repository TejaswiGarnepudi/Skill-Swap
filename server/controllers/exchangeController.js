import ExchangeRequest from '../models/ExchangeRequest.js';
import Notification from '../models/Notification.js';

export const sendRequest = async (req, res) => {
  try {
    const { to, skillToLearn, skillToTeach, message } = req.body;
    
    const request = await ExchangeRequest.create({
      from: req.user.id,
      to,
      skillToLearn,
      skillToTeach,
      message
    });

    await Notification.create({
      user: to,
      type: 'exchange_request',
      title: 'New Exchange Request',
      message: `You have a new exchange request.`,
      relatedId: request._id,
      relatedModel: 'ExchangeRequest'
    });

    res.status(201).json(request);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getMyRequests = async (req, res) => {
  try {
    const requests = await ExchangeRequest.find({
      $or: [{ from: req.user.id }, { to: req.user.id }]
    }).populate('from to', 'name avatar bio');
    res.json(requests);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updateRequestStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const request = await ExchangeRequest.findById(req.params.id);

    if (!request) {
      return res.status(404).json({ message: 'Request not found' });
    }

    if (request.to.toString() !== req.user.id && request.from.toString() !== req.user.id) {
      return res.status(401).json({ message: 'Not authorized' });
    }

    request.status = status;
    await request.save();

    if (status === 'accepted') {
      await Notification.create({
        user: request.from,
        type: 'request_accepted',
        title: 'Request Accepted',
        message: `Your exchange request was accepted.`,
        relatedId: request._id,
        relatedModel: 'ExchangeRequest'
      });
    }

    res.json(request);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
