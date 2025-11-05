const buildApp = require('../server/app');

const app = buildApp();

module.exports = (req, res) => {
	// When running on Vercel the rewrite forwards /api/:path* to /api/index?path=:path*
	// Restore the original request path so Express routing still works as expected.
	if (req.url.startsWith('/api/index')) {
		const host = req.headers['x-forwarded-host'] || req.headers.host || 'localhost';
		const protocol = req.headers['x-forwarded-proto'] || 'https';
		const parsedUrl = new URL(`${protocol}://${host}${req.url}`);
		const rawPath = parsedUrl.searchParams.get('path');

		if (rawPath) {
			parsedUrl.searchParams.delete('path');
			const restoredPath = decodeURIComponent(rawPath);
			const search = parsedUrl.searchParams.toString();
			req.url = `/api/${restoredPath}${search ? `?${search}` : ''}`;
		}
	}

	return app(req, res);
};
