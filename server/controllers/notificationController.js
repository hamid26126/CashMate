const Notification = require('../models/Notification');

// Mark Notification as read
exports.markAsRead = async (req, res) => {
  try {
    const { notificationId } = req.params;

    const notification = await Notification.findByIdAndUpdate(
      notificationId,
      { is_read: true },
      { new: true }
    );

    if (!notification) {
      return res.status(404).json({ success: false, message: 'Notification not found' });
    }

    res.status(200).json({
      success: true,
      message: 'Notification marked as read',
      data: notification,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Delete Notification
exports.deleteNotification = async (req, res) => {
  try {
    const { notificationId } = req.params;

    await Notification.findByIdAndDelete(notificationId);

    res.status(200).json({
      success: true,
      message: 'Notification deleted successfully',
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get Unread Notifications
exports.getUnreadNotifications = async (req, res) => {
  try {
    const notifications = await Notification.find({
      user_id: req.user.id,
      is_read: false,
    }).sort({ createdAt: -1 });

    const formattedNotifications = notifications.map((notif, index) => ({
      id: index + 1, // Most recent gets id 1
      message: notif.message,
      type: notif.type,
      timestamp: new Date(notif.createdAt).toLocaleDateString('en-US'),
      read: notif.is_read,
    }));

    res.status(200).json({
      success: true,
      data: formattedNotifications,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get All Notifications
exports.getAllNotifications = async (req, res) => {
  try {
    const notifications = await Notification.find({
      user_id: req.user.id,
    }).sort({ createdAt: -1 });

    const formattedNotifications = notifications.map((notif, index) => ({
      id: index + 1, // Most recent gets id 1
      notif_id: notif._id,
      user_id: notif.user_id,
      type: notif.type,
      message: notif.message,
      is_read: notif.is_read,
      created_at: notif.createdAt,
      timestamp: new Date(notif.createdAt).toLocaleDateString('en-US'),
      read: notif.is_read,
    }));

    res.status(200).json({
      success: true,
      data: formattedNotifications,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Create Notification (helper for internal use)
exports.createNotification = async (userId, type, message, metadata = {}) => {
  try {
    const notification = new Notification({
      user_id: userId,
      type,
      message,
      is_read: false,
      metadata,
    });

    await notification.save();
    return notification;
  } catch (error) {
    console.error('Error creating notification:', error);
  }
};
