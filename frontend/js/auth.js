import { apiFetch, setToken, setUser, getToken, getUser, toast } from './app.js';

// Redirect if already logged in
if (getToken() && getUser()) {
  window.location.href = '/';
}

export function initSignup() {
  const form  = document.getElementById('signup-form');
  const error = document.getElementById('form-error');

  form.addEventListener('submit', async e => {
    e.preventDefault();
    error.classList.remove('visible');

    const username = form.username.value.trim();
    const email    = form.email.value.trim();
    const password = form.password.value;
    const confirm  = form.confirm.value;

    if (password !== confirm) {
      error.textContent = 'Passwords do not match';
      error.classList.add('visible');
      return;
    }

    const btn = form.querySelector('button[type=submit]');
    btn.disabled = true;
    btn.textContent = 'Creating account…';

    try {
      const data = await apiFetch('/api/auth/signup', {
        method: 'POST',
        body: JSON.stringify({ username, email, password }),
      });
      setToken(data.token);
      setUser(data.user);
      window.location.href = '/';
    } catch (err) {
      error.textContent = err.message;
      error.classList.add('visible');
      btn.disabled = false;
      btn.textContent = 'Create Account';
    }
  });
}

export function initSignin() {
  const form  = document.getElementById('signin-form');
  const error = document.getElementById('form-error');

  form.addEventListener('submit', async e => {
    e.preventDefault();
    error.classList.remove('visible');

    const email    = form.email.value.trim();
    const password = form.password.value;

    const btn = form.querySelector('button[type=submit]');
    btn.disabled = true;
    btn.textContent = 'Signing in…';

    try {
      const data = await apiFetch('/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      });
      setToken(data.token);
      setUser(data.user);
      window.location.href = '/';
    } catch (err) {
      error.textContent = err.message;
      error.classList.add('visible');
      btn.disabled = false;
      btn.textContent = 'Sign In';
    }
  });
}
