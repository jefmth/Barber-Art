// Barber Web - Script de Login para Área Administrativa
// Este script gerencia a autenticação de usuários para a área administrativa

import { initializeApp } from "https://www.gstatic.com/firebasejs/9.0.0/firebase-app.js";
import { getAuth, signInWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/9.0.0/firebase-auth.js";

// Configuração do Firebase
const firebaseConfig = {
    apiKey: "AIzaSyBfCW88cgIuY5uLcMyd8v9EeP8Fn3j6OPY",
    authDomain: "tipo-de-ocorrencias.firebaseapp.com",
    databaseURL: "https://tipo-de-ocorrencias-default-rtdb.firebaseio.com",
    projectId: "tipo-de-ocorrencias",
    storageBucket: "tipo-de-ocorrencias.appspot.com",
    messagingSenderId: "66249122861",
    appId: "1:66249122861:web:6749d0fe402337d60e44a4"
};

// Inicializa o Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

// Função para abrir o modal de login
function openLoginModal() {
    const loginModal = document.getElementById('loginModal');
    loginModal.classList.add('active');
    setTimeout(() => {
        loginModal.querySelector('.modal-container').style.transform = 'translateY(0)';
        loginModal.querySelector('.modal-container').style.opacity = '1';
    }, 10);
}

// Função para fechar o modal de login
function closeLoginModal() {
    const loginModal = document.getElementById('loginModal');
    loginModal.querySelector('.modal-container').style.transform = 'translateY(20px)';
    loginModal.querySelector('.modal-container').style.opacity = '0';
    setTimeout(() => {
        loginModal.classList.remove('active');
        document.getElementById('loginForm').reset();
    }, 300);
}

// Inicialização quando o DOM estiver carregado
document.addEventListener('DOMContentLoaded', () => {
    // Adicionar evento de clique ao link Admin
    const adminLink = document.querySelector('a[href="#admin"]');
    if (adminLink) {
        adminLink.addEventListener('click', (e) => {
            e.preventDefault();
            openLoginModal();
        });
    }

    // Configurar eventos do modal
    const closeModalBtn = document.getElementById('closeLoginModal');
    const cancelarBtn = document.getElementById('cancelarLogin');
    const loginModal = document.getElementById('loginModal');

    if (closeModalBtn) {
        closeModalBtn.addEventListener('click', closeLoginModal);
    }

    if (cancelarBtn) {
        cancelarBtn.addEventListener('click', closeLoginModal);
    }

    if (loginModal) {
        loginModal.addEventListener('click', function(e) {
            if (e.target === loginModal) closeLoginModal();
        });
    }

    // Configurar envio do formulário de login
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;

            console.log('Tentando login com:', email);

            // Autenticação com Firebase
            signInWithEmailAndPassword(auth, email, password)
                .then((userCredential) => {
                    console.log('Login bem-sucedido:', userCredential);
                    // Redirecionar para a página de administração
                    window.location.href = "admin.html";
                })
                .catch((error) => {
                    console.error('Erro de login:', error);
                    alert('Usuário ou senha incorretos');
                });
        });
    }
});

// Exportar funções para uso externo
export { openLoginModal, closeLoginModal };

