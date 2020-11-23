const ExpoToken = require('../models/expoToken');
const Reminder = require('../models/reminder');
const getDay = require('date-fns/getDay');
const { Expo } = require('expo-server-sdk');
let expo = new Expo({ accessToken: process.env.EXPO_ACCESS_TOKEN });

module.exports = {
    async storeToken(req, res) {

        const { token, idUser } = req.body;

        console.log(token);

        let response = await ExpoToken.findOne({ where: { token, idUser } });

        if (response == null) {
            ExpoToken.create({ token, user: idUser });
        }
    },

    async getNotification(req, res) {
        // Create the messages that you want to send to clients
        let messages = [];
        let somePushTokens = [];

        const { id, title, body } = req.body;

        let response = await ExpoToken.find({ user: id }).select('token');

        var start = new Date();
        start.setHours(0, 0, 0, 0);

        var end = new Date();
        end.setHours(23, 59, 59, 999);

        const reminders = await Reminder.find({ user: id })
            .or([
                { dayWeek: { $elemMatch: { number: getDay(new Date()) } } },
                { dateActivity: { $gte: start, $lt: end } }
            ]);

        response.map((element, index, object) => {
            somePushTokens.push(element.token);
        });

        for (let pushToken of somePushTokens) {
            // Each push token looks like ExponentPushToken[xxxxxxxxxxxxxxxxxxxxxx]

            // Check that all your push tokens appear to be valid Expo push tokens
            if (!Expo.isExpoPushToken(pushToken)) {
                console.error(`Push token ${pushToken} is not a valid Expo push token`);
                continue;
            }
            console.log(reminders);
            const date = new Date(reminders[0].dateActivity).toLocaleTimeString
            // Construct a message (see https://docs.expo.io/push-notifications/sending-notifications/)
            messages.push({
                to: pushToken,
                sound: 'default',
                title: date,
                body: reminders[0].description,
            })
            console.log('Enviado')
        }

        // The Expo push notification service accepts batches of notifications so
        // that you don't need to send 1000 requests to send 1000 notifications. We
        // recommend you batch your notifications to reduce the number of requests
        // and to compress them (notifications with similar content will get
        // compressed).
        let chunks = expo.chunkPushNotifications(messages);
        let tickets = [];
        (async () => {
            // Send the chunks to the Expo push notification service. There are
            // different strategies you could use. A simple one is to send one chunk at a
            // time, which nicely spreads the load out over time:
            for (let chunk of chunks) {
                try {
                    let ticketChunk = await expo.sendPushNotificationsAsync(chunk);
                    console.log(ticketChunk);
                    tickets.push(...ticketChunk);
                    // NOTE: If a ticket contains an error code in ticket.details.error, you
                    // must handle it appropriately. The error codes are listed in the Expo
                    // documentation:
                    // https://docs.expo.io/push-notifications/sending-notifications/#individual-errors
                } catch (error) {
                    console.error(error);
                }
            }
        })();

        // Later, after the Expo push notification service has delivered the
        // notifications to Apple or Google (usually quickly, but allow the the service
        // up to 30 minutes when under load), a "receipt" for each notification is
        // created. The receipts will be available for at least a day; stale receipts
        // are deleted.
        //
        // The ID of each receipt is sent back in the response "ticket" for each
        // notification. In summary, sending a notification produces a ticket, which
        // contains a receipt ID you later use to get the receipt.
        //
        // The receipts may contain error codes to which you must respond. In
        // particular, Apple or Google may block apps that continue to send
        // notifications to devices that have blocked notifications or have uninstalled
        // your app. Expo does not control this policy and sends back the feedback from
        // Apple and Google so you can handle it appropriately.
        let receiptIds = [];
        for (let ticket of tickets) {
            // NOTE: Not all tickets have IDs; for example, tickets for notifications
            // that could not be enqueued will have error information and no receipt ID.
            if (ticket.id) {
                receiptIds.push(ticket.id);
            }
        }

        let receiptIdChunks = expo.chunkPushNotificationReceiptIds(receiptIds);
        (async () => {
            // Like sending notifications, there are different strategies you could use
            // to retrieve batches of receipts from the Expo service.
            for (let chunk of receiptIdChunks) {
                try {
                    let receipts = await expo.getPushNotificationReceiptsAsync(chunk);
                    console.log(receipts);

                    // The receipts specify whether Apple or Google successfully received the
                    // notification and information about an error, if one occurred.
                    for (let receiptId in receipts) {
                        let { status, message, details } = receipts[receiptId];
                        if (status === 'ok') {
                            continue;
                        } else if (status === 'error') {
                            console.error(
                                `There was an error sending a notification: ${message}`
                            );
                            if (details && details.error) {
                                // The error codes are listed in the Expo documentation:
                                // https://docs.expo.io/push-notifications/sending-notifications/#individual-errors
                                // You must handle the errors appropriately.
                                console.error(`The error code is ${details.error}`);
                            }
                        }
                    }
                } catch (error) {
                    console.error(error);
                }
            }
        })();
    },

    async notificationSend(req, res) {
        try {

            var start = new Date();
            start.setHours(start.getHours());
            start.setSeconds(0);

            var end = new Date();
            end.setHours(end.getHours());
            end.setSeconds(59);

            console.log("INICIO: " + start + " ---- FIM: " + end);

            const reminders = await Reminder.find({
                dateActivity: { $gte: start, $lte: end }
            },
                { description: 1, dateActivity: 1, user: 1, _id: 0 });

            return res.send({ reminders });

        } catch (error) {
            return res.status(400).send(error);
        }
    },
}