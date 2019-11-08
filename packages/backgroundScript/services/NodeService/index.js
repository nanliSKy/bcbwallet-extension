import Logger from '@bcblink/lib/logger';
import StorageService from '../StorageService';
import randomUUID from 'uuid/v4';
import axios from 'axios';

import { NETWORK_TYPE } from '@bcblink/lib/constants';
import { resolve } from 'any-promise';

const logger = new Logger('NodeService');

const NodeService = {
    _reset() {
        this._network = false;
        this._chain = false;

        this._updating = false;
        this._chains = [];
        this._nodes = {};

        this._selectedNode = false;

        this._cache = {
            tokenAddress: {},
            tokenSymbol: {}
        }
    },

    async _read() {
        logger.info('Reading nodes from storage');

        if (!StorageService.ready) {
            logger.error('Storage is locked');
            return;
        }

        const chains = StorageService.chains;
        if (chains)
            this._chains = chains;

        const network = StorageService.selectedNetwork;
        if (network)
            this._network = network;

        const chain = StorageService.selectedChain;
        if (chain)
            this._chain = chain;

        const nodes = StorageService.nodes;
        if (nodes)
            this._nodes = nodes;

        const selectedNode = StorageService.selectedNode;
        if (selectedNode)
            this._selectedNode = selectedNode;

        if (this._network && !this._chain && !this._selectedNode) {
            this.fallbackToDefaultNodes();
        }
    },

    init() {
        this._reset();
        this._read();
    },

    async _updateNodes(network, chain, refresh = false) {
        logger.info('Update nodes for network:', network, chain);

        if (this._updating)
            return;
        this._updating = true;

        try {
            let result = await this._getNodesFromWalletServer(network);
            let chains = [];
            let hosts = [];

            Object.keys(result).forEach(key => {
                chains.push(key);
                if (chain == key) {
                    hosts = result[key];
                }
            });
            if (chains.length > 0 && hosts.length > 0) {
                this._chains = chains;
                this.saveChains();
                if (refresh) {
                    this._selectedNode = false;
                    this._nodes = {};
                    hosts.forEach((host) => {
                        this.addNode({ host, network, chain }, false);
                    });
                    this.saveNodes();
                    await this._autoSelectNode();
                } else {
                    Object.keys(this._nodes).forEach(key => {
                        if (key != this._selectedNode) {
                            delete this._nodes[key];
                        }
                    });
                    let index = hosts.indexOf(this._nodes[this._selectedNode].host);
                    if (index >= 0) {
                        hosts.splice(index, 1);
                    }
                    hosts.forEach((host) => {
                        this.addNode({ host: host, chain: chain }, false);
                    });
                    this.saveNodes();
                }
                this._updating = false;
                return;
            } else {
                throw new Error('Got no node for ' + chain + ' chain');
            }
        } catch (err) {
            logger.error('Failed to update nodes:', err);
            this._updating = false;
            throw err;
        }
    },

    async _autoSelectNode() {
        let keys = Object.keys(this._nodes);
        if (keys.length > 0)
            this.selectNode(keys[0]);
            // this.selectNode(keys[ keys.length * Math.random() << 0]);
    },

    _switchNode() {
        if (this._updating)
            return;
        if (!this._selectedNode)
            return this._autoSelectNode();

        let keys = Object.keys(this._nodes);
        keys.forEach((nodeId, index) => {
            if (this._selectedNode == nodeId) {
                let next = (index == keys.length - 1) ? 0 : index + 1;
                return this.selectNode(keys[next]);
            }
        });
    },

    async setNetwork(network) {
        logger.info('setNetwork:', network);

        this._reset();

        if (network)
            this._network = network;
    },

    async setChain(chain) {
        logger.info('setChain:', chain);
        logger.info('curentChain: ', this._chain);

        let refresh = false;
        if (this._chain != chain) {
            this._chain = chain;
            refresh = true;
        }

        try {
            await this._updateNodes(this._network, this._chain, refresh);
        } catch (err) {
            if (chain == this.getMainChainOfNetwork(this._network)) {
                this.fallbackToDefaultNodes();
            } else {
                throw err;
            }
        }
    },

    saveChains() {
        StorageService.saveChains(this._chains);
    },

    async getChains() {
        // if (this._chain) {
        //     await this._updateNodes(this._chain, this._sideChainId);
        // }
        return this._chains;
    },

    saveNodes() {
        StorageService.saveNodes(this._nodes);
    },

    async getNodes() {
        // if (this._chain) {
        //     await this._updateNodes(this._chain, this._sideChainId);
        // }
        return {
            nodes: this._nodes,
            selected: this._selectedNode
        }
    },

    selectNode(nodeId) {
        logger.info('Select node:', nodeId)
        if (this._nodes.hasOwnProperty(nodeId)) {
            this._selectedNode = nodeId;

            StorageService.selectNode(this._selectedNode);
            return true;
        } else {
            return false;
        }
    },

    getSelectedNode() {
        return this._nodes[ this._selectedNode ];
    },

    addNode(node, save = true) {
        const nodeId = randomUUID();

        this._nodes[ nodeId ] = {
            ...node,
            default: false
        };
        if (save)
            this.saveNodes();
        return nodeId;
    },

    deleteNode(nodeId) {
        if (nodeId === this._selectedNode)
            throw new Error('Cannot delete selected node')
        delete this._nodes[ nodeId ];
        this.saveNodes();
        return true;
    },

    getMainChainOfNetwork(network) {
        if (network == NETWORK_TYPE.MAIN) {
            return 'bcb';
        } else if (network == NETWORK_TYPE.TEST) {
            return 'bcbtest';
        } else if (network == NETWORK_TYPE.DEV) {
            return 'devtest';
        } else {
            logger.warn('Assume main chain of network ' + network + ' is ' + network);
            return network;
        }
    },

    fallbackToDefaultNodes() {
        logger.info('Fallback to default nodes');

        if (this._network == NETWORK_TYPE.MAIN) {
            this._nodes = {
                '0bc94c8a-1c73-4d05-8aeb-7ce810a117d9': {
                    host: 'https://mars.bcbchain.io',
                    chain: this.getMainChainOfNetwork(this._network),
                    default: true
                }
            }
            this.saveNodes();
            this.selectNode('0bc94c8a-1c73-4d05-8aeb-7ce810a117d9');
        } else if (this._network == NETWORK_TYPE.TEST) {
            this._nodes = {
                '2c112516-2e65-4f30-8aa4-84a582af7882': {
                    host: 'https://mars.bcbchain.io',
                    chain: this.getMainChainOfNetwork(this._network),
                    default: true
                }
            }
            this.saveNodes();
            this.selectNode('2c112516-2e65-4f30-8aa4-84a582af7882');
        } else if (this._network == NETWORK_TYPE.DEV) {
            this._nodes = {
                '65bf33b5-b8f2-47aa-8b69-fc22eb89c245': {
                    host: 'http://125.208.8.248:46657',
                    chain: this.getMainChainOfNetwork(this._network),
                    default: true
                }
            }
            this.saveNodes();
            this.selectNode('65bf33b5-b8f2-47aa-8b69-fc22eb89c245');
        } else {
            throw new Error('Unsupported network:', this._network);
        }
    },

    _getWalletServer(network) {
        if (network == NETWORK_TYPE.MAIN) {
            return 'https://wallet.bcbchain.io';
        } else if (network == NETWORK_TYPE.TEST) {
            return 'https://testwallet.bcbchain.io';
        } else if (network == NETWORK_TYPE.DEV) {
            return 'https://dwallet.bcbchain.io';
        } else {
            throw new Error('Unsupported network:', network);
        }
    },

    async _getNodesFromWalletServer(network) {
        try {
            let host = this._getWalletServer(network);
            let result = await axios.get(
                host + '/api/v3/chains/all'
            );
            let response = result.data;
            if (response.code != 0) {
                throw new Error(JSON.stringify(result.data));
            }
            return (response.result);
        } catch (err) {
            return Promise.reject(err);
        }
    },

    _setNodeLatency(ms) {
        this._nodes[this._selectedNode].latency = ms;
    },

    async nodeRequest(url, data = false) {
        return new Promise((resolve, reject) => {
            let start = Date.now();
            let axioMethod = data ? axios.post : axios.get;
            axioMethod(url, data).then(result => {
                if (result.status == 200) {
                    this._setNodeLatency(Date.now() - start);
                    resolve(result.data);
                } else {
                    throw new Error('Http response', result.status, url);
                }
            }).catch (err => {
                reject(err);
                this._switchNode();
            });
        });
    },

    async getTransactionCount(address) {
        if (!address) {
            return Promise.reject('No address provided');
        }
        if (!this._selectedNode) {
            return Promise.reject('No node selected');
        }
        try {
            let result = await this.nodeRequest(
                this._nodes[this._selectedNode].host + '/abci_query?path="/account/ex/' + address + '/account"'
            );
            let response = result.result.response;
            if (response.code != 200) {
                throw new Error(JSON.stringify(result));
            }
            let nonce;
            if (!response.hasOwnProperty('value')) {
                nonce = 0;
            } else {
                let value = Base64.decode(response.value);
                let result = JSON.parse(value);
                nonce = result.Nonce;
            }
            // console.log(nonce)
            return (nonce);
        } catch (err) {
            return Promise.reject(err);
        }
    },

    async getBalance(address, tokenAddress) {
        if (!address) {
            return Promise.reject('No address provided');
        }
        if (!tokenAddress) {
            return Promise.reject('No token address provided');
        }
        if (!this._selectedNode) {
            return Promise.reject('No node selected');
        }
        try {
            let result = await this.nodeRequest(
                this._nodes[this._selectedNode].host + '/abci_query?path="/account/ex/' + address + '/token/' + tokenAddress + '"'
            );
            // console.log(result)
            let balance;
            let response = result.result.response;
            if (response.code != 200) {
                throw new Error(JSON.stringify(result));
            }
            if (!response.hasOwnProperty('value')) {
                balance = 0;
            } else {
                let value = Base64.decode(response.value);
                let result = JSON.parse(value);
                balance = result.balance;
            }
            // console.log(balance)
            return (balance);
        } catch (err) {
            return Promise.reject(err);
        }
    },

    async getTokenAddressBySymbol(symbol) {
        if (!symbol) {
            return Promise.reject('No symbol provided');
        }
        if (!this._selectedNode) {
            return Promise.reject('No node selected');
        }
        try {
            symbol = symbol.toLowerCase();
            if (this._cache.tokenAddress.hasOwnProperty(symbol)) {
                return this._cache.tokenAddress[symbol];
            }
            let result = await this.nodeRequest(
                this._nodes[this._selectedNode].host + '/abci_query?path="/token/symbol/' + symbol + '"'
            );
            // console.log(result)
            let response = result.result.response;
            if (response.code != 200) {
                throw new Error(JSON.stringify(result));
            }
            let tokenAddress;
            if (response.hasOwnProperty('value')) {
                let value = Base64.decode(response.value);
                tokenAddress = JSON.parse(value);
                // console.log(tokenAddress)
                this._cache.tokenAddress[symbol] = tokenAddress;
                return (tokenAddress);
            } else {
                throw new Error('No value in response');
            }
        } catch (err) {
            return Promise.reject(err);
        }
    },

    async getTokenSymbolByAddress(tokenAddress) {
        if (!tokenAddress) {
            return Promise.reject('No token address provided');
        }
        if (!this._selectedNode) {
            return Promise.reject('No node selected');
        }
        if (this._cache.tokenSymbol.hasOwnProperty(tokenAddress)) {
            return (this._cache.tokenSymbol[tokenAddress]);
        }
        try {
            let result = await this.nodeRequest(
                this._nodes[this._selectedNode].host + '/abci_query?path="/token/' + tokenAddress + '"'
            );
            // console.log(result)
            let response = result.result.response;
            let symbol;
            if (response.code != 200) {
                throw new Error(JSON.stringify(result));
            }
            if (response.hasOwnProperty('value')) {
                let value = Base64.decode(response.value);
                let result = JSON.parse(value);
                symbol = result.symbol;
                this._cache.tokenSymbol[tokenAddress] = symbol;
                return (symbol);
            } else {
                throw new Error('No value in response');
            }
        } catch (err) {
            return Promise.reject(err);
        }
    },

    async broadcastTransaction(signedTx) {
        if (!signedTx) {
            return Promise.reject('No signed transaction provided');
        }
        if (!this._selectedNode) {
            return Promise.reject('No node selected');
        }
        try {
            let result = await this.nodeRequest(
                this._nodes[this._selectedNode].host + '/broadcast_tx_commit?tx="' + signedTx + '"'
            );
            let response = result.result;
            if (response['check_tx']['code'] != 200 || response['deliver_tx']['code'] != 200) {
                throw new Error(JSON.stringify(result));
            }
            let txHash = response['deliver_tx']['tx_hash'];
            return (txHash);
        } catch (err) {
            return Promise.reject(err);
        }
    },

    async getTransactionCost(calls) {
        if (!this._selectedNode) {
            return Promise.reject('No node selected');
        }
        try {
            let cost = [];
            calls.forEach((call) => {
                if (call.method.includes('Transfer(types.Address,bn.Number-decimal)')) {
                    let value = parseFloat(call.params[1]);
                    cost.push({value, symbol: this.getTokenSymbolByAddress(call.contract)});
                }
                if (call.method.includes('Transfer(types.Address,bn.Number)')) {
                    let value = parseFloat(call.params[1]) / 1000000000;
                    cost.push({value, symbol: this.getTokenSymbolByAddress(call.contract)});
                }
            });
            return Promise.all(cost.map(item => item.symbol.then(symbol => ({...item, symbol}))
                                                            .catch(err => ({...item, symbol: ''}))
                                        ))
        } catch (err) {
            return Promise.reject(err);
        }
    }

};

export default NodeService;
