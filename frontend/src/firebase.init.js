// build firebaseConfig from env; prefer individual VITE_ vars, fallback to VITE_FIREBASE_CONFIG_JSON
function getEnvObject() {
	// Prefer Vite's import.meta.env when available (use a runtime-evaluated function to avoid syntax errors
	// in environments/parsers that don't support the `import` keyword or `import.meta` in this context).
	try {
		const viteEnv = Function('return (typeof import !== \"undefined\" && typeof import.meta !== \"undefined\" ? import.meta.env : undefined)')();
		if (viteEnv) {
			return viteEnv;
		}
	} catch (e) {
		// ignore if import.meta isn't supported or evaluating it fails
	}

	// Fallback to Node-style process.env (server-side or some bundlers)
	if (typeof process !== 'undefined' && process.env) {
		return process.env;
	}
	// Fallback to global window.__env if some scripts set it
	if (typeof window !== 'undefined' && window.__env) {
		return window.__env;
	}
	return {};
}

function getFirebaseConfig() {
	const env = getEnvObject();

	// Prefer individual VITE_ variables (common with Vite)
	const apiKey = env.VITE_FIREBASE_API_KEY;
	const projectId = env.VITE_FIREBASE_PROJECT_ID;
	if (apiKey && projectId) {
		return {
			apiKey,
			authDomain: env.VITE_FIREBASE_AUTH_DOMAIN || env.VITE_FIREBASE_AUTHDOMAIN || undefined,
			projectId,
			storageBucket: env.VITE_FIREBASE_STORAGE_BUCKET || undefined,
			messagingSenderId: env.VITE_FIREBASE_MESSAGING_SENDER_ID || undefined,
			appId: env.VITE_FIREBASE_APP_ID || undefined,
			measurementId: env.VITE_FIREBASE_MEASUREMENT_ID || undefined
		};
	}

	// Fallback: single JSON string env
	const json = env.VITE_FIREBASE_CONFIG_JSON || env.VITE_FIREBASE_CONFIG;
	if (json) {
		try {
			const parsed = typeof json === 'string' ? JSON.parse(json) : parsed;
			if (parsed && parsed.apiKey && parsed.projectId) {
				return {
					apiKey: parsed.apiKey,
					authDomain: parsed.authDomain,
					projectId: parsed.projectId,
					storageBucket: parsed.storageBucket,
					messagingSenderId: parsed.messagingSenderId,
					appId: parsed.appId,
					measurementId: parsed.measurementId
				};
			}
		} catch (err) {
			throw new Error('VITE_FIREBASE_CONFIG_JSON is present but contains invalid JSON.');
		}
	}

	// Still missing -> helpful error
	throw new Error(
		'Firebase configuration is incomplete. Missing environment variables: VITE_FIREBASE_API_KEY, VITE_FIREBASE_PROJECT_ID. ' +
		'Please add your Firebase web app config to frontend/.env.local (Vite reads that) or set VITE_FIREBASE_CONFIG_JSON. ' +
		'Then restart the dev server. See README / SETUP_GUIDE.md for details.'
	);
}

const firebaseConfig = getFirebaseConfig();

// ...existing code to initialize Firebase with firebaseConfig...