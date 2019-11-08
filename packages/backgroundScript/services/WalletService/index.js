import Logger from '@bcblink/lib/logger';
import EventEmitter from 'eventemitter3';
import NodeService from '../NodeService';
import StorageService from '../StorageService';
import Utils from '@bcblink/lib/utils';
import Account from './Account';
import extensionizer from 'extensionizer';

import {
    APP_STATE,
    ACCOUNT_TYPE,
    NETWORK_TYPE
} from '@bcblink/lib/constants';

const logger = new Logger('WalletService');

class Wallet extends EventEmitter {
    constructor() {
        super();

        // Keep on reset
        this.state = APP_STATE.UNINITIALISED;

        this._reset();
        this._checkStorage();
    }

    _reset() {
        this.network = false;
        this.chain = false;
        this.selectedAccount = false;
        this.isConfirming = false;
        this.popup = false;
        this.accounts = {};
        this.confirmations = [];
        this._timer = {};
        this._shouldPoll = false;
        this._popupListened = false;
    }

    async _checkStorage() {
        if (await StorageService.dataExists())
            this._setState(APP_STATE.PASSWORD_SET); // initstatus APP_STATE.PASSWORD_SET
    }

    _setState(appState) {
        if(this.state === appState) {
            logger.info('ignore state:', appState);
            return;
        }

        logger.info(`Setting app state to ${ appState }`);

        this.state = appState;
        this.emit('newState', appState);

        return appState;
    }

    async _loadNetworkOptions() {
        let selectedNetwork = StorageService.getSelectedNetwork();
        let selectedChain = StorageService.getSelectedChain();

        // logger.info('Load network:', selectedNetwork, selectedChain);

        // For backward compatibility
        if (selectedChain && !selectedNetwork) {
            StorageService.selectNetwork(selectedChain);
            selectedNetwork = selectedChain;
        }

        if (selectedNetwork && selectedNetwork !== this.network) {
            this.network = selectedNetwork;
            await NodeService.setNetwork(this.network);
        }
        if (selectedChain && selectedChain !== this.chain) {
            this.chain = selectedChain;
            await NodeService.setChain(this.chain);
        }
        if (this.network) {
            this.emit('setChain', { network: this.network, chain: this.chain });
            const node = NodeService.getSelectedNode();
            this.emit('setNode', node);
        }
    }

    _loadAccounts() {
        const accounts = StorageService.getAccounts();
        const selected = StorageService.selectedAccount;

        logger.info('Load accounts:', Object.keys(accounts), selected);

        Object.entries(accounts).forEach(([ address, account ]) => {
            let accountObj;
            if (account.type === ACCOUNT_TYPE.MNEMONIC) {
                let mnemonic = StorageService.getMnemonic();
                accountObj = new Account(
                    // For backward compatibility
                    account.network || account.chainId,
                    ACCOUNT_TYPE.MNEMONIC,
                    mnemonic,
                    account.accountIndex
                );
            } else {
                accountObj = new Account(
                    // For backward compatibility
                    account.network || account.chainId,
                    account.type,
                    account.privateKey || account.address,
                );
            }
            accountObj.loadCache();
            this.accounts[ address ] = accountObj;
        });

        this.selectedAccount = selected;
    }

    async _pollAccounts() {
        logger.info('Polling ...');
        clearTimeout(this._timer);
        if(!this._shouldPoll) {
            logger.info('Stopped polling');
            return;
        }

        const accounts = Object.values(this.accounts);
        if (accounts.length > 0) {
            this.emit('setAccounts', this.getAccounts());
            this._shouldPoll = false;
        }
        this._timer = setTimeout(() => {
            this._pollAccounts(); // ??TODO repeatedly request
        }, 1000);
    }

    async _updateWindow() {
        return new Promise(resolve => {
            if(typeof chrome !== 'undefined') {
                return extensionizer.windows.update(this.popup.id, { focused: true }, window => {
                    resolve(!!window);
                });
            }

            extensionizer.windows.update(this.popup.id, {
                focused: true
            }).then(resolve).catch(() => resolve(false));
        });
    }

