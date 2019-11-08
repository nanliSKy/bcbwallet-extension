export default {
    init(duplex) {
        this.duplex = duplex;
    },

    //Data refresh

    refresh() {
        return this.duplex.send('refresh');
    },

    // Data requesting

    requestState() {
        return this.duplex.send('requestState');
    },

    changeState(appState) {
        return this.duplex.send('changeState', appState);
    },

    resetState() {
        return this.duplex.send('resetState');
    },

    getConfirmations() {
        return this.duplex.send('getConfirmations');
    },

    // Confirmation actions

    acceptConfirmation(whitelistDuration) {
        return this.duplex.send('acceptConfirmation', whitelistDuration, false);
    },

    rejectConfirmation() {
        return this.duplex.send('rejectConfirmation', {}, false);
    },

    // Transaction handling

    sendTransaction(transaction) {
        return this.duplex.send('sendTransaction', transaction);
    },

    transfer(coin, to, value, note) {
        return this.duplex.send('transfer', { coin, to, value, note });
    },

    // Account control

    importAccount(privateKey, name) {
        return this.duplex.send('importAccount', { privateKey, name });
    },

    importMnemonic(mnemonic, name) {
        return this.duplex.send('importMnemonic', { mnemonic, name });
    },

    importJsonWallet(json, password, name) {
        return this.duplex.send('importJsonWallet', { json, password, name });
    },

    addAccount(name) {
        return this.duplex.send('addAccount', name);
    },

    setAccountName(address, name) {
        return this.duplex.send('setAccountName', { address, name });
    },

    selectAccount(address) {
        return this.duplex.send('selectAccount', address);
    },

    deleteAccount(address) {
        return this.duplex.send('deleteAccount', address);
    },

    getAccounts() {
        return this.duplex.send('getAccounts');
    },

    exportAccount() {
        return this.duplex.send('exportAccount');
    },

    exportMnemonic() {
        return this.duplex.send('exportMnemonic');
    },

    exportJsonWallet() {
        return this.duplex.send('exportJsonWallet');
    },

    getSelectedAccount() {
        return this.duplex.send('getSelectedAccount');
    },

    getAccountDetails(address) {
        return this.duplex.send('getAccountDetails', address);
    },

    // Network

    setNetwork(network) {
        return this.duplex.send('setNetwork', network);
    },

    getNetwork() {
        return this.duplex.send('getNetwork');
    },

    getAllChains() {
        return this.duplex.send('getAllChains');
    },

    setChain(chain) {
        return this.duplex.send('setChain', chain);
    },

    getChain() {
        return this.duplex.send('getChain');
    },

    // Node control

    addNode(node) {
        return this.duplex.send('addNode', node);
    },

    deleteNode() {
        return this.duplex.send('deleteNode');
    },

    resetNodes() {
        return this.duplex.send('resetNodes');
    },

    getNodes() {
        return this.duplex.send('getNodes');
    },

    selectNode(nodeId) {
        return this.duplex.send('selectNode', nodeId);
    },

    getSelectedNode() {
        return this.duplex.send('getSelectedNode');
    },

    getTokenAddress(symbol) {
        return this.duplex.send('getTokenAddress', symbol);
    },

    // Wallet authentication

    setPassword(password) {
        return this.duplex.send('setPassword', password);
    },

    changePassword(oldPassword, newPassword) {
        return this.duplex.send('changePassword', { oldPassword, newPassword });
    },

    unlockWallet(password) {
        return this.duplex.send('unlockWallet', password);
    },

    lockWallet() {
        return this.duplex.send('lockWallet');
    },

    getLanguage() {
        return this.duplex.send('getLanguage');
    },

    setLanguage(language) {
        return this.duplex.send('setLanguage', language);
    },

    getSetting() {
        return this.duplex.send('getSetting');
    },

    setSetting(setting) {
        return this.duplex.send('setSetting', setting);
    },

    getRecentToAddress() {
        return this.duplex.send('getRecentToAddress');
    },

    clearRecentToAddress() {
        return this.duplex.send('clearRecentToAddress');
    }
}
