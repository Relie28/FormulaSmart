import AsyncStorage from '@react-native-async-storage/async-storage';

export default async function safeDispatch(navigation: any, action?: any) {
    try {
        if (!action) {
            // record attempts to dispatch an undefined action for diagnostics
            try {
                const raw = await AsyncStorage.getItem('flashcards_debug');
                const arr = raw ? JSON.parse(raw) : [];
                arr.push({ at: new Date().toISOString(), msg: 'safeDispatch: no action provided' });
                await AsyncStorage.setItem('flashcards_debug', JSON.stringify(arr));
            } catch (e) { /* ignore */ }
            // As a last-resort fallback, try navigating to Home if available so
            // the UI can recover gracefully instead of crashing the app.
            try {
                // Prefer a simple goBack to return the user to the previous screen.
                if (navigation && typeof navigation.goBack === 'function') {
                    navigation.goBack();
                } else if (navigation && typeof navigation.navigate === 'function') {
                    // Fallback to Home if goBack is not available
                    navigation.navigate('Home');
                }
            } catch (e) { /* ignore */ }
            return;
        }

        // sanitize action callbacks that may be passed through navigation
        // some environments may attach `callback` or similar fields that are
        // expected to be functions; ensure they're functions to avoid runtime
        // TypeErrors when navigation internals call them.
        function sanitize(obj: any) {
            if (!obj || typeof obj !== 'object') return;
            if (obj.callback !== undefined && typeof obj.callback !== 'function') {
                obj.callback = () => {};
            }
            if (obj.onComplete !== undefined && typeof obj.onComplete !== 'function') {
                obj.onComplete = () => {};
            }
            if (obj.payload && typeof obj.payload === 'object') sanitize(obj.payload);
        }
        sanitize(action);

        if (navigation && typeof navigation.dispatch === 'function') {
            navigation.dispatch(action);
        } else {
            try {
                const raw = await AsyncStorage.getItem('flashcards_debug');
                const arr = raw ? JSON.parse(raw) : [];
                arr.push({ at: new Date().toISOString(), msg: `safeDispatch: dispatch not available on navigation (typeof dispatch=${typeof (navigation && navigation.dispatch)})` });
                await AsyncStorage.setItem('flashcards_debug', JSON.stringify(arr));
            } catch (e) { /* ignore */ }
        }
    } catch (err) {
        // Persist the failure to AsyncStorage for post-mortem diagnostics,
        // but do not rethrow. We intentionally swallow errors here to avoid
        // taking down the app for a failed navigation dispatch.
        try {
            const raw = await AsyncStorage.getItem('flashcards_debug');
            const arr = raw ? JSON.parse(raw) : [];
            arr.push({ at: new Date().toISOString(), msg: `safeDispatch failed: ${String(err)}` });
            await AsyncStorage.setItem('flashcards_debug', JSON.stringify(arr));
        } catch (e) {
            // ignore
        }
    }
}
