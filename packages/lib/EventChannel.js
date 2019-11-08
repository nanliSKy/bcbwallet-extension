import EventEmitter from 'eventemitter3';

class EventChannel extends EventEmitter {
    constructor(channelKey = false) {
        super();

        if(!channelKey)
            throw 'No channel scope provided';

        this._channelKey = channelKey;
        this._registerEventListener();
    }

    _registerEventListener() {
        window.addEventListener('message', ({ data: { isBcbLink = false, message, source } }) => {
            if(!isBcbLink || (!message && !source))
                return;

            if(source === this._channelKey)
                return;

            const {
                action,
                data
            } = message;

            this.emit(action, data);
        });
    }

    send(action = false, data = {}) {
        if(!action)
            return { success: false, error: 'Function requires action {string} parameter' };

        window.postMessage({
            message: {
                action,
                data
            },
            source: this._channelKey,
            isBcbLink: true
        }, '*');
    }
}

export default EventChannel;