// admin.js - Versão completa e corrigida

const firebaseConfig = {
  apiKey: "AIzaSyBfCW88cgIuY5uLcMyd8v9EeP8Fn3j6OPY",
  authDomain: "tipo-de-ocorrencias.firebaseapp.com",
  databaseURL: "https://tipo-de-ocorrencias-default-rtdb.firebaseio.com",
  projectId: "tipo-de-ocorrencias",
  storageBucket: "tipo-de-ocorrencias.appspot.com",
  messagingSenderId: "66249122861",
  appId: "1:66249122861:web:6749d0fe402337d60e44a4"
};

firebase.initializeApp(firebaseConfig);
const db = firebase.database();

document.addEventListener('DOMContentLoaded', () => {
  // Elementos do DOM
  const container = document.getElementById('lista-agendamentos');
  const agendaContent = document.getElementById('agenda-content');
  const dataBloqueioInput = document.getElementById('data-bloqueio');
  const motivoBloqueioInput = document.getElementById('motivo-bloqueio');
  const btnBloquear = document.getElementById('btn-bloquear');
  const listaBloqueios = document.getElementById('lista-bloqueios');
  const navLinks = document.querySelectorAll('.nav-link');
  
  // Configura a data mínima para o datepicker (hoje)
  const hoje = new Date().toISOString().split('T')[0];
  if (dataBloqueioInput) dataBloqueioInput.min = hoje;

  // Função para formatar data
  const formatarData = (dataISO) => {
    const data = new Date(dataISO);
    return data.toLocaleDateString('pt-BR', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  // Função para carregar agendamentos
  const carregarAgendamentos = () => {
    if (!container) return;
    
    container.innerHTML = '<p>Carregando agendamentos...</p>';
    
    db.ref('agendamentos').orderByChild('data').equalTo(hoje).once('value')
      .then(snapshot => {
        container.innerHTML = '';

        if (!snapshot.exists()) {
          container.innerHTML = '<p>Nenhum agendamento para hoje.</p>';
          return;
        }

        const agendamentos = [];
        snapshot.forEach(child => {
          agendamentos.push({
            key: child.key,
            ...child.val()
          });
        });

        // Ordenar por horário
        agendamentos.sort((a, b) => {
          const [horaA, minutoA] = a.horario.split(':').map(Number);
          const [horaB, minutoB] = b.horario.split(':').map(Number);
          return horaA - horaB || minutoA - minutoB;
        });

        // Exibir agendamentos
        agendamentos.forEach(agendamento => {
          const card = document.createElement('div');
          card.className = 'agendamento-card';
          card.dataset.key = agendamento.key;

          card.innerHTML = `
            <div class="agendamento-content">
              <p class="agendamento-info"><strong>Cliente:</strong> ${agendamento.nome}</p>
              <p class="agendamento-info"><strong>Serviço:</strong> ${agendamento.servico}</p>
              <p class="agendamento-info"><strong>Horário:</strong> ${agendamento.horario}</p>
              <p class="agendamento-info"><strong>Telefone:</strong> ${agendamento.telefone}</p>
            </div>
            <div class="agendamento-actions hidden">
              <button class="btn-cancelar">Cancelar Horário</button>
            </div>
          `;

          // Eventos do card
          card.addEventListener('click', (e) => {
            if (e.target.classList.contains('btn-cancelar')) return;
            card.querySelector('.agendamento-actions').classList.toggle('hidden');
          });

          card.querySelector('.btn-cancelar').addEventListener('click', () => {
            if (confirm(`Cancelar agendamento de ${agendamento.nome} às ${agendamento.horario}?`)) {
              db.ref(`agendamentos/${agendamento.key}`).remove()
                .then(() => {
                  card.classList.add('removing');
                  setTimeout(() => card.remove(), 300);
                  if (!container.children.length) {
                    container.innerHTML = '<p>Nenhum agendamento para hoje.</p>';
                  }
                })
                .catch(err => {
                  console.error("Erro ao cancelar:", err);
                  alert("Erro ao cancelar agendamento.");
                });
            }
          });

          container.appendChild(card);
        });
      })
      .catch(err => {
        console.error("Erro ao carregar agendamentos:", err);
        container.innerHTML = '<p>Erro ao carregar agendamentos.</p>';
      });
  };

  // Função para carregar datas bloqueadas
  const carregarDatasBloqueadas = () => {
    if (!listaBloqueios) return;
    
    listaBloqueios.innerHTML = '<p>Carregando datas bloqueadas...</p>';
    
    db.ref('datasBloqueadas').once('value')
      .then(snapshot => {
        listaBloqueios.innerHTML = '';

        if (!snapshot.exists()) {
          listaBloqueios.innerHTML = '<p>Nenhuma data bloqueada.</p>';
          return;
        }

        const bloqueios = [];
        snapshot.forEach(child => {
          bloqueios.push({
            key: child.key,
            ...child.val()
          });
        });

        // Ordenar por data (mais recente primeiro)
        bloqueios.sort((a, b) => new Date(b.data) - new Date(a.data));

        // Exibir cada bloqueio
        bloqueios.forEach(bloqueio => {
          const item = document.createElement('div');
          item.className = 'bloqueio-item';
          item.dataset.key = bloqueio.key;

          item.innerHTML = `
            <div>
              <span class="bloqueio-data">${formatarData(bloqueio.data)}</span>
              ${bloqueio.motivo ? `<span class="bloqueio-motivo">${bloqueio.motivo}</span>` : ''}
            </div>
            <button class="btn-desbloquear">Desbloquear</button>
          `;

          item.querySelector('.btn-desbloquear').addEventListener('click', () => {
            if (confirm(`Desbloquear a data ${formatarData(bloqueio.data)}?`)) {
              db.ref(`datasBloqueadas/${bloqueio.key}`).remove()
                .then(() => {
                  item.classList.add('removing');
                  setTimeout(() => item.remove(), 300);
                  if (!listaBloqueios.children.length) {
                    listaBloqueios.innerHTML = '<p>Nenhuma data bloqueada.</p>';
                  }
                })
                .catch(err => {
                  console.error("Erro ao desbloquear:", err);
                  alert("Erro ao desbloquear data.");
                });
            }
          });

          listaBloqueios.appendChild(item);
        });
      })
      .catch(err => {
        console.error("Erro ao carregar bloqueios:", err);
        listaBloqueios.innerHTML = '<p>Erro ao carregar datas bloqueadas.</p>';
      });
  };

  // Função para bloquear data
  const bloquearData = () => {
    const data = dataBloqueioInput.value;
    const motivo = motivoBloqueioInput ? motivoBloqueioInput.value.trim() : null;

    if (!data) {
      alert("Selecione uma data.");
      return;
    }

    db.ref('datasBloqueadas').orderByChild('data').equalTo(data).once('value')
      .then(snapshot => {
        if (snapshot.exists()) {
          alert("Data já bloqueada.");
          return;
        }

        const novoBloqueio = {
          data: data,
          motivo: motivo,
          dataBloqueio: new Date().toISOString()
        };

        return db.ref('datasBloqueadas').push(novoBloqueio);
      })
      .then(() => {
        alert(`Data ${formatarData(data)} bloqueada!`);
        dataBloqueioInput.value = '';
        if (motivoBloqueioInput) motivoBloqueioInput.value = '';
        carregarDatasBloqueadas();
      })
      .catch(err => {
        console.error("Erro ao bloquear:", err);
        alert("Erro ao bloquear data.");
      });
  };

  // Eventos
  if (btnBloquear) btnBloquear.addEventListener('click', bloquearData);

  // Navegação entre abas
  if (navLinks.length) {
    navLinks.forEach(link => {
      link.addEventListener('click', (e) => {
        e.preventDefault();
        const target = e.target.getAttribute('href').substring(1);
        
        navLinks.forEach(l => l.classList.remove('active'));
        e.target.classList.add('active');
        
        if (target === 'agendamentos') {
          if (agendaContent) agendaContent.classList.add('hidden');
          if (container) {
            container.classList.remove('hidden');
            carregarAgendamentos();
          }
        } else if (target === 'agenda') {
          if (container) container.classList.add('hidden');
          if (agendaContent) {
            agendaContent.classList.remove('hidden');
            carregarDatasBloqueadas();
          }
        }
      });
    });
    
    // Inicia na aba de agendamentos
    document.querySelector('.nav-link[href="#agendamentos"]')?.click();
  }

  // Inicializações
  carregarAgendamentos();
});