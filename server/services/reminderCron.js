const cron = require('node-cron');
const Reminder = require('../models/Reminder');
const notificationController = require('../controllers/notificationController');

// Initialize reminder cron job
const initializeReminderCron = () => {
  // Run every minute to check for reminders
  cron.schedule('* * * * *', async () => {
    try {
      const now = new Date();
      const currentHour = String(now.getHours()).padStart(2, '0');
      const currentMinute = String(now.getMinutes()).padStart(2, '0');
      const currentTime = `${currentHour}:${currentMinute}`;
      
      // Get start and end of current day for comparison
      const dayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const dayEnd = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59);

      // Find all active reminders where:
      // 1. active = true
      // 2. time matches current time
      // 3. date is today or in the past (for due reminders)
      // 4. Not yet notified for this occurrence
      const reminders = await Reminder.find({
        active: true,
        time: currentTime,
        date: { $lte: dayEnd },
        notified: false,
      }).populate('user_id', '_id fullName email');

      console.log(`Cron check at ${currentTime}: Found ${reminders.length} reminders to trigger`);

      // Trigger notifications for matching reminders
      for (const reminder of reminders) {
        try {
          // Create in-app notification with type 'reminder'
          await notificationController.createNotification(
            reminder.user_id._id,
            'reminder',
            `⏰ ${reminder.title}`,
            reminder.description || `Reminder set for ${reminder.time}`
          );

          // Mark as notified so we don't send duplicate notification for this occurrence
          reminder.notified = true;
          reminder.last_triggered = now;
          await reminder.save();

          console.log(`✅ Reminder notification sent: "${reminder.title}" for user ${reminder.user_id._id}`);

          // If it's a recurring reminder, update the same reminder with next occurrence date
          if (reminder.frequency !== 'once') {
            let nextDate = new Date(reminder.date);
            switch (reminder.frequency) {
              case 'daily':
                nextDate.setDate(nextDate.getDate() + 1);
                break;
              case 'weekly':
                nextDate.setDate(nextDate.getDate() + 7);
                break;
              case 'monthly':
                nextDate.setMonth(nextDate.getMonth() + 1);
                break;
              case 'yearly':
                nextDate.setFullYear(nextDate.getFullYear() + 1);
                break;
            }

            // Update the same reminder with next occurrence
            reminder.date = nextDate;
            reminder.notified = false; // Reset notified flag for next occurrence
            await reminder.save();
            console.log(`📅 Reminder scheduled for next occurrence on ${nextDate}`);
          }
        } catch (error) {
          console.error(`Error triggering reminder ${reminder._id}:`, error.message);
        }
      }
    } catch (error) {
      console.error('Cron job error:', error);
    }
  });

  console.log('✅ Reminder cron job initialized - checking every minute');
};

module.exports = { initializeReminderCron };
