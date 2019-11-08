import EventChannel from '@bcblink/lib/EventChannel';
import Logger from '@bcblink/lib/logger';
import RequestHandler from './handlers/RequestHandler';

const logger = new Logger('inPageScript');

const inPageScript = {
    init() {
        this._bindBcbWeb();
        this._bindEventChannel();
        this._bindEvents();

        this.request('init').then(({ account, chain }) => {
            if (account)
                this.setAccount(account);
            if (chain)
                this.setChain(chain);

            logger.info('BcbWeb initiated');
        }).catch(err => {
            logger.error('Failed to initialise BcbWeb', err);
        });
    },

    _injectPromise(func, ...args) {
        return new Promise((resolve, reject) => {
            func(...args, (err, res) => {
                if(err)
                    reject(err);
                else resolve(res);
            });
        });
    },

    _callbacks: {},

    _bindBcbWeb() {
        if(window.bcbWeb !== undefined)
            logger.warn('BcbWeb is already initiated. BcbWeb will overwrite the current instance');

        const bcbWeb = {};
        bcbWeb.ready = false;

        bcbWeb.getBalance = (...args) => (
            this.getBalance(...args)
        );

        bcbWeb.getBalanceBySymbol = (...args) => (
            this.getBalanceBySymbol(...args)
        );

        bcbWeb.signMessage = (...args) => (
            this.signMessage(...args)
        );

        bcbWeb.signTransaction = (...args) => (
            this.signTransaction(...args)
        );

        bcbWeb.sendTransaction = (...args) => (
            this.sendTransaction(...args)
        );

        bcbWeb.onStateChanged = (callback) => {
            if (callback && typeof(callback) === 'function') {
                this._callbacks['onStateChanged'] = callback;
            }
        };

        bcbWeb.onAccountChanged = (callback) => {
            if (callback && typeof(callback) === 'function') {
                this._callbacks['onAccountChanged'] = callback;
            }
        };

        bcbWeb.onChainChanged = (callback) => {
            if (callback && typeof(callback) === 'function') {
                this._callbacks['onChainChanged'] = callback;
            }
        };

        window.bcbWeb = bcbWeb;
    },

    _bindEventChannel() {
        this.eventChannel = new EventChannel('inPageScript');
        this.request = RequestHandler.init(this.eventChannel);
    },

    _bindEvents() {
        this.eventChannel.on('setAccount', account => {
            this.setAccount(account);
            if (typeof(this._callbacks['onAccountChanged']) === 'function') {
                this._callbacks['onAccountChanged'](bcbWeb.selectedAccount);
            }
        });

        this.eventChannel.on('setChain', chain => {
            this.setChain(chain);
            if (typeof(this._callbacks['onChainChanged']) === 'function') {
                this._callbacks['onChainChanged'](bcbWeb.selectedChain);
            }
        });
    },

    setAccount({ address, name }) {
        let account = {};
        account.address = address;
        account.name = name;
        bcbWeb.selectedAccount = account;

        if (account.address !== 'undefined' && account.address) {
            if (!bcbWeb.ready) {
                bcbWeb.ready = true;
                if (typeof(this._callbacks['onStateChanged']) === 'function') {
                    this._callbacks['onStateChanged'](bcbWeb.ready);
                }
            }
        } else {
            if (bcbWeb.ready) {
                bcbWeb.ready = false;
                if (typeof(this._callbacks['onStateChanged']) === 'function') {
                    this._callbacks['onStateChanged'](bcbWeb.ready);
                }
            }
        }
    },

    setChain({ network, chain }) {
        let chainInfo = {};
        chainInfo.network = network;
        chainInfo.chain = chain;
        bcbWeb.selectedChain = chainInfo;
    },

    getBalance(tokenAddress, callback = false) {
        if (!callback) {
            return this._injectPromise(this.getBalance.bind(this), tokenAddress);
        }

        if (!tokenAddress)
            return callback('Invalid token address provided');

        this.request('getBalance', tokenAddress).then(balance => {
            // console.log(balance)
            callback(null, balance);
        }).catch(err => {
            callback(err);
        });
    },

    getBalanceBySymbol(tokenSymbol, callback = false) {
        if (!callback) {
            return this._injectPromise(this.getBalanceBySymbol.bind(this), tokenSymbol);
        }

        if (!tokenSymbol)
            return callback('Invalid token symbol provided');

        this.request('getBalanceBySymbol', tokenSymbol).then(balance => {
            // console.log(balance)
            callback(null, balance);
        }).catch(err => {
            callback(err);
        });
    },

    signTransaction(transaction, callback = false) {
        if (!callback) {
            return this._injectPromise(this.signTransaction.bind(this), transaction);
        }

        if(!transaction)
            return callback('Invalid transaction provided');

        if(!bcbWeb.ready)
            return callback('User has not unlocked wallet');

        this.request('signTransaction', transaction).then(signed => {
            // console.log(signed)
            callback(null, signed);
        }).catch(err => {
            callback(err);
        });
    },

    sendTransaction(transaction, callback = false) {
        if (!callback) {
            return this._injectPromise(this.sendTransaction.bind(this), transaction);
        }

        if(!transaction)
            return callback('Invalid transaction provided');

        if(!bcbWeb.ready)
            return callback('User has not unlocked wallet');

        this.request('sendTransaction', transaction).then(hash => {
            // console.log(hash)
            callback(null, hash);
        }).catch(err => {
            callback(err);
        });
    },

    signMessage(message, callback = false) {
        if(!callback)
            return this._injectPromise(this.signMessage.bind(this), message);

        if(!message)
            return callback('Invalid message provided');

        if(!bcbWeb.ready)
            return callback('User has not unlocked wallet');

        this.request('signMessage', message
        ).then(res => (
            callback(null, res)
        )).catch(err => {
            logger.error('Failed to sign message:', err);
            callback(err);
        });
    }
};

inPageScript.init();
