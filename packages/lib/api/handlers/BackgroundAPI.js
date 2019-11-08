export default {
    currentChain: false,
    currentNode: false,
    currentAccount: false,

    init(duplex) {
        this.duplex = duplex;
    },

    setState(appState) {
        this.duplex.send('popup', 'setState', appState, false);
    },

    setChain(chainInfo) {
        this.duplex.send('popup', 'setChain', chainInfo, false);

        if(this.currentChain === chainInfo)
            return;
        const { network, chain } = chainInfo;
        this.duplex.send('tab', 'tunnel', {
            action: 'setChain',
            data: { network, chain }
        }, false);

        this.currentChain = chainInfo;
    },

    setNode(node) {
        this.duplex.send('popup', 'setNode', node, false);

        if(this.currentNode === node)
            return;
        this.duplex.send('tab', 'tunnel', {
            action: 'setNode',
            data: node
        }, false);

        this.currentNode = node;
    },

    setAccount(account) {
        this.duplex.send('popup', 'setAccount', account, false);

        if(this.currentAccount === account)
            return;
        const { address, name } = account;
        this.duplex.send('tab', 'tunnel', {
            action: 'setAccount',
            data: { address, name }
        }, false);

        this.currentAccount = account;
    },

    setAccounts(accounts) {
        this.duplex.send('popup', 'setAccounts', accounts, false);
    },

    setConfirmations(confirmationList) {
        this.duplex.send('popup', 'setConfirmations', confirmationList, false);
    },

    setSetting(setting) {
        this.duplex.send('popup', 'setSetting', setting, false);
    }

};
