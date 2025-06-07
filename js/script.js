// Barber Web - Script JavaScript Completo com Firebase (Atualizado para bloqueio de datas)

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
try {
  firebase.initializeApp(firebaseConfig);
} catch (err) {
  if (!/already exists/.test(err.message)) {
    console.error('Firebase initialization error', err.stack);
  }
}
const database = firebase.database();

document.addEventListener('DOMContentLoaded', function() {
    // Elementos do DOM
    const serviceCards = document.querySelectorAll('.service-card');
    const modal = document.getElementById('agendamentoModal');
    const closeModalBtn = document.getElementById('closeModal');
    const cancelarBtn = document.getElementById('cancelarAgendamento');
    const agendamentoForm = document.getElementById('agendamentoForm');
    const celularInput = document.getElementById('celularCliente');
    const dataInput = document.getElementById('dataAgendamento');
    const horaSelect = document.getElementById('horaAgendamento');

    // Horários disponíveis (09:00 às 21:00 com intervalos de 30 minutos)
    const horariosDisponiveis = (() => {
        const horarios = [];
        for (let hora = 9; hora <= 21; hora++) {
            horarios.push(`${hora.toString().padStart(2, '0')}:00`);
            if (hora < 21) horarios.push(`${hora.toString().padStart(2, '0')}:30`);
        }
        return horarios;
    })();

    // Função para verificar se uma data está bloqueada
   const verificarDataBloqueada = (data) => {
    return database.ref('datasBloqueadas').once('value')
        .then(snapshot => {
            let bloqueada = false;
            snapshot.forEach(child => {
                if (child.val().data === data) {
                    bloqueada = true;
                }
            });
            return bloqueada;
        });
};

    // Inicializar select de horários
    function inicializarHorarios() {
        horaSelect.innerHTML = '<option value="">Selecione</option>';
        horariosDisponiveis.forEach(hora => {
            const option = document.createElement('option');
            option.value = hora;
            option.textContent = hora;
            horaSelect.appendChild(option);
        });
    }
    inicializarHorarios();

    // Verificar se elemento está visível na viewport
    const isElementInViewport = (el) => {
        const rect = el.getBoundingClientRect();
        return (
            rect.top >= 0 &&
            rect.left >= 0 &&
            rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
            rect.right <= (window.innerWidth || document.documentElement.clientWidth)
        );
    };

    // Animação ao scroll
    const handleScroll = () => {
        serviceCards.forEach((card, index) => {
            if (isElementInViewport(card)) {
                setTimeout(() => {
                    card.classList.add('visible');
                }, 100 * index);
            }
        });
    };

    // Inicializar animações
    handleScroll();
    window.addEventListener('scroll', handleScroll);

    // Efeito nos cards de serviço
    serviceCards.forEach(card => {
        card.addEventListener('click', function() {
            this.classList.add('pulse');
            const serviceName = this.querySelector('.service-title').textContent;
            const servicePrice = this.querySelector('.service-price').textContent;
            openAgendamentoModal(serviceName, servicePrice);
            setTimeout(() => this.classList.remove('pulse'), 300);
        });

        card.addEventListener('mouseenter', function() {
            const icon = this.querySelector('.service-icon');
            icon.style.transform = 'scale(1.2) rotate(5deg)';
            icon.style.color = '#FFFFFF';
        });

        card.addEventListener('mouseleave', function() {
            const icon = this.querySelector('.service-icon');
            icon.style.transform = 'scale(1)';
            icon.style.color = '#D4AF37';
        });
    });

    // Modal de agendamento
    function openAgendamentoModal(serviceName, servicePrice) {
        document.getElementById('servicoTipo').value = `${serviceName} - ${servicePrice}`;
        document.getElementById('servicoPreco').value = servicePrice;
        
        const today = new Date().toISOString().split('T')[0];
        dataInput.min = today;
        dataInput.value = today;
        
        atualizarHorariosDisponiveis(today);
        
        modal.classList.add('active');
        setTimeout(() => {
            modal.querySelector('.modal-container').style.transform = 'translateY(0)';
            modal.querySelector('.modal-container').style.opacity = '1';
        }, 10);
    }

    function closeAgendamentoModal() {
        modal.querySelector('.modal-container').style.transform = 'translateY(20px)';
        modal.querySelector('.modal-container').style.opacity = '0';
        setTimeout(() => {
            modal.classList.remove('active');
            agendamentoForm.reset();
            inicializarHorarios();
        }, 300);
    }

    // Eventos do modal
    closeModalBtn.addEventListener('click', closeAgendamentoModal);
    cancelarBtn.addEventListener('click', closeAgendamentoModal);
    modal.addEventListener('click', function(e) {
        if (e.target === modal) closeAgendamentoModal();
    });

    // Máscara para celular
    celularInput.addEventListener('input', function(e) {
        let value = e.target.value.replace(/\D/g, '');
        if (value.length > 11) value = value.substring(0, 11);
        if (value.length > 2) value = `(${value.substring(0, 2)}) ${value.substring(2)}`;
        if (value.length > 10) value = `${value.substring(0, 10)}-${value.substring(10)}`;
        e.target.value = value;
    });

    // Atualizar horários quando a data muda
    dataInput.addEventListener('change', function() {
        if (this.value) atualizarHorariosDisponiveis(this.value);
    });

    // Função para atualizar horários disponíveis
    function atualizarHorariosDisponiveis(data) {
        // Primeiro verifica se a data está bloqueada
        verificarDataBloqueada(data)
            .then((dataBloqueada) => {
                if (dataBloqueada) {
                    // Se a data estiver bloqueada, limpa os campos e mostra alerta
                    dataInput.value = '';
                    horaSelect.innerHTML = '<option value="">Selecione</option>';
                    alert('Esta data está bloqueada para agendamentos. Por favor, escolha outra data.');
                    return Promise.reject('Data bloqueada');
                }
                
                // Se não estiver bloqueada, verifica os horários agendados
                return database.ref('agendamentos').orderByChild('data').equalTo(data).once('value');
            })
            .then((snapshot) => {
                const horariosAgendados = [];
                snapshot.forEach((childSnapshot) => {
                    horariosAgendados.push(childSnapshot.val().horario);
                });

                Array.from(horaSelect.options).forEach(option => {
                    if (option.value && horariosAgendados.includes(option.value)) {
                        option.disabled = true;
                        option.textContent += ' (Indisponível)';
                    } else if (option.value) {
                        option.disabled = false;
                        option.textContent = option.value.split(' (')[0];
                    }
                });
            })
            .catch(error => {
                if (error !== 'Data bloqueada') {
                    console.error("Erro ao buscar horários: ", error);
                }
            });
    }

    // Verificar disponibilidade do horário
    function verificarHorarioDisponivel(data, horario) {
        return database.ref('agendamentos').orderByChild('data_horario').equalTo(`${data}_${horario}`).once('value')
            .then((snapshot) => !snapshot.exists());
    }

    // Envio do formulário
    agendamentoForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const nome = document.getElementById('nomeCliente').value.trim();
        const celular = document.getElementById('celularCliente').value.trim();
        const data = dataInput.value;
        const hora = horaSelect.value;
        const servico = document.getElementById('servicoTipo').value;

        // Validação básica
        if (!nome || !celular || !data || !hora) {
            alert('Por favor, preencha todos os campos obrigatórios.');
            return;
        }

        if (celular.replace(/\D/g, '').length < 11) {
            alert('Por favor, insira um número de celular válido com DDD.');
            return;
        }

        // Fluxo de verificação e agendamento
        verificarDataBloqueada(data)
            .then((dataBloqueada) => {
                if (dataBloqueada) {
                    throw new Error('Esta data está bloqueada para agendamentos');
                }
                return verificarHorarioDisponivel(data, hora);
            })
            .then((disponivel) => {
                if (!disponivel) {
                    throw new Error('Este horário já está agendado');
                }
                
                // Criar objeto de agendamento
                const agendamento = {
                    nome: nome,
                    telefone: celular,
                    data: data,
                    horario: hora,
                    data_horario: `${data}_${hora}`,
                    servico: servico,
                    timestamp: firebase.database.ServerValue.TIMESTAMP
                };

                // Enviar para o Firebase
                return database.ref('agendamentos').push(agendamento);
            })
            .then(() => {
                // Formatar data para exibição
                const dataObj = new Date(data + 'T' + hora);
                const dataFormatada = dataObj.toLocaleDateString('pt-BR', {
                    weekday: 'long',
                    day: '2-digit',
                    month: 'long',
                    year: 'numeric'
                });
                
                // Mensagem de sucesso
                alert(`Agendamento realizado com sucesso!\n\nServiço: ${servico}\nCliente: ${nome}\nData: ${dataFormatada}\nHorário: ${hora}`);
                
                // Fechar modal e resetar formulário
                closeAgendamentoModal();
            })
            .catch((error) => {
                console.error("Erro no agendamento:", error);
                
                if (error.message.includes('bloqueada')) {
                    dataInput.value = '';
                    horaSelect.innerHTML = '<option value="">Selecione</option>';
                } else if (error.message.includes('agendado')) {
                    atualizarHorariosDisponiveis(data);
                }
                
                alert(error.message + '. Por favor, escolha outra data/horário.');
            });
    });

    // Navegação
    document.querySelectorAll('a[href^="#"]:not([href="#admin"])').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            document.querySelector(targetId)?.scrollIntoView({ behavior: 'smooth' });
        });
    });

    // Efeito parallax
    window.addEventListener('mousemove', function(e) {
        const moveX = (e.clientX - window.innerWidth / 2) * 0.01;
        const moveY = (e.clientY - window.innerHeight / 2) * 0.01;
        document.body.style.backgroundPosition = `${moveX}px ${moveY}px`;
    });

    console.log('Barber Web - Inicializado com sucesso!');
});