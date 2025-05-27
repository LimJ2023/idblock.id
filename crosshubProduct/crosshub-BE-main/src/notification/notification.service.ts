import { Inject, Injectable } from '@nestjs/common';
import { formatDistanceToNow } from 'date-fns';
import { DrizzleDB, INJECT_DRIZZLE } from 'src/database/drizzle.provider';
import { Notification, UserFcmToken } from 'src/database/schema';
import { FirebaseService } from 'src/firebase/firebase.service';

enum NotificationType {
  USER_APPROVED = 0,
  USER_REJECTED = 1,
}

@Injectable()
export class NotificationService {
  constructor(
    @Inject(INJECT_DRIZZLE) private readonly db: DrizzleDB,
    private readonly firebaseService: FirebaseService,
  ) {}

  async listNotifications(userId: bigint) {
    return (
      await this.db.query.Notification.findMany({
        where: (table, { eq }) => eq(table.userId, userId),
        orderBy: (table, { desc }) => desc(table.createdAt),
      })
    ).map((d) => this.formatNotification(d));
  }

  async sendNotification(data: typeof Notification.$inferInsert) {
    const [{ userId }] = await this.db
      .insert(Notification)
      .values({
        ...data,
      })
      .returning();

    const target = await this.db.query.UserFcmToken.findFirst({
      where: (table, { eq }) => eq(table.userId, userId),
    });
    if (target) {
      await this.firebaseService.sendMessage(
        target.fcmToken,
        data.title,
        data.content,
      );
    }
  }

  sendFcmToken(userId: bigint, fcmToken: string) {
    return this.db
      .insert(UserFcmToken)
      .values({
        userId,
        fcmToken,
      })
      .onConflictDoUpdate({
        set: { fcmToken, createdAt: new Date() },
        target: UserFcmToken.userId,
      });
  }

  private formatNotification(n: typeof Notification.$inferSelect) {
    return {
      ...n,
      type:
        n.type === NotificationType.USER_APPROVED ? 'USER_APPROVED'
        : n.type === NotificationType.USER_REJECTED ? 'USER_REJECTED'
        : '',

      displayType:
        (
          n.type === NotificationType.USER_APPROVED ||
          n.type === NotificationType.USER_REJECTED
        ) ?
          'Approval Status'
        : '',

      displayTime: formatDistanceToNow(n.createdAt, {
        addSuffix: true,
      }),
    };
  }
}
