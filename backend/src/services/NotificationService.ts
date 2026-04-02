import nodemailer from 'nodemailer';
import { Notification, INotification } from '../models/Notification.js';
import { User } from '../models/User.js';

export class NotificationService {
  private transporter: nodemailer.Transporter | null = null;

  constructor() {
    this.initializeEmailTransport();
  }

  private initializeEmailTransport(): void {
    // Use Nodemailer with Gmail or your preferred email service
    if (process.env.EMAIL_SERVICE && process.env.EMAIL_USER && process.env.EMAIL_PASSWORD) {
      this.transporter = nodemailer.createTransport({
        service: process.env.EMAIL_SERVICE,
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASSWORD,
        },
      });
    } else {
      console.warn('[NotificationService] Email not configured. Notifications will be logged only.');
    }
  }

  /**
   * Send match notification email
   */
  async notifyItemMatch(
    userId: string,
    itemTitle: string,
    matchedItemId: string,
    matchedItemTitle: string,
    isLostItem: boolean = true
  ): Promise<void> {
    try {
      const user = await User.findById(userId);

      if (!user || !user.notificationPreferences.emailOnMatch) {
        return;
      }

      const itemType = isLostItem ? 'lost' : 'found';
      const matchType = isLostItem ? 'found' : 'lost';

      const subject = `Potential Match Found: ${itemTitle}`;
      const htmlContent = `
        <h2>We found a potential match for your ${itemType} item!</h2>
        <p>Your item: <strong>${itemTitle}</strong></p>
        <p>Possible match: <strong>${matchedItemTitle}</strong></p>
        <p>Someone may have ${matchType} an item that matches yours. Log in to your account to view more details and contact the person.</p>
        <p><a href="${process.env.FRONTEND_URL || 'https://campus-lost-found.vercel.app'}/app/matches" style="background-color: #0f766e; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">View Matches</a></p>
      `;

      await this.sendEmail(user.email, subject, htmlContent);

      // Save notification to database
      await this.saveNotification(
        userId,
        'match',
        matchedItemId,
        `Match found for ${itemTitle}`,
        `Someone may have ${matchType} your item: ${matchedItemTitle}`
      );
    } catch (error) {
      console.error('[NotificationService] Failed to send match notification:', error);
    }
  }

  /**
   * Send recovery notification email
   */
  async notifyItemRecovery(userId: string, itemTitle: string): Promise<void> {
    try {
      const user = await User.findById(userId);

      if (!user || !user.notificationPreferences.emailOnRecovery) {
        return;
      }

      const subject = `Your Item Has Been Recovered: ${itemTitle}`;
      const htmlContent = `
        <h2>Great news!</h2>
        <p>Your item <strong>${itemTitle}</strong> has been marked as recovered.</p>
        <p>Log in to see more details and coordinate pickup with the finder.</p>
      `;

      await this.sendEmail(user.email, subject, htmlContent);

      // Save notification to database
      await this.saveNotification(
        userId,
        'recovery',
        '',
        `Item Recovered: ${itemTitle}`,
        `Your lost item has been recovered.`
      );
    } catch (error) {
      console.error('[NotificationService] Failed to send recovery notification:', error);
    }
  }

  /**
   * Send verification status change notification
   */
  async notifyVerificationStatus(
    userId: string,
    itemId: string,
    status: 'verified' | 'rejected',
    reason?: string
  ): Promise<void> {
    try {
      const user = await User.findById(userId);

      if (!user || !user.notificationPreferences.emailOnVerification) {
        return;
      }

      const subject = `Item Verification ${status === 'verified' ? 'Approved' : 'Rejected'}`;
      const htmlContent = `
        <h2>Item Verification Update</h2>
        <p>Your item has been <strong>${status}</strong>.</p>
        ${reason ? `<p>Reason: ${reason}</p>` : ''}
        <p>Log in to your account for more details.</p>
      `;

      await this.sendEmail(user.email, subject, htmlContent);

      // Save notification to database
      await this.saveNotification(
        userId,
        'verification',
        itemId,
        `Item ${status}`,
        `Your item verification status has been updated.`
      );
    } catch (error) {
      console.error('[NotificationService] Failed to send verification notification:', error);
    }
  }

  /**
   * Send email
   */
  private async sendEmail(to: string, subject: string, htmlContent: string): Promise<void> {
    if (!this.transporter) {
      console.log('[NotificationService] Email service not configured. Notification:', { to, subject });
      return;
    }

    try {
      await this.transporter.sendMail({
        from: process.env.EMAIL_USER,
        to,
        subject,
        html: htmlContent,
      });

      console.log(`[NotificationService] Email sent to ${to}`);
    } catch (error) {
      console.error('[NotificationService] Email send failed:', error);
      throw error;
    }
  }

  /**
   * Create a generic notification
   */
  async createNotification(data: {
    userId: string;
    type: string;
    itemId: string;
    title: string;
    message: string;
    relatedUserId?: string;
    relatedItemId?: string;
    relatedMessageId?: string;
  }): Promise<INotification> {
    const notification = new Notification({
      userId: data.userId,
      type: data.type,
      itemId: data.itemId,
      title: data.title,
      message: data.message,
      relatedUserId: data.relatedUserId,
      relatedItemId: data.relatedItemId,
      relatedMessageId: data.relatedMessageId,
      status: 'sent',
      isRead: false,
      sentAt: new Date(),
    });

    await notification.save();
    return notification;
  }

  /**
   * Save notification to database
   */
  private async saveNotification(
    userId: string,
    type: 'match' | 'recovery' | 'verification' | 'digest' | 'claim_submitted' | 'claim_approved' | 'claim_rejected',
    itemId: string,
    title: string,
    message: string
  ): Promise<INotification> {
    const notification = new Notification({
      userId,
      type,
      itemId,
      title,
      message,
      status: 'sent',
      sentAt: new Date(),
    });

    await notification.save();
    return notification;
  }

  /**
   * Get user's notifications
   */
  async getUserNotifications(userId: string, limit: number = 20): Promise<INotification[]> {
    return Notification.find({ userId })
      .sort({ createdAt: -1 })
      .limit(limit);
  }

  /**
   * Mark notification as read (if needed)
   */
  async markAsRead(notificationId: string): Promise<void> {
    await Notification.findByIdAndUpdate(notificationId, { status: 'sent' });
  }
}

export const notificationService = new NotificationService();
