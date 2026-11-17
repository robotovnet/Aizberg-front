module.exports = {
	apps: [
		{
			name: 'Aizberg-front',
			cwd: __dirname,
			script: 'npm',
			args: 'start',
			autorestart: true,
			watch: false,
			max_memory_restart: '500M',
			// interpreter : '~/.nvm/versions/node/v16.14.0/bin/node',
			// instances: 1,
		},
	],
};
