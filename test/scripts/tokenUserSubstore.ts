/*
 * Copyright © 2022 Lisk Foundation
 *
 * See the LICENSE file at the top-level directory of this distribution
 * for licensing information.
 *
 * Unless otherwise agreed in a custom licensing agreement with the Lisk Foundation,
 * no part of this software, including this file, may be copied, modified,
 * propagated, or distributed except according to the terms contained in the
 * LICENSE file.
 *
 * Removal or modification of this copyright notice is prohibited.
 *
 */
import { cryptography } from 'lisk-sdk';

const TOKEN_ID = '0400000000000000';

export const createTokenSubstoreArray = async validators => {
	const userSubstore = validators.map(validator => ({
		address: cryptography.address.getAddressFromLisk32Address(validator.address),
		tokenID: Buffer.from(TOKEN_ID, 'hex'),
		availableBalance: '100000000000000',
		lockedBalances: [],
	}));

	const userSubstoreSorted = userSubstore.sort((a, b) => {
		if (!a.address.equals(b.address)) {
			return a.address.compare(b.address);
		}
		return a.tokenID.compare(b.tokenID);
	});

	const parsedUserSubstore = userSubstoreSorted.map(entry => ({
		...entry,
		address: cryptography.address.getLisk32AddressFromAddress(entry.address),
		tokenID: entry.tokenID.toString('hex'),
	}));

	return parsedUserSubstore;
};
