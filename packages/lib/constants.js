export const APP_STATE = {
    // Wallet is migrating / not unlocked
    UNINITIALISED: 0, // [x] First user creates password
    PASSWORD_SET: 1, // [x] Password is set, but the wallet is locked. Next step is UNLOCKED

    // Wallet is unlocked
    UNLOCKED: 2, // [x] User is given two options - restore account or create new account
    CREATING: 3, // [x] Shown if a user is creating a new account (startup or in general). Next step is READY
    RESTORING: 4, // [x] Shown when the user is restoring (or in general importing) an account. Next step is READY

    // Wallet is functional
    READY: 5, // [x] User is logged in (and at least 1 account exists)
    REQUESTING_CONFIRMATION: 6, // [x] Shown if confirmations are queued
    RECEIVE: 7, //[x] Show if need to accept trx or tokens
    SEND: 8, //[x] Show if need to send trx or tokens
    TRANSACTIONS: 9, //[x] Show transactions record
    SETTING: 10, //[x] Show setting

    LEDGER: 22, // [X] connect ledger wallet
    LEDGER_IMPORT_ACCOUNT: 23 // [X] connect ledger wallet
}; // User can delete *all* accounts. This will set the appState to UNLOCKED.

export const ACCOUNT_TYPE = {
    MNEMONIC: 0,
    PRIVATE_KEY: 1,
    LEDGER:2
};

export const CONFIRMATION_TYPE = {
    STRING: 0,
    TRANSACTION: 1
};

export const NETWORK_TYPE = {
    MAIN: 'bcb',
    TEST: 'bcbtest',
    DEV: 'devtest'
};

