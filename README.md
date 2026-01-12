# 🍔 Gourmet Express - Cardápio Digital

Sistema completo de cardápio online com gestão de pedidos e notificações via WhatsApp.

## 📋 Funcionalidades

### Para Clientes
- ✅ Navegação por categorias (Burgers, Acompanhamentos, Bebidas, Sobremesas)
- ✅ Carrinho de compras com controle de quantidade
- ✅ Envio de pedidos via WhatsApp
- ✅ Interface responsiva e moderna
- ✅ Recebimento de notificações de status do pedido

### Para Administradores
- ✅ Painel de controle de pedidos em tempo real
- ✅ Gestão de status (Pendente → Preparando → Pronto → Entregue)
- ✅ Notificações automáticas para clientes via WhatsApp
- ✅ Gerenciamento de produtos (adicionar, editar, duplicar, excluir)
- ✅ Configuração de horários de funcionamento
- ✅ Compartilhamento do cardápio
- ✅ Estatísticas de pedidos

## 🚀 Tecnologias

- **HTML5** - Estrutura semântica
- **CSS3** - Design responsivo e moderno
- **JavaScript Vanilla** - Lógica da aplicação
- **LocalStorage** - Persistência de dados
- **WhatsApp Web API** - Integração para pedidos e notificações

## 📦 Instalação

1. Clone o repositório:
```bash
git clone https://github.com/seu-usuario/cardapio-gourmet-express.git
```

2. Abra o arquivo `index.html` no navegador ou use um servidor local:
```bash
# Exemplo com Python
python -m http.server 8000

# Exemplo com Node.js (http-server)
npx http-server
```

3. Acesse `http://localhost:8000`

## ⚙️ Configuração

### Número do WhatsApp

Edite o arquivo `app.js` e altere a constante `WHATSAPP_NUMBER`:

```javascript
const WHATSAPP_NUMBER = '5511999999999'; // Seu número com DDI + DDD
```

### Produtos Padrão

Os produtos de exemplo estão definidos em `app.js` no array `DEFAULT_PRODUCTS`. Você pode editá-los ou adicionar novos pelo painel administrativo.

### Horários de Funcionamento

Configure os horários no painel administrativo ou edite `DEFAULT_HOURS` em `app.js`.

## 📱 Como Usar

### Acesso do Cliente
1. Abra o cardápio no navegador
2. Navegue pelas categorias
3. Adicione produtos ao carrinho
4. Preencha nome, telefone e endereço
5. Envie o pedido via WhatsApp

### Acesso Administrativo
1. Clique em "Acesso Administrativo" no rodapé
2. Visualize pedidos em tempo real
3. Atualize status dos pedidos (notificação automática para o cliente)
4. Gerencie produtos e horários na página de Configurações

## 📂 Estrutura do Projeto

```
cardapio-gourmet-express/
├── index.html          # Estrutura HTML
├── styles.css          # Estilos e responsividade
├── app.js             # Lógica da aplicação
├── README.md          # Documentação
└── .gitignore         # Arquivos ignorados pelo Git
```

## 🎨 Personalização

### Cores
As cores principais estão definidas como variáveis CSS no início do `styles.css`:

```css
--color-primary: #f97316;
--color-primary-dark: #ea580c;
--color-primary-light: #fed7aa;
```

### Logo e Nome
Edite o título e nome da loja no arquivo `index.html`:

```html
<h1 class="logo-text">Gourmet Express</h1>
```

## 🔒 Segurança

Este sistema usa LocalStorage para armazenar dados. Para ambientes de produção, considere:
- Implementar autenticação para o painel administrativo
- Usar backend para persistência de dados
- Adicionar validação de dados no servidor
- Implementar HTTPS

## 🤝 Contribuindo

Contribuições são bem-vindas! Sinta-se à vontade para abrir issues ou pull requests.

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo LICENSE para mais detalhes.

## 🌟 Recursos Futuros

- [ ] Integração com sistema de pagamento
- [ ] Rastreamento de entrega em tempo real
- [ ] Cupons de desconto
- [ ] Sistema de avaliações
- [ ] Painel de relatórios e estatísticas
- [ ] App mobile nativo

## 📞 Suporte

Para dúvidas ou suporte, entre em contato através das issues do GitHub.

---

Desenvolvido com ❤️ para restaurantes e food services
