import cron from 'node-cron';
import { Server as SocketIOServer } from 'socket.io';
import Reminder from '../models/Reminder';
import Notification from '../models/Notification';
import User from '../models/User';
import { sendReminderEmail } from '../utils/email';
import { sendNotificationToUser } from '../sockets/notification.socket';

export const startReminderCron = (io: SocketIOServer): void => {
  // Run every minute
  cron.schedule('* * * * *', async () => {
    try {
      const now = new Date();
      const oneMinuteAgo = new Date(now.getTime() - 60000);
      const fifteenMinutesFromNow = new Date(now.getTime() + 15 * 60000);
      const sixteenMinutesFromNow = new Date(now.getTime() + 16 * 60000);

      // 1. Trigger notifications for due reminders
      const dueReminders = await Reminder.find({
        status: 'active',
        notified: false,
        datetime: { $gte: oneMinuteAgo, $lte: now },
      });

      for (const reminder of dueReminders) {
        // Create notification
        const notification = new Notification({
          userId: reminder.userId,
          type: 'reminder',
          title: '⏰ Reminder',
          message: reminder.title,
          relatedId: reminder._id,
        });
        await notification.save();

        // Send via socket
        sendNotificationToUser(io, reminder.userId.toString(), notification);

        // Mark as notified
        reminder.notified = true;
        await reminder.save();

        // Handle repeat
        if (reminder.repeat !== 'none') {
          const nextDate = new Date(reminder.datetime);
          if (reminder.repeat === 'daily') {
            nextDate.setDate(nextDate.getDate() + 1);
          } else if (reminder.repeat === 'weekly') {
            nextDate.setDate(nextDate.getDate() + 7);
          }

          const newReminder = new Reminder({
            userId: reminder.userId,
            title: reminder.title,
            description: reminder.description,
            datetime: nextDate,
            type: reminder.type,
            repeat: reminder.repeat,
            linkedTask: reminder.linkedTask,
          });
          await newReminder.save();
        }
      }

      // 2. Send email notifications 15 min before
      const emailReminders = await Reminder.find({
        status: 'active',
        emailSent: false,
        datetime: { $gte: fifteenMinutesFromNow, $lte: sixteenMinutesFromNow },
      });

      for (const reminder of emailReminders) {
        const user = await User.findById(reminder.userId);
        if (user && user.notificationPrefs.email) {
          await sendReminderEmail(
            user.email,
            reminder.title,
            reminder.description,
            reminder.datetime.toLocaleString()
          );
          reminder.emailSent = true;
          await reminder.save();
        }
      }
    } catch (error) {
      console.error('Reminder cron error:', error);
    }
  });

  console.log('⏰ Reminder cron job started');
};