    async _openPopup() {
        // if(this.popup && this.popup.closed)
        //     this.popup = false;

        // if(this.popup && await this._updateWindow())
        //     return;

        if(typeof chrome !== 'undefined') {
            return extensionizer.windows.create({
                url: 'popup/index.html#/confirm',
                type: 'popup',
                width: 372,
                height: 632,
                left: 80,
                top: 80
            }, window => this.popup = window);
        }

        this.popup = await extensionizer.windows.create({
            url: 'popup/index.html',
            type: 'popup',
            width: 360,
            height: 600,
            left: 40,
            top: 40
        });
    }

    _closePopup() {
        if(this.confirmations.length)
            return;

        if(!this.popup)
            return;

        extensionizer.windows.remove(this.popup.id);
        this.popup = false;
    }

    startPolling() {
        logger.info('Started polling');

        this._shouldPoll = true;
        this._pollAccounts();
    }

    stopPolling() {
        this._shouldPoll = false;
    }

    async refresh() {
        this.emit('setAccounts', this.getAccounts());
    }

    changeState(appState) {
        const stateAry = [
            APP_STATE.PASSWORD_SET,
            APP_STATE.RESTORING,
            APP_STATE.CREATING,
            APP_STATE.RECEIVE,
            APP_STATE.SEND,
            APP_STATE.TRANSACTIONS,
            APP_STATE.SETTING,
            APP_STATE.READY
        ];
        if(!stateAry.includes(appState))
            return logger.error(`Attempted to change app state to ${ appState }. Only 'restoring' and 'creating' is permitted`);

        this._setState(appState);
    }

    async resetState() {
        logger.info('Resetting app state');

        if(!await StorageService.dataExists())
            return this._setState(APP_STATE.UNINITIALISED);

        if(!StorageService.hasAccounts && !StorageService.ready)
            return this._setState(APP_STATE.PASSWORD_SET);

        if(!StorageService.hasAccounts && StorageService.ready)
            return this._setState(APP_STATE.UNLOCKED);

        if(this.state === APP_STATE.REQUESTING_CONFIRMATION && this.confirmations.length)
            return;

        this._setState(APP_STATE.READY);
    }

    async setPassword(password) {
        if(this.state !== APP_STATE.UNINITIALISED && this.state !== APP_STATE.PASSWORD_SET)
            return Promise.reject('ERRORS.WRONG_APP_STATE');

        // Purge data (HD wallet)
        await StorageService.purge();

        StorageService.authenticate(password);

        NodeService.init();
        this._reset();

        this._loadNetworkOptions();
        StorageService.save();

        logger.info('User has set a password');
        this._setState(APP_STATE.UNLOCKED);
        return true;
    }

    async changePassword({ oldPassword, newPassword }) {
        if(!StorageService.ready)
            return Promise.reject('ERRORS.NOT_UNLOCKED');

        if (oldPassword !== StorageService.password)
            return Promise.reject('ERRORS.WRONG_PASSWORD');

        StorageService.authenticate(newPassword);
        StorageService.save();

        logger.info('User has changed password');
        this.lockWallet();
        return true;
    }

    async unlockWallet(password) {
        logger.info('Unlock wallet');

        if(this.state !== APP_STATE.PASSWORD_SET) {
            logger.error('Attempted to unlock wallet whilst not in PASSWORD_SET state');
            return Promise.reject('ERRORS.NOT_LOCKED');
        }

        await StorageService.unlock(password).catch(err => {
            logger.error(`Failed to unlock wallet: ${ unlockFailed }`);
            return Promise.reject(err);
        })

        if(!StorageService.hasAccounts) {
            logger.info('Wallet does not have any accounts');
            this._setState(APP_STATE.UNLOCKED);
            return true;
        }

        NodeService.init();
        this._loadNetworkOptions();

        this._loadAccounts();
        this.emit('setAccount', this.getAddress(this.selectedAccount));

        // let setting = {};
        // setting['unlock']['fromTime'] = new Date().getTime();
        // this.setSetting(setting);

        if (this.confirmations.length === 0) {
            // this.setCache();
            this._setState(APP_STATE.READY);
        } else {
            this._setState(APP_STATE.REQUESTING_CONFIRMATION);
        }

        return true;
    }

