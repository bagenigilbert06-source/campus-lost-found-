import { connectDB } from './config/database.js';
import { initializeFirebase } from './config/firebase.js';
let initialized = false;
let initPromise = null;
export async function initializeServerless() {
    if (initialized) {
        return;
    }
    if (initPromise) {
        return initPromise;
    }
    initPromise = (async () => {
        console.log('[Serverless] initializing database and firebase');
        await connectDB();
        console.log('[Serverless] database connected');
        initializeFirebase();
        console.log('[Serverless] firebase initialized');
        initialized = true;
    })();
    return initPromise;
}
//# sourceMappingURL=serverless.js.map