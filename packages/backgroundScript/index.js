import Logger from '@bcblink/lib/logger';
import MessageDuplex from '@bcblink/lib/MessageDuplex';
import NodeService from './services/NodeService';
import StorageService from './services/StorageService';
import WalletService from './services/WalletService';
import Utils from '@bcblink/lib/utils';
import '@bcblink/lib/bcbjs.js';

import axios from 'axios';
import { Base64 } from 'js-base64';
import { CONFIRMATION_TYPE } from '@bcblink/lib/constants';
import { BackgroundAPI } from '@bcblink/lib/api';
import { version } from './package.json';

const duplex = new MessageDuplex.Host();
const logger = new Logger('backgroundScript');

const backgroundScript = {
    walletService: Utils.requestHandler(
        new WalletService()
    ),

    nodeService: Utils.requestHandler(NodeService),

    run() {
        BackgroundAPI.init(duplex);

        this.bindPopupDuplex();
        this.bindTabDuplex();
        this.bindWalletEvents();
    },

    bindPopupDuplex() {
        // Popup Handling (For transaction polling)
        duplex.on('popup:connect', () => (
            this.walletService.startPolling()
        ));

        duplex.on('popup:disconnect', () => (
            this.walletService.stopPolling()
        ));

        //refresh the wallet data
        duplex.on('refresh', this.walletService.refresh);

        // Getter methods
        duplex.on('requestState', ({ resolve }) => resolve(
            this.walletService.state
        ));

        // WalletService: Confirmation responses
        duplex.on('acceptConfirmation', this.walletService.acceptConfirmation);
        duplex.on('rejectConfirmation', this.walletService.rejectConfirmation);

        // WalletService: BLockchain actions
        duplex.on('sendTransaction', this.walletService.sendTransaction);
        duplex.on('transfer', this.walletService.transfer);

        // WalletService: Account management / migration
        duplex.on('addAccount', this.walletService.addAccount);
        duplex.on('setAccountName', this.walletService.setAccountName);
        duplex.on('selectAccount', this.walletService.selectAccount);
        duplex.on('getAccountDetails', this.walletService.getAccountDetails);
        duplex.on('getAccounts', this.walletService.getAccounts);
        duplex.on('importAccount', this.walletService.importAccount);
        duplex.on('importMnemonic', this.walletService.importMnemonic);
        duplex.on('importJsonWallet', this.walletService.importJsonWallet);
        duplex.on('getSelectedAccount', this.walletService.getSelectedAccount);
        duplex.on('getConfirmations', this.walletService.getConfirmations);
        duplex.on('deleteAccount', this.walletService.deleteAccount);
        duplex.on('exportAccount', this.walletService.exportAccount);
        duplex.on('exportMnemonic', this.walletService.exportMnemonic);
        duplex.on('exportJsonWallet', this.walletService.exportJsonWallet);

        // WalletService: State management
        duplex.on('changeState', this.walletService.changeState);
        duplex.on('resetState', this.walletService.resetState);

        // WalletService: Authentication
        duplex.on('setPassword', this.walletService.setPassword);
        duplex.on('changePassword', this.walletService.changePassword);
        duplex.on('unlockWallet', this.walletService.unlockWallet);
        duplex.on('lockWallet', this.walletService.lockWallet);

        // WalletService: Network
        duplex.on('setNetwork', this.walletService.setNetwork);
        duplex.on('getNetwork', this.walletService.getNetwork);
        duplex.on('getAllChains', this.nodeService.getChains);
        duplex.on('setChain', this.walletService.setChain);
        duplex.on('getChain', this.walletService.getChain);

        // NodeService: Node management
        duplex.on('addNode', this.nodeService.addNode);
        duplex.on('deleteNode', this.nodeService.deleteNode);
        duplex.on('resetNodes', this.nodeService.fallbackToDefaultNodes);
        duplex.on('getNodes', this.nodeService.getNodes);
        duplex.on('selectNode', this.nodeService.selectNode);
        duplex.on('getSelectedNode', this.nodeService.getSelectedNode);
        duplex.on('getTokenAddress', this.nodeService.getTokenAddressBySymbol);

        // language
        duplex.on('getLanguage', this.walletService.getLanguage);
        duplex.on('setLanguage', this.walletService.setLanguage);

        // setting
        duplex.on('getSetting', this.walletService.getSetting);
        duplex.on('setSetting', this.walletService.setSetting);

        // recent to address
        duplex.on('getRecentToAddress', this.walletService.getRecentToAddress);
        duplex.on('clearRecentToAddress', this.walletService.clearRecentToAddress);
    },

    bindTabDuplex() {
        duplex.on('tabRequest', async ({ hostname, resolve, data: { action, data, uuid } }) => {
            // Abstract this so we can just do resolve(data) or reject(data)
            // and it will map to { success, data, uuid }

            switch(action) {
            case 'init': {
                const response = {
                    account: {
                        address: false,
                        name: false
                    },
                    chain: {
                        network: false,
                        chain: false
                    }
                };

                if(StorageService.ready) {
                    const { address, name } = this.walletService.getSelectedAccount();
                    const { network, chain } = this.walletService.getChainInfo();
                    response.account = {
                        address,
                        name,
                    };
                    response.chain = {
                        network,
                        chain
                    };
                }

                resolve({
                    success: true,
                    data: response,
                    uuid
                });

                break;
            } case 'getBalance': {
                let tokenAddress = data;
                try {
                    const {
                        selectedAccount
                    } = this.walletService;
                    let balance = await NodeService.getBalance(selectedAccount, tokenAddress);
                    // logger.info(balance)
                    return resolve({
                        success: true,
                        data: balance,
                        uuid
                    });
                } catch (err) {
                    return resolve({
                        success: false,
                        data: 'Failed to query balance: ' + err.message,
                        uuid
                    });
                }
                break;
            } case 'getBalanceBySymbol': {
                let symbol = data;
                try {
                    const {
                        selectedAccount
                    } = this.walletService;
                    let tokenAddress = await NodeService.getTokenAddressBySymbol(symbol);
                    let balance = await NodeService.getBalance(selectedAccount, tokenAddress);
                    // logger.info(balance)
                    return resolve({
                        success: true,
                        data: balance,
                        uuid
                    });
                } catch (err) {
                    return resolve({
                        success: false,
                        data: 'Failed to query balance: ' + err.message,
                        uuid
                    });
                }

                break;
            } case 'signMessage': {
                const {
                    selectedAccount
                } = this.walletService;
                const account = this.walletService.getAccount(selectedAccount);
                account.signMessage(data).then(({ signature, pubkey }) => {
                    let autoConfirm = StorageService.getAutoConfirmSetting();
                    let nowTime = Date.now();
                    if (autoConfirm.fromTime <= nowTime
                        && nowTime < (autoConfirm.fromTime + autoConfirm.duration)) {
                        return resolve({
                            success: true,
                            data: { signature, pubkey },
                            uuid
                        });
                    }

                    this.walletService.queueConfirmation({
                        type: CONFIRMATION_TYPE.STRING,
                        hostname,
                        account: account.name,
                        signedTransaction: { signature, pubkey },
                        input: data,
                    }, uuid, resolve);
                }).catch((err) => {
                    logger.error('Failed to sign message:', err);
                    return resolve({
                        success: false,
                        data: 'Invalid message provided' + err.message,
                        uuid
                    });
                });

                break;
            } case 'signTransaction': {
                let transaction = data;

                try {
                    const {
                        selectedAccount
                    } = this.walletService;
                    const nonce = await NodeService.getTransactionCount(selectedAccount);         
                    transaction.nonce = (nonce + 1).toString();
                    // logger.info(transaction);

                    const account = this.walletService.getAccount(selectedAccount);
                    let signedTx = await account.signTransaction(transaction);
                    // logger.info(signedTx);

                    let autoConfirm = StorageService.getAutoConfirmSetting();
                    let nowTime = Date.now();
                    if (autoConfirm.fromTime <= nowTime
                        && nowTime < (autoConfirm.fromTime + autoConfirm.duration)) {
                        return resolve({
                            success: true,
                            data: signedTx,
                            uuid
                        });
                    }

                    transaction.cost = await NodeService.getTransactionCost(transaction.calls);

                    this.walletService.queueConfirmation({
                        type: CONFIRMATION_TYPE.TRANSACTION,
                        hostname,
                        account: account.name,
                        signedTransaction: signedTx,
                        input: transaction,
                    }, uuid, resolve);
                } catch (err) {
                    logger.error('Failed to sign transaction:', err);
                    return resolve({
                        success: false,
                        data: 'Failed to sign transaction: ' + err.message,
                        uuid
                    });
                }

                break;
            } case 'sendTransaction': {
                let transaction = data;

                let signedTx;
                try {
                    const {
                        selectedAccount
                    } = this.walletService;
                    const nonce = await NodeService.getTransactionCount(selectedAccount);         
                    transaction.nonce = (nonce + 1).toString();
                    // logger.info(transaction);

                    const account = this.walletService.getAccount(selectedAccount);
                    signedTx = await account.signTransaction(transaction);
                    // logger.info(signedTx);

                    let send = (async function(tx, callback) {
                        try {
                            let txHash = await NodeService.broadcastTransaction(tx);
                            return callback({
                                success: true,
                                data: txHash,
                                uuid
                            });
                        } catch (err) {
                            logger.error('Failed to send transaction:', err);
                            return callback({
                                success: false,
                                data: 'Failed to send transaction: ' + err.message,
                                uuid
                            });
                        }
                    }).bind(this);

                    let autoConfirm = StorageService.getAutoConfirmSetting();
                    let nowTime = Date.now();
                    if (autoConfirm.fromTime <= nowTime
                        && nowTime < (autoConfirm.fromTime + autoConfirm.duration)) {
                        return send(signedTx, resolve);
                    }

                    transaction.cost = await NodeService.getTransactionCost(transaction.calls);

                    this.walletService.queueConfirmation({
                        type: CONFIRMATION_TYPE.TRANSACTION,
                        hostname,
                        account: account.name,
                        signedTransaction: signedTx,
                        input: transaction,
                    }, uuid, function(result) {
                        if (result.success) {
                            send(result.data, resolve);
                        } else {
                            resolve(result);
                        }
                    });
                } catch (err) {
                    logger.error('Failed to sign transaction:', err);
                    return resolve({
                        success: false,
                        data: 'Failed to sign transaction: ' + err.message,
                        uuid
                    });
                }

                break;
            } default:
                resolve({
                    success: false,
                    data: 'Unknown method called',
                    uuid
                });
                break;
            }
        });
    },

    bindWalletEvents() {
        this.walletService.on('newState', appState => {
            logger.info('newState: ', appState)
            BackgroundAPI.setState(appState)
        });

        this.walletService.on('setAccount', address => {
            logger.info('setAccount: ', address)
            BackgroundAPI.setAccount(this.walletService.getAccountDetails(address));
        });

        this.walletService.on('setChain', chain => {
            logger.info('setChain: ', chain);
            BackgroundAPI.setChain(chain);
        });

        this.walletService.on('setAccounts', accounts => {
            logger.info('setAccounts: ', JSON.stringify(accounts))
            BackgroundAPI.setAccounts(accounts)
        });

        this.walletService.on('setConfirmations', confirmations => {
            logger.info('setConfirmations: ', confirmations)
            BackgroundAPI.setConfirmations(confirmations)
        });
    }
};

backgroundScript.run();