    lockWallet() {
        logger.info('Lock wallet');

        StorageService.lock();
        this.accounts = {};
        this.selectedAccount = false;
        this.emit('setAccount', this.selectedAccount);
        return this._setState(APP_STATE.PASSWORD_SET);
        // return true;
    }

    async queueConfirmation(confirmation, uuid, callback) {
        this.confirmations.push({
            confirmation,
            callback,
            uuid
        });

        // if(this.state === APP_STATE.PASSWORD_SET) {
        //     this.emit('setConfirmations', this.confirmations);
        //     this._openPopup();
        //     return;
        // }

        if(this.state !== APP_STATE.REQUESTING_CONFIRMATION)
            this._setState(APP_STATE.REQUESTING_CONFIRMATION);

        logger.info('Added confirmation to queue', { ...confirmation, signedTransaction: '' });

        this.emit('setConfirmations', this.confirmations);

        await this._openPopup();

        if (!this._popupListened) {
            extensionizer.windows.onRemoved.addListener((winId) => {
                if (this.popup && this.popup.id == winId) {
                    this.popup = false;
                    this.rejectConfirmation();
                }
            });
            this._popupListened = true;
        }
    }

    acceptConfirmation(whitelistDuration) {
        if(!this.confirmations.length)
            return Promise.reject('NO_CONFIRMATIONS');

        if(this.isConfirming)
            return Promise.reject('ALREADY_CONFIRMING');

        this.isConfirming = true;

        const {
            confirmation,
            callback,
            uuid
        } = this.confirmations.pop();

        callback({
            success: true,
            data: confirmation.signedTransaction,
            uuid
        });

        this.isConfirming = false;
        if(this.confirmations.length) {
            this.emit('setConfirmations', this.confirmations);
        }
        this._closePopup();
        this.resetState();
    }

    rejectConfirmation() {
        if(this.isConfirming)
            return Promise.reject('ALREADY_CONFIRMING');

        this.isConfirming = true;

        const {
            confirmation,
            callback,
            uuid
        } = this.confirmations.pop();

        callback({
            success: false,
            data: 'Confirmation declined by user',
            uuid
        });

        this.isConfirming = false;
        if(this.confirmations.length) {
            this.emit('setConfirmations', this.confirmations);
        }
        this._closePopup();
        this.resetState();
    }

    generateAccount() {
        let mnemonic = StorageService.getMnemonic();
        if (!mnemonic) {
            mnemonic = bcbjs.Wallet.createRandom(this.network).mnemonic;
            StorageService.saveMnemonic(mnemonic);
            StorageService.saveAccountIndex(-1);
        }
        let accountIndex = StorageService.getAccountIndex();
        if (!Number.isInteger(accountIndex)) {
            throw new Error('Account index corrupted');
        }
        accountIndex += 1;
        let account = new Account(
            this.network,
            ACCOUNT_TYPE.MNEMONIC,
            mnemonic,
            accountIndex
        );

        StorageService.saveAccountIndex(accountIndex);
        return account;
    }

    /**
     *
     * @param mnemonic
     * @param name
     * @returns {Promise.<boolean>} create an account with mnemonic after confirming by generated mnemonic
     */

    async addAccount(name) {
        logger.info(`Adding account '${ name }' from popup`);

        // if (!this.mnemonic) {
        //     this.mnemonic = StorageService.getMnemonic();
        //     this.accountIndex = StorageService.getAccountIndex();
        // }

        // if(Object.keys(this.accounts).length === 0) {
        //     this.setCache();
        // }
        const account = this.generateAccount();

        const {
            address
        } = account;

        account.name = name;

        this.accounts[ address ] = account;
        StorageService.saveAccount(account);

        this.emit('setAccounts', this.getAccounts());
        this.selectAccount(address);
        return true;
    }
    
    setAccountName({ address, name }) {
        let accountId = this.getMainAddress(address);

        if (!(accountId in this.accounts))
            return false;

        this.accounts[ accountId ].name = name;
        StorageService.saveAccount(this.accounts[ accountId ]);

        if (accountId == this.selectedAccount) {
            this.emit('setAccount', this.getAddress(accountId));
        }
        this.emit('setAccounts', this.getAccounts());
        return true;
    }

