#!/usr/bin/env node

import ck from 'ckey';
import keyring from 'keyring';
import notifier from 'node-notifier';
import { checkPasswords } from '../lib/check-passwords.mjs';

async function main() {
    const encryptionKey = ck.ENCRYPTION_KEY || 'hello-world-123';
    const passwordsKey = ck.PWDS_KEY || 'checkmysecrets.pwds';
    // making the assumption commas are generally not allowed in passwords,
    // change the separator sequence if that not the case for you
    const passwordsSeparator = ck.PWDS_SEPARATOR || ',';

    const keyringDb = keyring.instance(encryptionKey).load();
    const passwords = keyringDb.retrieveEncrypted(passwordsKey);

    if (passwords === null) {
        console.warn(
            `'${passwordsKey}' key is not defined in keyring.`,
            'Refer to the README to see how to store secrets with keyring command line.'
        );
        return
    }

    if (typeof passwords !== 'string') {
        console.warn(`'${passwordsKey}' key should only contain a string.`);
        return
    }

    if (!passwords) {
        console.warn(`Could not find any value for '${passwordsKey}' key.`);
        return
    }

    const { compromised, message } = await checkPasswords(passwords.split(passwordsSeparator));

    notifier.notify({
        appID: 'Check My Secrets',
        title: 'Scan result',
        icon: compromised ? 'assets/Error.png' : 'assets/CompleteCheckmark.png',
        message
    });
}

main();
