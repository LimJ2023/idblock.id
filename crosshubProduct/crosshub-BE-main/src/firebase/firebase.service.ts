import { Injectable } from '@nestjs/common';
import { App, applicationDefault, initializeApp } from 'firebase-admin/app';
import { getMessaging } from 'firebase-admin/messaging';

@Injectable()
export class FirebaseService {
  app: App;

  constructor() {
    this.app = initializeApp({
      credential: applicationDefault(),
    });
  }

  async sendMessage(token: string, title: string, body: string) {
    console.log('Sending message...');

    const message = {
      notification: {
        title,
        body,
      },
      data: {
        notifee: JSON.stringify({
          body: 'This message was sent via FCM!',
          android: {
            channelId: 'default',
            actions: [
              {
                title: 'Mark as Read',
                pressAction: {
                  id: 'read',
                },
              },
            ],
          },
        }),
      },
      token,
    };

    return getMessaging(this.app)
      .send(message)
      .then((response) => {
        // Response is a message ID string.
        console.log('Successfully sent message:', response);
      })
      .catch((error) => {
        console.log('Error sending message:', error);
      });
  }
}
