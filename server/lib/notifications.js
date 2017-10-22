import { makeLogger } from '../helpers';

let log = makeLogger('notifications');

class Notifier {
    constructor() {
        if (process.kresus.standalone) {
            log.warn('Notification module in standalone mode is NYI.');
            this.helper = {
                // TODO implement notifications in standalone mode
                createTemporary({ text }) {
                    log.warn('Sending a notification in standalone mode, NYI.');
                    log.warn(`Text: ${text}`);
                }
            };
        } else {
            // This helper only works within Cozy.
            let NotificationsHelper = require('cozy-notifications-helper');
            this.helper = new NotificationsHelper('Kresus');
        }
    }

    send(text) {
        let params = {
            text,
            resource: {
                app: 'kresus',
                url: '/'
            }
        };

        this.helper.createTemporary(params);
    }
}

export default new Notifier();
