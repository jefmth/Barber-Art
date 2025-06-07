# Barber Web - Página Responsiva para Barbearia

## Descrição
Este projeto consiste em uma página web responsiva para uma barbearia, com design moderno de 2025. A página inclui uma barra superior preta com o nome "Barber Web", um menu de navegação com opções "Cliente" e "Admin", e quatro botões grandes para os serviços oferecidos: Clássico (R$ 30), Degradê (R$ 35), Barba (R$ 35) e Máquina (R$ 20). Ao clicar em qualquer serviço, um modal de agendamento é aberto para que o cliente possa preencher seus dados e agendar o serviço.

## Características
- Design moderno e elegante com tema escuro
- Totalmente responsivo para qualquer dispositivo
- Animações e efeitos interativos
- Estrutura de arquivos organizada
- Código limpo e bem comentado
- Modal de agendamento para cada serviço
- Formulário de agendamento com validação de campos
- Máscara para campo de telefone

## Estrutura de Arquivos
```
barber_web/
├── index.html          # Arquivo HTML principal
├── css/
│   └── styles.css      # Estilos CSS
├── js/
│   └── script.js       # Funcionalidades JavaScript
└── img/                # Diretório para imagens (vazio)
```

## Tecnologias Utilizadas
- HTML5
- CSS3 (com variáveis CSS, flexbox, grid e media queries)
- JavaScript (ES6+)
- Font Awesome (para ícones)
- Google Fonts (Montserrat e Roboto)

## Recursos de Design
- Neomorfismo sutil nos botões
- Efeitos de glassmorphism no menu
- Animações de entrada e interação
- Efeito de ripple nos botões
- Modo escuro como padrão (tendência de 2025)

## Como Usar
1. Faça o download dos arquivos
2. Extraia o conteúdo em um diretório
3. Abra o arquivo `index.html` em qualquer navegador moderno
4. Clique em um dos serviços para abrir o modal de agendamento
5. Preencha os dados solicitados e confirme o agendamento

## Funcionalidade de Agendamento
- Ao clicar em qualquer serviço, um modal é aberto automaticamente
- O tipo de serviço selecionado é preenchido automaticamente no formulário
- O formulário solicita nome, celular, data e horário do agendamento
- Todos os campos são validados antes do envio
- O campo de celular possui máscara para formatação automática
- Após confirmar, uma mensagem de sucesso é exibida
- O modal pode ser fechado clicando no botão de fechar, no botão cancelar ou fora do modal

## Personalização
- Para alterar as cores, modifique as variáveis CSS no início do arquivo `styles.css`
- Para adicionar ou modificar serviços, edite a seção correspondente no arquivo `index.html`
- Para alterar comportamentos interativos, modifique o arquivo `script.js`

## Compatibilidade
- Chrome (versão 90+)
- Firefox (versão 88+)
- Safari (versão 14+)
- Edge (versão 90+)
- Opera (versão 76+)
- Dispositivos móveis Android e iOS

## Próximos Passos
- Implementar as áreas de Cliente e Admin
- Integrar com backend para persistência dos agendamentos
- Implementar sistema de gerenciamento de clientes
- Adicionar galeria de fotos dos cortes
- Implementar sistema de notificações para confirmação de agendamentos

---

© 2025 Barber Web - Todos os direitos reservados

