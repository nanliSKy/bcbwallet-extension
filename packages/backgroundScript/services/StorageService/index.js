import extensionizer from 'extensionizer';
import Logger from '@bcblink/lib/logger';
import Utils from '@bcblink/lib/utils';
const logger = new Logger('StorageService');

const StorageService = {
    // We could instead scope the data so we don't need this array
    storageKeys: [
        'selectedNetwork',
        'chains',
        'selectedChain',
        'nodes',
        'selectedNode',
        'mnemonic',
        'accountIndex',
        'accounts',
        'selectedAccount',
        'recentTo',
        'setting',
        'language'
    ],
    storage: extensionizer.storage.local,

    // storageKeys
    selectedNetwork: false,
    chains: [],
    selectedChain: false,
    nodes: {},
    selectedNode: false,
    mnemonic: false,
    accountIndex: false,
    accounts: {},
    selectedAccount: false,
    setting: {
        unlock: {
            fromTime: 0,
            duration: 0
        },
        autoConfirm: {
            fromTime: 0,
            duration: 0
        }
    },
    recentTo: [],
    language: '',

    // State, keep on reset
    password: false,
    ready: false,

    _reset() {
        this.selectedNetwork = false;
        this.chains = [];
        this.selectedChain = false;

        this.nodes = {};
        this.selectedNode = false;

        this.mnemonic = false;
        this.accountIndex = false;
        this.accounts = {};
        this.selectedAccount = false;
        this.setting = {
            unlock: {
                fromTime: 0,
                duration: 0
            },
            autoConfirm: {
                fromTime: 0,
                duration: 0
            }
        };
        this.recentTo = [];
        this.language = '';
    },

    get hasAccounts() {
        return Object.keys(this.accounts).length;
    },

    getStorage(key) {
        return new Promise(resolve => (
            this.storage.get(key, data => {
                if(key in data)
                    return resolve(data[ key ]);

                resolve(false);
            })
        ));
    },

    async dataExists() {
        return !!(await this.getStorage('accounts'));
    },

    lock() {
        this.password = false;
        this.ready = false;
    },

    async unlock(password) {
        if(this.ready) {
            logger.error('Attempted to decrypt data whilst already unencrypted');
            return Promise.reject('ERRORS.ALREADY_UNLOCKED');
        }

        if(!await this.dataExists())
            return Promise.reject('ERRORS.NOT_SETUP');

        try {
            for(let i = 0; i < this.storageKeys.length; i++) {
                const key = this.storageKeys[ i ];
                const encrypted = await this.getStorage(key);

                if(!encrypted)
                    continue;

                this[ key ] = Utils.decrypt(
                    encrypted,
                    password
                );
            }
        } catch(ex) {
            logger.warn('Failed to decrypt wallet:', ex);
            return Promise.reject('ERRORS.INVALID_PASSWORD');
        }

        logger.info('Decrypted wallet data');

        this.password = password;
        this.ready = true;

        return true;
    },

    hasAccount(address) {
        return (address in this.accounts);
    },

    selectAccount(address) {
        logger.info(`Storing selected account: ${ address }`);

        this.selectedAccount = address;
        this.save('selectedAccount');
    },

    getMnemonic() {
        return this.mnemonic;
    },

    saveMnemonic(mnemonic) {
        this.mnemonic = mnemonic;
        this.save('mnemonic');
    },

    getAccountIndex() {
        return this.accountIndex;
    },

    saveAccountIndex(index) {
        logger.info('Saving account index', index);

        this.accountIndex = index;
        this.save('accountIndex');
    },

    getAccounts() {
        return this.accounts;
    },

    getAccount(address) {
        return this.accounts[ address ];
    },

    deleteAccount(address) {
        logger.info('Deleting account', address);

        delete this.accounts[ address ];
        this.save('accounts');
    },

    saveAccount(account) {
        logger.info('Saving account', account.address);

        this.accounts[ account.address ] = account;

        this.save('accounts');
    },

    saveChains(chains) {
        logger.info('Saving chains', chains);
        this.chains = chains;
        this.save('chains');
    },

    getChains() {
        return this.chains;
    },

    selectNetwork(network) {
        logger.info('Saving selected network', network);

        this.selectedNetwork = network;
        this.save('selectedNetwork');
    },

    getSelectedNetwork() {
        return this.selectedNetwork;
    },

    selectChain(chain) {
        logger.info('Saving selected chain', chain);

        this.selectedChain = chain;
        this.save('selectedChain');
    },

    getSelectedChain() {
        return this.selectedChain;
    },

    saveNodes(node) {
        logger.info('Saving node', node);

        this.nodes = node;
        this.save('nodes');
    },

    deleteNode(nodeId) {
        logger.info('Deleting node', nodeId);

        delete this.nodes[ nodeId ];
        this.save('nodes');
    },

    selectNode(nodeId) {
        logger.info('Saving selected node', nodeId);

        this.selectedNode = nodeId;
        this.save('selectedNode');
    },

    setLanguage(language) {
        logger.info('Saving language', language);
        this.language = language;
        this.save('language');
    },

    getLanguage() {
        return this.language;
    },

    setSetting(setting) {
        logger.info('Saving setting', setting);

        // this.setting = setting;
        Object.keys(setting).forEach(key => {
            this.setting[key] = setting[key];
        })
        this.save('setting');
    },

    getSetting() {
        return this.setting;
    },

    getAutoConfirmSetting() {
        return this.setting.autoConfirm;
    },

    addToRecent(address) {
        let pos = this.recentTo.indexOf(address);
        if (pos >= 0) {
            this.recentTo.splice(pos, 1);
        }
        this.recentTo.unshift(address);
        if (this.recentTo.length > 20) {
            this.recentTo.pop();
        }
        this.save('recentTo');
    },

    getRecentTo() {
        return this.recentTo;
    },

    clearRecentTo() {
        this.recentTo = [];
        this.save('recentTo');
    },

    authenticate(password) {
        this.password = password;
        this.ready = true;

        logger.info('Set storage password');
    },

    save(...keys) {
        if(!this.ready) {
            logger.error('Attempted to write storage when not ready');
            return;
        }

        if(!keys.length)
            keys = this.storageKeys;

        logger.info(`Writing storage for keys ${ keys.join(', ') }`);

        keys.forEach(key => (
            this.storage.set({
                [ key ]: Utils.encrypt(this[ key ], this.password)
            })
        ));

        logger.info('Storage saved');
    },

    async purge() {
        logger.warn('Purging BcbLink. This will remove all stored data');
        return new Promise((resolve, reject) => {
            try {
                this.storage.clear(() => {
                    this._reset();
                    logger.info('Purge complete. Please reload BcbLink');
                    resolve(true);
                });
            } catch (err) {
                logger.error('Purge error.');
                reject('Failed to clear storage');
            }
        });
    }
};

export default StorageService;
