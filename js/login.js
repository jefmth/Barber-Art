import { auth } from './firebase-config.js';

function openLoginModal() {
  const modal = document.getElementById('loginModal');
  if (!modal) return;
  modal.classList.add('active');
  const container = modal.querySelector('.modal-container');
  window.setTimeout(() => {
    container.style.transform = 'translateY(0)';
    container.style.opacity = '1';
  }, 10);
}

function closeLoginModal() {
  const modal = document.getElementById('loginModal');
  if (!modal) return;
  const container = modal.querySelector('.modal-container');
  container.style.transform = 'translateY(20px)';
  container.style.opacity = '0';
  window.setTimeout(() => {
    modal.classList.remove('active');
    document.getElementById('loginForm')?.reset();
  }, 300);
}

document.addEventListener('DOMContentLoaded', () => {
  document.querySelector('a[href="#admin"]')?.addEventListener('click', (event) => {
    event.preventDefault();
    openLoginModal();
  });
  document.getElementById('closeLoginModal')?.addEventListener('click', closeLoginModal);
  document.getElementById('cancelarLogin')?.addEventListener('click', closeLoginModal);
  document.getElementById('loginModal')?.addEventListener('click', (event) => {
    if (event.target.id === 'loginModal') closeLoginModal();
  });

  document.getElementById('loginForm')?.addEventListener('submit', async (event) => {
    event.preventDefault();
    const submit = event.currentTarget.querySelector('[type="submit"]');
    submit.disabled = true;
    submit.textContent = 'Entrando…';
    try {
      await auth.signInWithEmailAndPassword(
        document.getElementById('email').value.trim(),
        document.getElementById('password').value,
      );
      window.location.assign('admin.html');
    } catch (error) {
      console.error('Falha na autenticação administrativa:', error.code || error.message);
      window.alert('Não foi possível entrar. Confira o e-mail e a senha e tente novamente.');
      submit.disabled = false;
      submit.textContent = 'Entrar';
    }
  });
});
