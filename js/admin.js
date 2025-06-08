// admin.js - Painel administrativo completo

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
  const agendamentosContent = document.getElementById('agendamentos-content');
  const agendaContent = document.getElementById('agenda-content');
  const navLinks = document.querySelectorAll('.nav-link');
  
  // Configura a data mínima para o datepicker (hoje)
  document.getElementById('data-bloqueio').min = new Date().toISOString().split('T')[0];
  
  // Navegação entre abas
  navLinks.forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      const target = e.target.getAttribute('href').substring(1);
      
      navLinks.forEach(l => l.classList.remove('active'));
      e.target.classList.add('active');
      
      if (target === 'agendamentos') {
        agendamentosContent.classList.remove('hidden');
        agendaContent.classList.add('hidden');
        carregarAgendamentos();
      } else if (target === 'agenda') {
        agendamentosContent.classList.add('hidden');
        agendaContent.classList.remove('hidden');
        carregarDatasBloqueadas();
      }
    });
  });
  
  // Inicia com a aba de agendamentos
  document.querySelector('.nav-link[href="#agendamentos"]').click();
  
  // Configura o botão de bloquear data
  document.getElementById('btn-bloquear').addEventListener('click', bloquearData);
});

function carregarAgendamentos() {
  const container = document.getElementById('lista-agendamentos');
  const hoje = new Date().toISOString().split('T')[0];

  db.ref('agendamentos').orderByChild('data').equalTo(hoje).once('value')
    .then(snapshot => {
      container.innerHTML = ''; // limpa conteúdo inicial

      if (!snapshot.exists()) {
        container.innerHTML = '<p>Nenhum agendamento para hoje.</p>';
        return;
      }

      // Coletar todos agendamentos em um array
      const agendamentos = [];
      snapshot.forEach(child => {
        agendamentos.push({
          key: child.key,
          ...child.val()
        });
      });

      // Ordenar por horário (formato HH:MM)
      agendamentos.sort((a, b) => {
        const [horaA, minutoA] = a.horario.split(':').map(Number);
        const [horaB, minutoB] = b.horario.split(':').map(Number);
        
        if (horaA === horaB) {
          return minutoA - minutoB;
        }
        return horaA - horaB;
      });

      // Exibir agendamentos ordenados
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

        card.addEventListener('click', (e) => {
          if (e.target.classList.contains('btn-cancelar')) {
            e.stopPropagation();
            return;
          }
          
          const actions = card.querySelector('.agendamento-actions');
          actions.classList.toggle('hidden');
        });

        const btnCancelar = card.querySelector('.btn-cancelar');
        btnCancelar.addEventListener('click', () => {
          if (confirm(`Deseja realmente cancelar o horário de ${agendamento.nome} às ${agendamento.horario}?`)) {
            db.ref(`agendamentos/${agendamento.key}`).remove()
              .then(() => {
                card.classList.add('removing');
                setTimeout(() => {
                  card.remove();
                  if (container.children.length === 0) {
                    container.innerHTML = '<p>Nenhum agendamento para hoje.</p>';
                  }
                }, 300);
              })
              .catch(err => {
                console.error("Erro ao cancelar agendamento:", err);
                alert("Ocorreu um erro ao cancelar o agendamento.");
              });
          }
        });

        container.appendChild(card);
      });
    })
    .catch(err => {
      console.error("Erro ao carregar agendamentos:", err);
      container.innerHTML = "<p>Erro ao carregar dados.</p>";
    });
}

function carregarDatasBloqueadas() {
  const container = document.getElementById('lista-bloqueios');
  
  db.ref('datasBloqueadas').once('value')
    .then(snapshot => {
      container.innerHTML = ''; // limpa conteúdo inicial

      if (!snapshot.exists()) {
        container.innerHTML = '<p>Nenhuma data bloqueada.</p>';
        return;
      }

      // Converter para array e ordenar por data
      const bloqueios = [];
      snapshot.forEach(child => {
        bloqueios.push({
          key: child.key,
          ...child.val()
        });
      });

      // Ordenar por data (mais recente primeiro)
      bloqueios.sort((a, b) => new Date(a.data) - new Date(b.data));

      // Exibir datas bloqueadas
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

        const btnDesbloquear = item.querySelector('.btn-desbloquear');
        btnDesbloquear.addEventListener('click', () => {
          if (confirm(`Deseja desbloquear a data ${formatarData(bloqueio.data)}?`)) {
            db.ref(`datasBloqueadas/${bloqueio.key}`).remove()
              .then(() => {
                item.classList.add('removing');
                setTimeout(() => {
                  item.remove();
                  if (container.children.length === 0) {
                    container.innerHTML = '<p>Nenhuma data bloqueada.</p>';
                  }
                }, 300);
              })
              .catch(err => {
                console.error("Erro ao desbloquear data:", err);
                alert("Ocorreu um erro ao desbloquear a data.");
              });
          }
        });

        container.appendChild(item);
      });
    })
    .catch(err => {
      console.error("Erro ao carregar datas bloqueadas:", err);
      container.innerHTML = "<p>Erro ao carregar dados.</p>";
    });
}

function bloquearData() {
  const dataInput = document.getElementById('data-bloqueio');
  const motivoInput = document.getElementById('motivo-bloqueio');
  const data = dataInput.value;
  const motivo = motivoInput.value.trim();

  if (!data) {
    alert("Por favor, selecione uma data.");
    return;
  }

  // Verifica se a data já está bloqueada
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

      // Adiciona a nova data bloqueada
      const novoBloqueio = {
        data: data,
        motivo: motivo || null,
        dataBloqueio: new Date().toISOString()
      };

      db.ref('datasBloqueadas').push(novoBloqueio)
        .then(() => {
          alert(`Data ${formatarData(data)} bloqueada com sucesso!`);
          dataInput.value = '';
          motivoInput.value = '';
          carregarDatasBloqueadas();
        })
        .catch(err => {
          console.error("Erro ao bloquear data:", err);
          alert("Ocorreu um erro ao bloquear a data.");
        });
    })
    .catch(err => {
      console.error("Erro ao verificar datas bloqueadas:", err);
      alert("Ocorreu um erro ao verificar as datas bloqueadas.");
    });
}

function formatarData(dataISO) {
  const data = new Date(dataISO);
  return data.toLocaleDateString('pt-BR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });
}