    // This and the above func should be merged into one
    /**
     *
     * @param privateKey
     * @param name
     * @returns {Promise.<boolean>}
     */

    async importAccount({ privateKey, name }) {
        logger.info(`Importing account '${ name }' from popup`);

        const account = new Account(
            this.network,
            ACCOUNT_TYPE.PRIVATE_KEY,
            privateKey
        );

        const {
            address
        } = account;

        account.name = name;
        // if(Object.keys(this.accounts).length === 0) {
        //     this.setCache();
        // }
        this.accounts[ address ] = account;
        StorageService.saveAccount(account);

        this.emit('setAccounts', this.getAccounts());
        this.selectAccount(address);
        return true;
    }

    async importMnemonic({ mnemonic, name }) {
        logger.info(`Importing account '${ name }' from popup`);

        const account = new Account(
            this.network,
            ACCOUNT_TYPE.MNEMONIC,
            mnemonic
        );

        const {
            address
        } = account;

        account.name = name;
        // if(Object.keys(this.accounts).length === 0) {
        //     this.setCache();
        // }
        this.accounts[ address ] = account;

        StorageService.saveMnemonic(mnemonic);
        StorageService.saveAccountIndex(0);

        StorageService.saveAccount(account);

        this.emit('setAccounts', this.getAccounts());
        this.selectAccount(address);
        return true;
    }

    async importJsonWallet({ json, password, name }) {
        logger.info(`Adding account '${ name }' from popup`);
        // if(Object.keys(this.accounts).length === 0) {
        //     this.setCache();
        // }

        let wallet = await bcbjs.Wallet.fromEncryptedJson(json, password);
        const account = new Account(
            wallet.network,
            ACCOUNT_TYPE.PRIVATE_KEY,
            wallet.privateKey,
        );

        const {
            address
        } = account;

        account.name = name;

        this.accounts[ address ] = account;
        StorageService.saveAccount(account);

        this.emit('setAccounts', this.getAccounts());
        this.selectAccount(address);
        return true;
    }

    selectAccount(address) {
        address = this.getMainAddress(address);
        this.selectedAccount = address;
        StorageService.selectAccount(address);
        this.emit('setAccount', this.getAddress(address));
        return true;
    }

    getAddress(address) {
        if (address && this.network && this.chain != this.network) {
            return this.network + '[' + this.chain + ']' 
                    + address.slice(this.network.length)
        }
        return address;
    }

    getMainAddress(address) {
        if (address && this.network)
            return address.replace(/\[(.*?)\]/, '');
        return address;
    }

    getAccounts() {
        const accounts = Object.entries(this.accounts).reduce((accounts, [ address, account ]) => {
            address = this.getAddress(address);
            accounts[ address ] = {
                name: account.name,
                type: account.type
            };

            return accounts;
        }, {});

        return accounts;
    }

    async setNetwork(network) {
        logger.info('Set network:', network);
        if (typeof(network) !== 'string') {
            logger.error('Invalid network (not string):', network);
            return false;
        }

        if (Object.values(NETWORK_TYPE).indexOf(network) >= 0) {
            this.network = network;
            StorageService.selectNetwork(this.network);
            await NodeService.setNetwork(this.network);
            await this.setChain(NodeService.getMainChainOfNetwork(this.network));
        }
    }

    getNetwork() {
        return this.network;
    }

    async setChain(chain) {
        logger.info('Set chain to:', chain);

        if (typeof(chain) !== 'string') {
            logger.error('Invalid chain (not string):', chain);
            return false;
        }

        if (this.chain != chain) {
            this.chain = chain;
            StorageService.selectChain(this.chain);
            logger.info('Chain changed to:', this.chain);

            await NodeService.setChain(this.chain);
            this.emit('setChain', { network: this.network, chain: this.chain });

            this.emit('setAccounts', this.getAccounts());
            this.emit('setAccount', this.getAddress(this.selectedAccount));
        }

        return true;
    }

