import { Capacitor } from '@capacitor/core';
import { LocalNotifications } from '@capacitor/local-notifications';
import { auth, database } from './firebase-config.js';
import { appointmentDateKey, normalizeAppointmentDate } from './admin-date-utils.js';

document.addEventListener('DOMContentLoaded', () => {
  const appointmentList = document.getElementById('lista-agendamentos');
  const blockedList = document.getElementById('lista-bloqueios');
  const notificationsList = document.getElementById('lista-notificacoes');
  const appointmentDate = document.getElementById('filtro-data');
  const blockedDate = document.getElementById('data-bloqueio');
  const blockedReason = document.getElementById('motivo-bloqueio');
  const unreadBadge = document.getElementById('notification-count');
  const navLinks = [...document.querySelectorAll('.nav-link')];
  const panels = {
    agendamentos: document.getElementById('agendamentos-content'),
    notificacoes: document.getElementById('notificacoes-content'),
    agenda: document.getElementById('agenda-content'),
  };
  const notificationStorageKey = 'barber-art-admin-notifications-v1';
  const today = localDateISO(new Date());
  const seenAppointmentKeys = new Set();
  const pendingAdds = [];
  const pendingRemovals = [];
  let bootstrapping = true;
  let notifications = loadNotifications();
  let androidNotificationsReady = Promise.resolve();
  let appointmentRenderVersion = 0;

  function localDateISO(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  function formatDate(value, options = {}) {
    if (!value) return 'Data não informada';
    const normalized = normalizeAppointmentDate(value);
    if (!normalized) return String(value);
    const [year, month, day] = normalized.split('-').map(Number);
    return new Date(year, month - 1, day).toLocaleDateString('pt-BR', options);
  }

  function loadNotifications() {
    try {
      const saved = JSON.parse(localStorage.getItem(notificationStorageKey) || '[]');
      return Array.isArray(saved) ? saved.slice(0, 30) : [];
    } catch {
      return [];
    }
  }

  function saveNotifications() {
    localStorage.setItem(notificationStorageKey, JSON.stringify(notifications.slice(0, 30)));
    renderNotifications();
  }

  function addNotification(type, appointmentKey, appointment) {
    const id = `${type}-${appointmentKey}`;
    if (notifications.some((item) => item.id === id)) return;
    const title = type === 'booking' ? 'Novo agendamento' : 'Agendamento cancelado';
    const detail = [appointment.servico, formatDate(appointment.data), appointment.horario]
      .filter(Boolean)
      .join(' · ');
    notifications.unshift({ id, type, title, detail, createdAt: Date.now(), read: false });
    notifications = notifications.slice(0, 30);
    saveNotifications();
    showToast(`${title}: ${detail}`);
    notifyAndroid(id, title, detail).catch((error) => {
      console.error('Não foi possível mostrar a notificação Android:', error);
    });
  }

  async function notifyAndroid(id, title, detail) {
    if (Capacitor.getPlatform() !== 'android') return;
    await androidNotificationsReady;
    const permission = await LocalNotifications.checkPermissions();
    if (permission.display !== 'granted') return;
    const notificationId = Math.abs([...id].reduce((hash, char) => (hash * 31 + char.charCodeAt(0)) | 0, 0)) || 1;
    await LocalNotifications.schedule({
      notifications: [{
        id: notificationId,
        title,
        body: detail || 'A agenda da Barber Art foi atualizada.',
        channelId: 'agenda',
        schedule: { at: new Date(Date.now() + 1200) },
      }],
    });
  }

  async function prepareAndroidNotifications() {
    if (Capacitor.getPlatform() !== 'android') return;
    let permission = await LocalNotifications.checkPermissions();
    if (permission.display !== 'granted') {
      permission = await LocalNotifications.requestPermissions();
    }
    if (permission.display === 'granted') {
      await LocalNotifications.createChannel({
        id: 'agenda',
        name: 'Agenda da barbearia',
        description: 'Novos agendamentos e cancelamentos',
        importance: 5,
        visibility: 1,
      });
    }
  }

  function showToast(message) {
    let toast = document.getElementById('admin-toast');
    if (!toast) {
      toast = document.createElement('div');
      toast.id = 'admin-toast';
      toast.className = 'admin-toast';
      toast.setAttribute('role', 'status');
      document.body.appendChild(toast);
    }
    toast.textContent = message;
    toast.classList.add('visible');
    window.clearTimeout(showToast.timeout);
    showToast.timeout = window.setTimeout(() => toast.classList.remove('visible'), 5000);
  }

  function renderNotifications() {
    if (!notificationsList) return;
    const unread = notifications.filter((item) => !item.read).length;
    if (unreadBadge) {
      unreadBadge.textContent = unread > 99 ? '99+' : String(unread);
      unreadBadge.classList.toggle('hidden', unread === 0);
      unreadBadge.setAttribute('aria-label', `${unread} notificações não lidas`);
    }
    notificationsList.replaceChildren();
    if (!notifications.length) {
      const empty = document.createElement('p');
      empty.className = 'empty-state';
      empty.textContent = 'Ainda não há notificações. Novos agendamentos e cancelamentos aparecerão aqui enquanto este app estiver aberto.';
      notificationsList.appendChild(empty);
      return;
    }
    notifications.forEach((notification) => {
      const item = document.createElement('article');
      item.className = `notification-card${notification.read ? '' : ' unread'}`;
      const title = document.createElement('strong');
      title.textContent = notification.title;
      const detail = document.createElement('p');
      detail.textContent = notification.detail;
      const date = document.createElement('time');
      date.dateTime = new Date(notification.createdAt).toISOString();
      date.textContent = new Date(notification.createdAt).toLocaleString('pt-BR');
      item.append(title, detail, date);
      notificationsList.appendChild(item);
    });
  }

  function renderAppointments() {
    if (!appointmentList) return;
    const renderVersion = ++appointmentRenderVersion;
    const selectedDate = appointmentDate.value || today;
    appointmentList.replaceChildren();
    appointmentList.textContent = 'Carregando agendamentos...';
    database.ref('agendamentos').once('value')
      .then((snapshot) => {
        if (renderVersion !== appointmentRenderVersion) return;
        appointmentList.replaceChildren();
        const appointments = [];
        snapshot.forEach((child) => {
          const value = child.val();
          if (!value || typeof value !== 'object' || appointmentDateKey(value) !== selectedDate) return;
          appointments.push({ key: child.key, ...value });
        });
        if (!appointments.length) {
          const empty = document.createElement('p');
          empty.className = 'empty-state';
          empty.textContent = 'Nenhum agendamento nesta data.';
          appointmentList.appendChild(empty);
          return;
        }
        appointments.sort((a, b) => (a.horario || '').localeCompare(b.horario || ''));
        appointments.forEach((appointment) => {
          const card = document.createElement('article');
          card.className = 'agendamento-card';
          const content = document.createElement('div');
          content.className = 'agendamento-content';
          [
            ['Cliente', appointment.nome],
            ['Serviço', appointment.servico],
            ['Horário', appointment.horario],
            ['Telefone', appointment.telefone],
          ].forEach(([label, value]) => {
            const line = document.createElement('p');
            line.className = 'agendamento-info';
            const strong = document.createElement('strong');
            strong.textContent = `${label}: `;
            line.append(strong, document.createTextNode(value || '—'));
            content.appendChild(line);
          });
          const actions = document.createElement('div');
          actions.className = 'agendamento-actions';
          const cancel = document.createElement('button');
          cancel.type = 'button';
          cancel.className = 'btn-cancelar';
          cancel.textContent = 'Cancelar horário';
          cancel.addEventListener('click', () => cancelAppointment(appointment));
          actions.appendChild(cancel);
          card.append(content, actions);
          appointmentList.appendChild(card);
        });
      })
      .catch((error) => {
        if (renderVersion !== appointmentRenderVersion) return;
        console.error('Erro ao carregar agendamentos:', error);
        appointmentList.replaceChildren();
        const message = document.createElement('p');
        message.className = 'empty-state';
        message.textContent = 'Não foi possível carregar os agendamentos. Verifique a conexão.';
        appointmentList.appendChild(message);
      });
  }

  function cancelAppointment(appointment) {
    if (!window.confirm(`Cancelar o agendamento de ${appointment.nome || 'cliente'} às ${appointment.horario || '—'}?`)) return;
    database.ref(`agendamentos/${appointment.key}`).remove()
      .then(() => renderAppointments())
      .catch((error) => {
        console.error('Erro ao cancelar agendamento:', error);
        window.alert('Não foi possível cancelar o agendamento. Verifique a conexão e tente novamente.');
      });
  }

  function renderBlockedDates() {
    if (!blockedList) return;
    blockedList.textContent = 'Carregando datas bloqueadas...';
    database.ref('datasBloqueadas').once('value')
      .then((snapshot) => {
        blockedList.replaceChildren();
        if (!snapshot.exists()) {
          const empty = document.createElement('p');
          empty.className = 'empty-state';
          empty.textContent = 'Nenhuma data bloqueada.';
          blockedList.appendChild(empty);
          return;
        }
        const blocks = [];
        snapshot.forEach((child) => blocks.push({ key: child.key, ...child.val() }));
        blocks.sort((a, b) => (b.data || '').localeCompare(a.data || ''));
        blocks.forEach((block) => {
          const item = document.createElement('div');
          item.className = 'bloqueio-item';
          const description = document.createElement('div');
          const date = document.createElement('span');
          date.className = 'bloqueio-data';
          date.textContent = formatDate(block.data, { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
          description.appendChild(date);
          if (block.motivo) {
            const reason = document.createElement('span');
            reason.className = 'bloqueio-motivo';
            reason.textContent = block.motivo;
            description.appendChild(reason);
          }
          const remove = document.createElement('button');
          remove.type = 'button';
          remove.className = 'btn-desbloquear';
          remove.textContent = 'Desbloquear';
          remove.addEventListener('click', () => {
            if (!window.confirm(`Desbloquear a data ${formatDate(block.data)}?`)) return;
            database.ref(`datasBloqueadas/${block.key}`).remove()
              .then(renderBlockedDates)
              .catch((error) => {
                console.error('Erro ao desbloquear data:', error);
                window.alert('Não foi possível desbloquear esta data.');
              });
          });
          item.append(description, remove);
          blockedList.appendChild(item);
        });
      })
      .catch((error) => {
        console.error('Erro ao carregar datas bloqueadas:', error);
        blockedList.textContent = 'Não foi possível carregar as datas bloqueadas.';
      });
  }

  function blockDate() {
    const date = blockedDate.value;
    const reason = blockedReason?.value.trim() || '';
    if (!date) {
      window.alert('Selecione uma data.');
      return;
    }
    database.ref('datasBloqueadas').orderByChild('data').equalTo(date).once('value')
      .then((snapshot) => {
        if (snapshot.exists()) throw new Error('Esta data já está bloqueada.');
        return database.ref('datasBloqueadas').push({ data: date, motivo: reason, dataBloqueio: new Date().toISOString() });
      })
      .then(() => {
        blockedDate.value = '';
        if (blockedReason) blockedReason.value = '';
        renderBlockedDates();
      })
      .catch((error) => window.alert(error.message || 'Não foi possível bloquear esta data.'));
  }

  function navigate(section) {
    Object.entries(panels).forEach(([key, panel]) => panel?.classList.toggle('hidden', key !== section));
    navLinks.forEach((link) => link.classList.toggle('active', link.dataset.section === section));
    if (section === 'agendamentos') renderAppointments();
    if (section === 'agenda') renderBlockedDates();
    if (section === 'notificacoes') renderNotifications();
  }

  function renderAppointmentsIfVisible() {
    if (!panels.agendamentos?.classList.contains('hidden')) renderAppointments();
  }

  function startLiveNotifications() {
    const appointmentsRef = database.ref('agendamentos');
    appointmentsRef.on('child_added', (snapshot) => {
      if (bootstrapping) {
        pendingAdds.push(snapshot);
        return;
      }
      if (!seenAppointmentKeys.has(snapshot.key)) {
        seenAppointmentKeys.add(snapshot.key);
        addNotification('booking', snapshot.key, snapshot.val() || {});
        renderAppointmentsIfVisible();
      }
    });
    appointmentsRef.on('child_removed', (snapshot) => {
      if (bootstrapping) {
        pendingRemovals.push(snapshot);
        return;
      }
      seenAppointmentKeys.delete(snapshot.key);
      addNotification('cancellation', snapshot.key, snapshot.val() || {});
      renderAppointmentsIfVisible();
    });
    appointmentsRef.once('value')
      .then((snapshot) => {
        snapshot.forEach((child) => seenAppointmentKeys.add(child.key));
        bootstrapping = false;
        pendingAdds.forEach((child) => {
          if (!seenAppointmentKeys.has(child.key)) {
            seenAppointmentKeys.add(child.key);
            addNotification('booking', child.key, child.val() || {});
          }
        });
        pendingRemovals.forEach((child) => {
          if (seenAppointmentKeys.has(child.key)) {
            seenAppointmentKeys.delete(child.key);
            addNotification('cancellation', child.key, child.val() || {});
          }
        });
        renderAppointmentsIfVisible();
      })
      .catch((error) => {
        bootstrapping = false;
        console.error('Erro ao acompanhar alterações da agenda:', error);
      });
  }

  document.getElementById('btn-bloquear')?.addEventListener('click', blockDate);
  document.getElementById('marcar-todas-lidas')?.addEventListener('click', () => {
    notifications = notifications.map((item) => ({ ...item, read: true }));
    saveNotifications();
  });
  document.getElementById('limpar-notificacoes')?.addEventListener('click', () => {
    notifications = [];
    saveNotifications();
  });
  document.getElementById('logout-button')?.addEventListener('click', () => auth.signOut());
  appointmentDate?.addEventListener('change', renderAppointments);
  navLinks.forEach((link) => link.addEventListener('click', (event) => {
    event.preventDefault();
    navigate(link.dataset.section);
  }));
  if (blockedDate) blockedDate.min = today;
  if (appointmentDate) appointmentDate.value = today;
  renderNotifications();

  auth.onAuthStateChanged((user) => {
    if (!user) {
      window.location.replace('index.html');
      return;
    }
    androidNotificationsReady = prepareAndroidNotifications().catch((error) => {
      console.error('Não foi possível habilitar notificações Android:', error);
    });
    startLiveNotifications();
    navigate('agendamentos');
  });
});
