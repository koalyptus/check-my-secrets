#!/usr/bin/env node

import ck from 'ckey';
import keyring from 'keyring';
import notifier from 'node-notifier';
import { checkPasswords } from '../lib/check-passwords.mjs';
import { logger } from '../lib/logger.mjs';
import { ERR_OSSL_BAD_DECRYPT, README_STORE_SECRETS } from '../lib/constants.mjs';

async function main() {
    const encryptionKey = ck.ENCRYPTION_KEY || 'hello-world-123';
    const passwordsKey = ck.PWDS_KEY || 'checkmysecrets.pwds';
    // making the assumption commas are generally not allowed in passwords,
    // change the separator sequence if that not the case for you
    const passwordsSeparator = ck.PWDS_SEPARATOR || ',';
    let passwords;

    try {
        const keyringDb = keyring.instance(encryptionKey).load();
        passwords = keyringDb.retrieveEncrypted(passwordsKey);
    } catch (ex) {
        if (ex.code === ERR_OSSL_BAD_DECRYPT) {
            logger.log({
                level: 'warn',
                message: 'Unable to decrypt secrets with provided encryption key. ' + README_STORE_SECRETS
            });

            return
        }

        logger.log({ level: 'error', message: ex });

        return
    }

    if (passwords === null) {
        logger.log({
            level: 'warn',
            message: 'Provided key is not defined in keyring. ' + README_STORE_SECRETS
        });

        return
    }

    if (typeof passwords !== 'string') {
        logger.log({
            level: 'warn',
            message: 'Provided value should only contain a string.'
        });

        return
    }

    if (!passwords) {
        logger.log({
            level: 'warn',
            message: 'Could not find any value for provided key.'
        });

        return
    }

    const { compromised, message } = await checkPasswords(passwords.split(passwordsSeparator));

    notifier.notify({
        appID: 'Check My Secrets',
        title: 'Scan result',
        icon: compromised ? 'assets/Error.png' : 'assets/CompleteCheckmark.png',
        message
    });

    logger.log({
        level: compromised ? 'warn' : 'info',
        message
    });
}

main();