    getChain() {
        logger.info('Get chain:', this.chain);

        return this.chain ? this.chain : '';
    }

    getChainInfo() {
        return {
            network: this.network,
            chain: this.chain
        };
    }

    async selectNode(nodeID) {
        NodeService.selectNode(nodeID);

        // Object.values(this.accounts).forEach(account => (
        //     account.reset()
        // ));

        const node = NodeService.getCurrentNode();

        this.emit('setNode', node);
        return true;
    }

    addNode(node) {
        return this.selectNode(
            NodeService.addNode(node)
        );
    }

    setSetting(setting) {
        StorageService.setSetting(setting);
        this.emit('setSetting', setting);
        return true;
    }

    getSetting() {
        return StorageService.getSetting();
    }

    getRecentToAddress() {
        return StorageService.getRecentTo();
    }

    clearRecentToAddress() {
        StorageService.clearRecentTo();
        return true; 
    }

    setLanguage(language) {
        StorageService.setLanguage(language);
        this.emit('setLanguage', language);
        return true;
    }

    getLanguage() {
        return StorageService.language;
    }

    getAccount(address) {
        return this.accounts[address];
    }

    getAccountDetails(address) {
        if(!address) {
            return {
                type: false,
                name: false,
                address: false
            };
        }

        address = this.getMainAddress(address);
        let details = this.accounts[ address ].getDetails();
        details.address = this.getAddress(details.address);
        return details;
    }

    getSelectedAccount() {
        if(!this.selectedAccount)
            return false;
        return this.getAccountDetails(this.selectedAccount);
    }

    deleteAccount(address) {
        address = this.getMainAddress(address);

        delete this.accounts[ address ];
        StorageService.deleteAccount(address);

        this.emit('setAccounts', this.getAccounts());

        if(!Object.keys(this.accounts).length) {
            this.selectAccount(false);
            this._setState(APP_STATE.UNLOCKED);
            return true;
        }

        this.selectAccount(Object.keys(this.accounts)[ 0 ]);
        return true;
    }

    getConfirmations() {
        return this.confirmations;
    }

    async sendTransaction(transaction) {
        let tx = transaction;
        if (!tx.hasOwnProperty('nonce')) {
            let nonce = await NodeService.getTransactionCount(
                                this.getAddress(this.selectedAccount));
            tx.nonce = (nonce + 1).toString();
        }
        if (this.chain) {
            tx.chain = this.chain;
        }
        let signedTx = await this.accounts[ this.selectedAccount ].signTransaction(tx);
        let txHash = await NodeService.broadcastTransaction(signedTx);
        return txHash;
    }

    async transfer({ coin, to, value, note }) {
        let contract = await NodeService.getTokenAddressBySymbol(coin);
        let nonce = await NodeService.getTransactionCount(
                            this.getAddress(this.selectedAccount));
        let val;
        if (typeof(value) === 'number') {
            val = (value * 1000000000).toFixed().toString();
        } else if (typeof(value) === 'string') {
            val = (parseFloat(value) * 1000000000).toFixed().toString();
        }

        let tx = {
            version: 2,
            note: note,
            gasLimit: '2500',
            nonce: (nonce + 1).toString(),
            calls: [
                {
                    contract: contract,
                    method: 'Transfer(types.Address,bn.Number)',
                    params: [ to, val ]
                }
            ]
        };
        if (this.chain) {
            tx.chain = this.chain;
        }
        let signedTx = await this.accounts[ this.selectedAccount ].signTransaction(tx);

        StorageService.addToRecent(to);
        let txHash = await NodeService.broadcastTransaction(signedTx);
        return txHash;
    }

    exportAccount() {
        const {
            privateKey
        } = this.accounts[ this.selectedAccount ];

        return {
            privateKey
        };
    }

    exportMnemonic() {
        return {
            mnemonic: StorageService.getMnemonic(),
            accountIndex: StorageService.getAccountIndex()
        };
    }

    exportJsonWallet() {
        let password = StorageService.password;
        return this.accounts[ this.selectedAccount ].exportJsonWallet(password);
    }

}
export default Wallet;
