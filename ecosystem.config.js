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

module.exports = {
	apps: [
		{
			name: 'lisk-core',
			script: './bin/run',
			args: 'start --network=mainnet --api-ipc --api-ws --console-log=info',
			// env: {
			// 	LISK_NETWORK: 'mainnet',
			// 	LISK_API_IPC: true,
			// 	LISK_ENABLE_FORGER_PLUGIN: true,
			// 	LISK_API_WS: true,
			// 	LISK_API_WS_PORT: 7887,
			// 	LISK_CONSOLE_LOG_LEVEL: 'warn',
			// },
			pid_file: './pids/lisk-core.pid',
			out_file: './logs/lisk-core.log',
			error_file: './logs/lisk-core.err',
			log_date_format: 'YYYY-MM-DD HH:mm:ss',
		},
	],
	deploy: {
		local: {
			host: '127.0.0.1',
			key: process.env.HOME + '/.ssh/id_rsa',
			ref: 'origin/main',
			repo: 'https://github.com/LiskHQ/lisk-core.git',
			path: '/tmp/lisk-core',
			'pre-setup': 'rm -rf /tmp/lisk-core',
			'post-setup': 'source ~/.bashrc; source ~/.zshrc; nvm install && npm ci && npm run build',
			'pre-deploy': 'source ~/.bashrc; source ~/.zshrc; pm2 del lisk-core;:',
			'post-deploy': 'source ~/.bashrc; source ~/.zshrc; pm2 start ecosystem.config.js',
		},
		remote: {
			host: ['8.8.8.8'],
			user: '{USER_NAME}',
			key: process.env.HOME + '/.ssh/id_rsa',
			ref: 'origin/main',
			repo: 'https://github.com/LiskHQ/lisk-core.git',
			path: '/tmp/lisk-core',
			'pre-setup': 'rm -rf /tmp/lisk-core',
			'post-setup': 'source ~/.bashrc; nvm install && npm ci && npm run build',
			'pre-deploy': 'source ~/.bashrc; pm2 del lisk-core;:',
			'post-deploy': 'source ~/.bashrc; pm2 start ecosystem.config.js',
		},
	},
};
