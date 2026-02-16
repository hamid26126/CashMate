const Notification = require('../models/Notification');

// Helper function to format relative time
const getRelativeTime = (date) => {
  const seconds = Math.floor((Date.now() - new Date(date).getTime()) / 1000);
  
  if (seconds < 60) return 'Just now';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return new Date(date).toLocaleDateString('en-US');
};

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

    const formattedNotifications = notifications.map((notif) => ({
      id: notif._id,
      type: notif.type,
      title: notif.message.title,
      message: notif.message.message,
      timestamp: getRelativeTime(notif.createdAt),
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

    const formattedNotifications = notifications.map((notif) => ({
      id: notif._id,
      type: notif.type,
      title: notif.message.title,
      message: notif.message.message,
      timestamp: getRelativeTime(notif.createdAt),
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
exports.createNotification = async (userId, type, title, message, metadata = {}) => {
  try {
    const notification = new Notification({
      user_id: userId,
      type,
      message: {
        title,
        message,
      },
      is_read: false,
      metadata,
    });

    await notification.save();
    return notification;
  } catch (error) {
    console.error('Error creating notification:', error);
  }
};
