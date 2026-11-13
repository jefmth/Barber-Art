# Barber Art — aplicativo Android de teste

O projeto transforma a interface web existente em um aplicativo Android instalável usando Capacitor. As telas, estilos, lógica do app e SDK do Firebase são compilados dentro do pacote. A conexão de rede permanece necessária para autenticação e leitura/gravação no Firebase Realtime Database já configurado.

## Funcionalidades desta etapa

- Agendamento de serviços e bloqueio de datas usando os caminhos existentes `agendamentos` e `datasBloqueadas`.
- Painel administrativo com autenticação Firebase, consulta por data, cancelamento e bloqueios.
- Notificações no painel e notificações Android locais para novos agendamentos e cancelamentos enquanto o administrador está conectado e com o app ativo.
- Histórico local de até 30 notificações, guardado no dispositivo administrativo; nenhum nó de notificação foi adicionado ao banco.
- Assets web e SDK Firebase empacotados localmente; fontes e ícones não são baixados de CDNs.

## Requisitos

- Node.js e npm para preparar e compilar o frontend.
- Android Studio, JDK e Android SDK para compilar, instalar ou depurar o aplicativo Android.

## Preparação e execução

```bash
npm install
npm run dev
```

Para compilar os recursos locais e sincronizá-los com a plataforma Android:

```bash
npm run android:sync
```

Para abrir o projeto no Android Studio:

```bash
npm run android:open
```

No Android Studio, selecione uma configuração de debug e gere o APK de teste. Também é possível compilar por linha de comando, com Android SDK instalado e configurado:

```bash
cd android
./gradlew assembleDebug
```

O APK de debug fica em `android/app/build/outputs/apk/debug/app-debug.apk` após a compilação bem-sucedida.

## Firebase e preservação de dados

A configuração cliente está centralizada em `js/firebase-config.js`. Ela aponta para o Firebase Realtime Database atualmente presente no projeto. Esta etapa não migra, limpa ou renomeia registros e não cria outro banco. Os formatos dos dados em `agendamentos` e `datasBloqueadas` permanecem inalterados.

A configuração cliente contém uma chave de identificação pública do Firebase, não uma chave de serviço. A proteção dos registros depende das Firebase Realtime Database Rules e da autenticação. A inclusão de uma verificação de login no painel não substitui regras de segurança no servidor; revise-as antes de disponibilizar o app publicamente.

## Limite das notificações

A notificação Android local é gerada quando o app administrativo recebe em tempo real uma alteração no nó de agendamentos. O app precisa estar aberto/ativo, autenticado e conectado para detectar o evento. Se o app estiver fechado ou desconectado, esta versão não promete entrega. Notificação push confiável em segundo plano exigirá Firebase Cloud Messaging e um backend seguro (por exemplo, Cloud Functions) para encaminhar os eventos de agendamento e cancelamento; isso ainda não foi configurado.

As notificações e a marcação de leitura são guardadas somente no armazenamento local do dispositivo do administrador, sem alterar a estrutura existente do Realtime Database.

## Estrutura principal

- `index.html`: experiência do cliente e login administrativo.
- `admin.html`: painel administrativo Android.
- `js/firebase-config.js`: inicialização única e local do Firebase.
- `js/script.js`, `js/login.js`, `js/admin.js`: fluxos do cliente, autenticação e administração.
- `css/`: estilos da aplicação.
- `android/`: projeto nativo Android gerado pelo Capacitor.
- `vite.config.js`: build das páginas para `dist/`.

## Geração automática do APK

O workflow `.github/workflows/build-android.yml` compila um APK de debug em runners Android do GitHub Actions quando alterações chegam à branch principal ou a uma branch `manus/**`. Após a execução, baixe `barber-art-android-debug` na seção **Actions** do repositório. O workflow também pode ser acionado manualmente em **Actions → Android debug APK → Run workflow**.
