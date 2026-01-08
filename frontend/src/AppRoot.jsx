import { useState } from 'react';
import LoginGate from './LoginGate.jsx';
import App from './App.jsx';

function AppRoot() {
    const [authState, setAuthState] = useState('github');
    // 'guest' | 'github'

    const handleSignOut = () => {
        // TODO later:
        // window.electronAPI.auth.signOut();

        setAuthState('guest');
    };

    if (authState === 'guest') {
        return <LoginGate onAuth={setAuthState} />;
    }

    return <App onSignOut={handleSignOut} />;
}

export default AppRoot;
