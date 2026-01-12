import { useState } from 'react';
import { Login } from './Login';
import { SignUp } from './SignUp';
import { ResetPassword } from './ResetPassword';

type AuthView = 'login' | 'signup' | 'reset';

export function AuthContainer() {
  const [view, setView] = useState<AuthView>('login');

  if (view === 'signup') {
    return <SignUp onToggleView={setView} />;
  }

  if (view === 'reset') {
    return <ResetPassword onToggleView={setView} />;
  }

  return <Login onToggleView={setView} />;
}
