# Barber Art — andamento do app Android

## Entregue nesta etapa
- [x] Preparar build Vite e estrutura Capacitor no repositório existente.
- [x] Gerar a plataforma Android e configurar o identificador e nome do aplicativo.
- [x] Empacotar a interface e o SDK Firebase localmente, removendo referências externas a fontes, ícones e SDKs carregados por CDN.
- [x] Centralizar a inicialização Firebase e manter o mesmo projeto e os caminhos existentes do Realtime Database.
- [x] Proteger a tela administrativa com verificação da sessão Firebase Auth.
- [x] Consultar agendamentos por data e manter cancelamento e bloqueio de datas.
- [x] Detectar novos agendamentos e cancelamentos em tempo real no painel administrativo, mostrando alerta dentro do app e notificação Android local quando permitido.
- [x] Manter histórico de até 30 notificações somente no armazenamento do dispositivo administrativo, sem criar nós novos no banco.
- [x] Documentar preparação, build e limites das notificações.

## Pendente para a distribuição do teste
- [ ] Compilar e instalar o APK de debug em aparelho Android com Android Studio/SDK.
- [ ] Validar a autorização de notificações no Android e o recebimento com o painel administrativo aberto.
- [ ] Revisar as regras do Firebase Realtime Database e verificar que somente administradores autenticados podem ler/cancelar/bloquear.
- [ ] Se for necessário notificar com o app fechado, configurar Firebase Cloud Messaging e backend seguro de eventos; esta etapa não faz parte das notificações locais atuais.
