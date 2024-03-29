import MessageDuplex from '@bcblink/lib/MessageDuplex';
import EventChannel from '@bcblink/lib/EventChannel';
import Logger from '@bcblink/lib/logger';
import extensionizer from 'extensionizer';

const logger = new Logger('contentScript');

const contentScript = {
    duplex: new MessageDuplex.Tab(),
    eventChannel: new EventChannel('contentScript'),

    init() {
        logger.info('Initialising BcbLink');

        this.registerListeners();
        this.inject();
    },

    registerListeners() {
        this.eventChannel.on('tunnel', async data => {
            try {
                this.eventChannel.send(
                    'tabReply',
                    await this.duplex.send('tabRequest', data)
                );
            } catch(ex) {
                logger.info('Tab request failed:', ex);
            }
        });

        this.duplex.on('tunnel', ({ action, data }) => {
            this.eventChannel.send(action, data);
        });
    },

    inject() {
        const injectionSite = (document.head || document.documentElement);
        const container = document.createElement('script');

        container.src = extensionizer.extension.getURL('inPageScript.js');
        container.onload = function() {
            this.parentNode.removeChild(this);
        };

        injectionSite.insertBefore(
            container,
            injectionSite.children[ 0 ]
        );

        logger.info('BcbLink injected');
    }
};

contentScript.init();