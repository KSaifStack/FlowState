import { useState } from 'react';
import LoginGate from './LoginGate.jsx';
import App from './App.jsx';

function AppRoot() {
    const [authState, setAuthState] = useState('guest');
    // 'guest' | 'github'

    const handleSignOut = () => {
        setAuthState('guest');
    };

    if (authState === 'guest') {
        return <LoginGate onAuth={setAuthState} />;
    }

    return <App onSignOut={handleSignOut} />;
}

export default AppRoot;
