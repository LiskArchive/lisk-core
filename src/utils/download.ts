/*
 * LiskHQ/lisk-commander
 * Copyright © 2020 Lisk Foundation
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
import { bufferToHex, hash } from '@liskhq/lisk-cryptography';
import * as axios from 'axios';
import * as fs from 'fs-extra';

export interface FileInfo {
	readonly fileName: string;
	readonly fileDir: string;
	readonly filePath: string;
}

export const getDownloadedFileInfo = (url: string, downloadDir: string): FileInfo => {
	const pathWithoutProtocol = url.replace(/(^\w+:|^)\/\//, '').split('/');
	const fileName = pathWithoutProtocol.pop() as string;
	const fileDir = `${downloadDir}/${pathWithoutProtocol.join('/')}`;
	const filePath = `${fileDir}/${fileName}`;

	return {
		fileName,
		fileDir,
		filePath,
	};
};

export const download = async (url: string, dir: string): Promise<void> => {
    const { filePath, fileDir } = getDownloadedFileInfo(url,  dir);
    
    if (fs.existsSync(filePath)) {
		fs.unlinkSync(filePath);
	}

	fs.ensureDirSync(fileDir);
	const writeStream = fs.createWriteStream(filePath);
	const response = await axios.default({
		url,
		method: 'GET',
		responseType: 'stream',
    });

    response.data.pipe(writeStream);

	return new Promise<void>((resolve, reject) => {
		writeStream.on('finish', resolve);
		writeStream.on('error', reject);
	});
};