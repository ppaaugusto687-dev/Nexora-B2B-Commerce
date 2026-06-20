const dashboardContent = document.querySelector(".dashboard-content");
const profileMenu = document.querySelector(".profile-menu");
const profileButton = document.querySelector(".profile-button");
const profileDropdown = document.querySelector("#profile-dropdown");
const toastRegion = document.querySelector(".toast-region");
const dashboard = document.querySelector(".dashboard");
const homeTemplate = dashboardContent.innerHTML.trim();

const STORAGE_KEYS = {
  users: "nexora_users",
  companies: "nexora_companies",
  session: "nexora_session",
  dataResetVersion: "nexora_data_reset_version",
  supabaseProductsReady: "nexora_supabase_products_ready",
};

const DATA_SCOPES = ["products", "orders", "clients", "cart", "settings", "campaigns", "alerts", "reports", "opportunities", "complaints"];
const DATA_RESET_VERSION = "zero-all-2026-06-13";
const STATUS_FLOW = ["Pendente", "Aprovado", "Em separação", "Enviado", "Entregue"];
const ALL_STATUSES = [...STATUS_FLOW, "Cancelado"];
const COMPLAINT_STATUSES = ["Aberta", "Em análise", "Respondida", "Resolvida", "Cancelada"];
const COMPLAINT_PRIORITIES = ["Baixa", "Média", "Alta", "Crítica"];
const CHECKOUT_ITEM_PRICE = 1284;
const REVENUE_STATUSES = ["Aprovado", "Em separação", "Enviado", "Entregue"];
const ACTIVE_CLIENT_STATUSES = ["ativo", "ativa", "recorrente", "alto valor", "high value"];
const LOW_STOCK_LIMIT = 10;
const PRODUCT_MEDIA_ACCEPT = "image/png,image/jpeg,image/jpg,image/webp,image/gif,video/mp4,video/webm,video/quicktime";
const PRODUCT_MEDIA_TYPES = ["image/", "video/"];
const SUPABASE_CONFIG = {
  url: "https://gtoxexdhqhhwcplnfohh.supabase.co",
  publishableKey: "sb_publishable_6gffIRGe-CgnWceT2GP9ow_BDefwgxE",
  productsTable: "nexora_products",
};

const ROLE_PERMISSIONS = {
  Admin: ["dashboard", "catalog", "cart", "checkout", "orders", "clients", "ai", "campaigns", "reports", "admin", "settings", "support", "createOrder", "changeStatus", "manualStatus", "export", "accountSettings"],
  Vendedor: ["dashboard", "catalog", "cart", "checkout", "orders", "clients", "ai", "support", "createOrder", "changeStatus", "manualStatus", "export", "accountSettings"],
  Estoque: ["dashboard", "catalog", "orders", "support", "changeStatus", "manualStatus", "export", "accountSettings"],
  Financeiro: ["dashboard", "orders", "reports", "support", "changeStatus", "manualStatus", "export", "accountSettings"],
  "Cliente B2B": ["catalog", "cart", "checkout", "orders", "support", "createOrder", "export", "accountSettings"],
};

const defaultUsers = [
  {
    id: "u-demo",
    nome: "Nexora Demo",
    email: "demo@nexora.com",
    senha: "demo123",
    cargo: "Admin",
    empresaId: "demo",
    plano: "Enterprise AI",
    criadoEm: "10/06/2026 08:30",
  },
  {
    id: "u-admin",
    nome: "Dealoflo",
    email: "admin@nexora.demo",
    senha: "admin123",
    cargo: "Admin",
    empresaId: "micora",
    plano: "Enterprise AI",
    criadoEm: "10/06/2026 09:00",
  },
  {
    id: "u-ops",
    nome: "Micora Vendas",
    email: "ops@micora.demo",
    senha: "ops123",
    cargo: "Vendedor",
    empresaId: "micora",
    plano: "Enterprise AI",
    criadoEm: "10/06/2026 09:10",
  },
  {
    id: "u-viewer",
    nome: "Astra Buyer",
    email: "buyer@astra.demo",
    senha: "buyer123",
    cargo: "Cliente B2B",
    empresaId: "astra",
    plano: "Growth",
    criadoEm: "10/06/2026 10:15",
  },
];

const defaultCompanies = [
  {
    id: "demo",
    nomeEmpresa: "Nexora Demo Company",
    cnpj: "00.000.000/0001-00",
    telefone: "(11) 4002-9090",
    email: "demo@nexora.com",
    segmento: "Distribuidora demo",
    cidade: "São Paulo",
    estado: "SP",
    plano: "Enterprise AI",
    statusConta: "Demo",
    tipoConta: "demo",
  },
  {
    id: "micora",
    nomeEmpresa: "Micora Commerce",
    cnpj: "12.345.678/0001-90",
    telefone: "(11) 4002-0001",
    email: "contato@micora.demo",
    segmento: "Distribuidora B2B",
    cidade: "São Paulo",
    estado: "SP",
    plano: "Enterprise AI",
    statusConta: "Ativa",
    tipoConta: "demo",
  },
  {
    id: "astra",
    nomeEmpresa: "Astra Supply",
    cnpj: "98.765.432/0001-10",
    telefone: "(21) 3003-0002",
    email: "compras@astra.demo",
    segmento: "Suprimentos industriais",
    cidade: "Rio de Janeiro",
    estado: "RJ",
    plano: "Growth",
    statusConta: "Ativa",
    tipoConta: "demo",
  },
];

const defaultCompanyData = {};

const appState = {
  cartCount: 0,
  orderStatus: "Pendente",
  csvExports: 0,
  users: [],
  companies: [],
  session: null,
  companyData: {},
  activeOrderId: null,
  activeComplaintId: null,
  pendingPlan: "Growth",
  pendingCartItemId: null,
  pendingProductSku: null,
};

const featureActions = [
  { id: "catalog", title: "Catálogo", detail: "Produtos, estoque e inclusão no carrinho." },
  { id: "products", title: "Produtos B2B", detail: "Página de produtos autorizados da empresa." },
  { id: "filters", title: "Filtros", detail: "Aplica filtro premium na tabela atual." },
  { id: "sorting", title: "Ordenação", detail: "Ordena linhas visíveis por nome." },
  { id: "cart", title: "Carrinho", detail: "Resumo de itens e subtotal simulado." },
  { id: "checkout", title: "Checkout B2B", detail: "Fechamento com forma de pagamento e status inicial." },
  { id: "create-order", title: "Criação de pedido", detail: "Gera pedido comercial para a empresa ativa." },
  { id: "change-status", title: "Alteração de status", detail: "Avança o ciclo operacional do pedido." },
  { id: "manual-status", title: "Selecionar status", detail: "Escolhe manualmente o status do pedido ativo." },
  { id: "csv-export", title: "Exportação CSV", detail: "Baixa a tabela atual em CSV." },
  { id: "clients", title: "Clientes", detail: "Segmentos e contas premium." },
  { id: "ai-assistant", title: "IA comercial", detail: "Sugestões comerciais geradas localmente." },
  { id: "campaigns", title: "Campanhas", detail: "Ações comerciais e canais B2B." },
  { id: "reports", title: "Relatórios", detail: "Resumo executivo e CSV." },
  { id: "admin", title: "Admin demo", detail: "Permissões e auditoria da operação." },
  { id: "settings", title: "Configurações", detail: "Preferências da conta e da empresa." },
  { id: "supabase-status", title: "Supabase", detail: "Conexão com banco real e tabela de produtos." },
  { id: "support", title: "Suporte", detail: "Reclamações, protocolos e histórico de atendimento." },
  { id: "load-demo-data", title: "Carregar dados demo", detail: "Preenche dados fictícios só na empresa atual." },
  { id: "clear-company-data", title: "Limpar dados", detail: "Zera dados operacionais sem apagar usuário ou empresa." },
];

const assistantQuickQuestions = [
  "Como criar um produto?",
  "Como finalizar um pedido?",
  "Como alterar status de pedido?",
  "Como funciona o pedido mínimo?",
  "Como cadastrar cliente?",
  "Como usar a IA Comercial?",
  "Como trocar de plano?",
  "Como ativar uma conta pendente?",
  "Como exportar relatório?",
  "Como fazer backup?",
  "Pedido atrasado",
  "Produto errado",
  "Produto faltando",
  "Preço incorreto",
  "Pagamento não identificado",
  "Status não atualiza",
  "Não consigo acessar",
  "Quero cancelar",
  "Sistema com erro",
];

const assistantKnowledge = [
  { id: "nav-catalogo", categoria: "Navegação", keywords: ["ir para catalogo", "abrir catalogo", "mostrar catalogo"], resposta: "Claro. Vou abrir o catálogo B2B para você revisar produtos, estoque e ações de carrinho.", sugestoes: ["Como criar um produto?", "Como adicionar ao carrinho?"], acao: "catalog" },
  { id: "nav-produtos", categoria: "Navegação", keywords: ["abrir produtos", "ir para produtos", "pagina de produtos", "ver produtos"], resposta: "Abrindo a página de Produtos B2B com os produtos autorizados da empresa logada.", sugestoes: ["Como importar produtos?", "Como criar um produto?"], acao: "products" },
  { id: "nav-pedidos", categoria: "Navegação", keywords: ["abrir pedidos", "ir para pedidos", "mostrar pedidos"], resposta: "Abrindo a área de pedidos com os registros da empresa logada e as ações de status disponíveis.", sugestoes: ["Como alterar status de pedido?", "Como ver histórico de status?"], acao: "orders" },
  { id: "nav-admin", categoria: "Navegação", keywords: ["abrir admin", "ir para admin", "painel admin"], resposta: "Vou abrir o admin demo. Se seu cargo não tiver permissão, o sistema mostra o bloqueio correto.", sugestoes: ["Como funcionam permissões?", "Como ativar uma conta pendente?"], acao: "admin" },
  { id: "nav-configuracoes", categoria: "Navegação", keywords: ["abrir configuracoes", "ir para configuracoes", "configurar conta"], resposta: "Abrindo configurações da conta e da empresa para editar perfil, plano, CNPJ e preferências.", sugestoes: ["Como editar CNPJ?", "Como trocar de plano?"], acao: "settings" },
  { id: "nav-suporte", categoria: "Suporte", keywords: ["ver reclamacoes", "abrir suporte", "ir para suporte", "acompanhar reclamacao", "protocolos"], resposta: "Abrindo Suporte para você acompanhar reclamações, protocolos, status, observações internas e exportação CSV.", sugestoes: ["Como registrar reclamação?", "Como mudar status da reclamação?"], acao: "support" },
  { id: "nav-dashboard", categoria: "Dashboard", keywords: ["ir para dashboard", "abrir dashboard", "home", "voltar inicio"], resposta: "Vou levar você para o dashboard executivo, onde os indicadores são recalculados com dados reais da empresa.", sugestoes: ["Como ler o dashboard?", "Por que está zerado?"], acao: "home" },
  { id: "nav-checkout", categoria: "Checkout B2B", keywords: ["abrir checkout", "ir para checkout", "tela de checkout"], resposta: "Abrindo o checkout B2B para revisar carrinho, pagamento e status inicial do pedido.", sugestoes: ["Como finalizar um pedido?", "Qual status inicial?"], acao: "checkout" },
  { id: "dashboard-visao", categoria: "Dashboard", keywords: ["como ler dashboard", "dashboard", "indicadores", "painel executivo"], resposta: "O dashboard mostra receita aprovada, clientes ativos, pedidos pendentes e ticket médio. Tudo vem dos dados da empresa logada; se estiver zerado, ainda não há pedidos, clientes ou produtos reais.", sugestoes: ["Como criar pedido?", "Como cadastrar cliente?"] },
  { id: "dashboard-zerado", categoria: "Dashboard", keywords: ["dashboard zerado", "tudo zerado", "sem dados", "por que esta zerado"], resposta: "O sistema foi deixado limpo de propósito. Para alimentar os cards, cadastre produtos, clientes ou crie um pedido. Dados demo só entram se um admin carregar manualmente.", sugestoes: ["Como criar um produto?", "Como criar pedido?"] },
  { id: "dashboard-receita", categoria: "Dashboard", keywords: ["receita mensal", "faturamento", "vendas", "valor vendido"], resposta: "A receita considera pedidos com status Aprovado, Em separação, Enviado ou Entregue. Pedidos pendentes e cancelados não entram no faturamento.", sugestoes: ["Como avançar status?", "Como exportar relatório?"] },
  { id: "dashboard-clientes", categoria: "Dashboard", keywords: ["clientes compradores", "clientes ativos", "contas ativas"], resposta: "Clientes ativos são calculados a partir do cadastro de clientes da empresa atual. Cadastre clientes e vincule pedidos para o indicador ganhar vida.", sugestoes: ["Como cadastrar cliente?", "Como filtrar clientes?"] },
  { id: "dashboard-pendentes", categoria: "Dashboard", keywords: ["pedidos pendentes", "pendencias", "pedido aguardando"], resposta: "Pedidos pendentes aparecem quando o checkout ou a criação manual geram um pedido que ainda não foi aprovado. Use Avançar status ou o seletor manual para atualizar.", sugestoes: ["Como alterar status de pedido?", "Como ver histórico?"] },
  { id: "dashboard-atualizacao", categoria: "Dashboard", keywords: ["dashboard atualiza", "atualizar dashboard", "recalcular painel"], resposta: "O painel recalcula automaticamente quando pedidos, carrinho, clientes ou status mudam. Também dá para usar os controles de filtros e relatórios para revisar os dados.", sugestoes: ["Como usar filtros?", "Como exportar relatório?"] },
  { id: "catalogo-criar-produto", categoria: "Catálogo B2B", keywords: ["como criar um produto", "criar produto", "novo produto", "cadastrar produto"], resposta: "Abra Catálogo, clique em Novo produto, preencha SKU, nome, preço e estoque. O produto fica salvo apenas na empresa logada.", sugestoes: ["Abrir catálogo", "Como editar estoque?"] },
  { id: "catalogo-importar-produtos", categoria: "Catálogo B2B", keywords: ["como importar produtos", "pegar produtos da empresa", "produtos autorizados", "informacoes da empresa"], resposta: "Abra Produtos, clique em Informar empresa, marque a autorização e cole a lista de produtos no formato Nome;SKU;Preço;Estoque. Como esta versão é local, a importação acontece pelo conteúdo autorizado que a empresa fornece.", sugestoes: ["Abrir produtos", "Como criar um produto?"] },
  { id: "catalogo-estoque", categoria: "Catálogo B2B", keywords: ["editar estoque", "estoque", "disponibilidade", "produto sem estoque"], resposta: "O estoque é controlado por produto. Cadastre ou ajuste produtos no catálogo; quando o estoque fica abaixo do limite configurado, o painel de disponibilidade sinaliza atenção.", sugestoes: ["Como criar um produto?", "Como configurar limite de estoque?"] },
  { id: "catalogo-preco", categoria: "Catálogo B2B", keywords: ["preco produto", "editar preco", "valor produto", "sku"], resposta: "Cada produto possui preço unitário em dólar e SKU. Use valores consistentes para o checkout calcular subtotal e total do pedido corretamente.", sugestoes: ["Como finalizar um pedido?", "Como exportar catálogo?"] },
  { id: "catalogo-busca", categoria: "Catálogo B2B", keywords: ["buscar produto", "pesquisar produto", "busca catalogo"], resposta: "Use a busca global para localizar recursos como catálogo, pedidos e relatórios. Dentro dos painéis, os filtros ajudam a destacar registros relevantes.", sugestoes: ["Como usar busca global?", "Como aplicar filtros?"] },
  { id: "catalogo-filtros", categoria: "Catálogo B2B", keywords: ["filtro catalogo", "filtrar produto", "aplicar filtros"], resposta: "Clique em Filtros para aplicar um feedback visual e revisar a tabela atual. Em demo local, o filtro destaca a superfície e mantém os dados intactos.", sugestoes: ["Como ordenar tabela?", "Como exportar CSV?"] },
  { id: "catalogo-ordenacao", categoria: "Catálogo B2B", keywords: ["ordenar catalogo", "ordenacao", "ordenar tabela"], resposta: "A ordenação reorganiza as linhas visíveis por nome ou primeiro campo da tabela, mantendo a experiência simples para a demo.", sugestoes: ["Como filtrar produto?", "Como exportar relatório?"] },
  { id: "catalogo-carrinho", categoria: "Catálogo B2B", keywords: ["adicionar ao carrinho", "comprar produto", "colocar no carrinho"], resposta: "No catálogo ou nas ações rápidas, use Adicionar ao carrinho. O item entra no carrinho da empresa atual e persiste no navegador.", sugestoes: ["Como ver carrinho?", "Como finalizar um pedido?"] },
  { id: "catalogo-empresa", categoria: "Catálogo B2B", keywords: ["produtos por empresa", "dados separados catalogo", "catalogo empresa"], resposta: "Produtos são separados por empresa no localStorage. Trocar de conta muda a empresa ativa e o catálogo carregado.", sugestoes: ["Como trocar conta?", "Como dados são separados?"] },
  { id: "catalogo-vazio", categoria: "Catálogo B2B", keywords: ["catalogo vazio", "sem produtos", "nenhum produto"], resposta: "Catálogo vazio significa que a empresa ainda não cadastrou produtos. Crie o primeiro produto ou carregue dados demo com uma conta admin.", sugestoes: ["Como criar um produto?", "Como carregar dados demo?"] },
  { id: "carrinho-ver", categoria: "Carrinho", keywords: ["ver carrinho", "abrir carrinho", "itens carrinho"], resposta: "Clique no ícone de carrinho no topo. Ele mostra itens da empresa atual, subtotal e ações para checkout.", sugestoes: ["Como finalizar um pedido?", "Como limpar carrinho?"] },
  { id: "carrinho-persistencia", categoria: "Carrinho", keywords: ["carrinho persiste", "salvar carrinho", "carrinho localstorage"], resposta: "O carrinho é salvo localmente por empresa. Ao recarregar, ele continua ali enquanto você usa a mesma conta e empresa.", sugestoes: ["Como dados são separados?", "Como confirmar checkout?"] },
  { id: "carrinho-vazio", categoria: "Carrinho", keywords: ["carrinho vazio", "sem item no carrinho", "checkout sem item"], resposta: "Com carrinho vazio, o checkout bloqueia a confirmação e mostra um aviso profissional. Adicione um produto antes de finalizar.", sugestoes: ["Abrir catálogo", "Como adicionar ao carrinho?"] },
  { id: "carrinho-total", categoria: "Carrinho", keywords: ["subtotal carrinho", "total carrinho", "valor carrinho"], resposta: "O total usa a quantidade de itens e o preço base do checkout. No checkout B2B, taxas simuladas entram no resumo final.", sugestoes: ["Como funciona checkout?", "Qual status inicial?"] },
  { id: "carrinho-empresa", categoria: "Carrinho", keywords: ["carrinho por empresa", "carrinho separado", "dados misturados carrinho"], resposta: "Cada empresa tem seu próprio carrinho. Isso evita misturar itens de compradores diferentes quando você troca de conta.", sugestoes: ["Como trocar conta?", "Como dados são separados?"] },
  { id: "checkout-finalizar", categoria: "Checkout B2B", keywords: ["como finalizar um pedido", "finalizar pedido", "confirmar checkout", "fechar pedido"], resposta: "Abra Checkout, confira a empresa, forma de pagamento e status inicial. Se houver itens no carrinho, clique em Confirmar pedido para criar o pedido persistente.", sugestoes: ["Abrir checkout", "Qual status inicial?"] },
  { id: "checkout-status-inicial", categoria: "Checkout B2B", keywords: ["status inicial", "pedido nasce", "status do checkout"], resposta: "Pix e Cartão iniciam como Aprovado. Boleto e Faturado iniciam como Pendente, a menos que você escolha outro status manualmente no checkout.", sugestoes: ["Como alterar status de pedido?", "Como ver histórico?"] },
  { id: "checkout-pagamento", categoria: "Checkout B2B", keywords: ["forma de pagamento", "boleto", "pix", "cartao", "faturado"], resposta: "O checkout B2B aceita formas simuladas como Pix, Cartão, Boleto e Faturado. A escolha influencia o status inicial sugerido.", sugestoes: ["Qual status inicial?", "Como confirmar checkout?"] },
  { id: "checkout-pedido-criado", categoria: "Checkout B2B", keywords: ["pedido criado checkout", "checkout criou pedido", "pedido persistiu"], resposta: "Quando confirmado, o pedido entra na lista da empresa, o carrinho é limpo, o histórico de status começa e o dashboard recalcula.", sugestoes: ["Abrir pedidos", "Como ver histórico de status?"] },
  { id: "checkout-bloqueio", categoria: "Checkout B2B", keywords: ["nao consigo confirmar", "checkout bloqueado", "erro checkout"], resposta: "Os bloqueios mais comuns são carrinho vazio, usuário sem permissão ou sessão expirada. O sistema mostra toast ou modal para orientar o próximo passo.", sugestoes: ["Como ver permissões?", "Como fazer login?"] },
  { id: "checkout-minimo", categoria: "Checkout B2B", keywords: ["pedido minimo", "valor minimo", "compra minima"], resposta: "Nesta demo, o pedido mínimo é tratado como regra comercial informativa. Se a empresa quiser aplicar valor mínimo real, o ideal é configurar isso no fluxo de checkout do plano avançado.", sugestoes: ["Como trocar de plano?", "Como configurar empresa?"] },
  { id: "pedidos-criar", categoria: "Pedidos", keywords: ["criar pedido", "novo pedido", "pedido manual", "criar ordem"], resposta: "Use Criar pedido para gerar um pedido manual para a empresa logada. Ele nasce persistido, com status inicial e histórico.", sugestoes: ["Como alterar status de pedido?", "Abrir pedidos"] },
  { id: "pedidos-alterar-status", categoria: "Pedidos", keywords: ["como alterar status de pedido", "alterar status", "avancar status", "mudar status"], resposta: "Abra Pedidos, selecione um pedido e use Avançar status para seguir o fluxo: Pendente, Aprovado, Em separação, Enviado e Entregue.", sugestoes: ["Abrir pedidos", "Como usar select manual?"] },
  { id: "pedidos-status-manual", categoria: "Pedidos", keywords: ["select manual de status", "selecionar status", "status manual"], resposta: "Use Selecionar status para escolher manualmente qualquer status permitido, incluindo Cancelado. A alteração entra no histórico do pedido.", sugestoes: ["Como ver histórico?", "Como dashboard atualiza?"] },
  { id: "pedidos-historico", categoria: "Pedidos", keywords: ["historico status", "historico de pedido", "ver historico"], resposta: "O histórico mostra cada mudança de status com data, usuário e origem. Ele é salvo junto do pedido no localStorage da empresa.", sugestoes: ["Abrir pedidos", "Como exportar CSV?"] },
  { id: "pedidos-cancelado", categoria: "Pedidos", keywords: ["pedido cancelado", "cancelar pedido", "status cancelado"], resposta: "Pedidos cancelados ficam no histórico, mas não entram na receita. Depois de cancelado ou entregue, o avanço automático é bloqueado.", sugestoes: ["Como usar status manual?", "Como ler receita?"] },
  { id: "pedidos-persistencia", categoria: "Pedidos", keywords: ["pedidos persistem", "pedido localstorage", "salvar pedido"], resposta: "Pedidos persistem no localStorage por empresa. Recarregar a página mantém os pedidos da conta logada.", sugestoes: ["Como dados são separados?", "Como trocar conta?"] },
  { id: "pedidos-dashboard", categoria: "Pedidos", keywords: ["dashboard atualizando apos mudar status", "status atualiza dashboard", "mudou status dashboard"], resposta: "Ao mudar status, o pedido é persistido e o dashboard recalcula pedidos pendentes, aprovados e receita sem precisar atualizar manualmente.", sugestoes: ["Como avançar status?", "Como ler dashboard?"] },
  { id: "pedidos-permissao", categoria: "Pedidos", keywords: ["permissao status", "nao posso alterar pedido", "cargo pedido"], resposta: "Alterar status exige permissão do cargo. Admin, Vendedor, Estoque e Financeiro podem alterar; Cliente B2B tem acesso mais restrito.", sugestoes: ["Como funcionam permissões?", "Como trocar conta?"] },
  { id: "pedidos-exportar", categoria: "Pedidos", keywords: ["exportar pedidos", "csv pedidos", "baixar pedidos"], resposta: "Use Exportar CSV em pedidos ou relatórios. O arquivo usa os dados visíveis ou os pedidos da empresa quando não houver tabela na tela.", sugestoes: ["Como exportar relatório?", "Abrir pedidos"] },
  { id: "clientes-cadastrar", categoria: "Clientes", keywords: ["como cadastrar cliente", "cadastrar cliente", "novo cliente", "adicionar cliente"], resposta: "Abra Clientes e clique em Novo cliente. Informe nome, detalhe e status. O cadastro fica isolado na empresa atual.", sugestoes: ["Abrir clientes", "Como segmentar clientes?"] },
  { id: "clientes-segmento", categoria: "Clientes", keywords: ["segmentar cliente", "segmentos", "cliente recorrente", "alto valor"], resposta: "Use o status do cliente para sinalizar contas ativas, recorrentes ou de alto valor. O dashboard usa esses dados para calcular clientes ativos.", sugestoes: ["Como cadastrar cliente?", "Como campanhas usam clientes?"] },
  { id: "clientes-empresa", categoria: "Clientes", keywords: ["clientes por empresa", "dados separados clientes", "cliente empresa"], resposta: "Clientes são salvos por empresa. Uma conta da Micora não enxerga clientes da Astra, por exemplo.", sugestoes: ["Como trocar conta?", "Como dados são separados?"] },
  { id: "clientes-vazio", categoria: "Clientes", keywords: ["sem clientes", "clientes vazio", "nenhum cliente"], resposta: "Se clientes estiver vazio, cadastre o primeiro cliente ou carregue dados demo em uma conta admin para visualizar o fluxo completo.", sugestoes: ["Como cadastrar cliente?", "Como carregar demo?"] },
  { id: "clientes-permissao", categoria: "Clientes", keywords: ["permissao clientes", "quem pode ver clientes", "acesso clientes"], resposta: "Admin e Vendedor têm acesso a clientes. Cargos mais operacionais podem ter acesso limitado para manter segurança da conta.", sugestoes: ["Como funcionam permissões?", "Como trocar cargo?"] },
  { id: "ia-usar", categoria: "IA Comercial", keywords: ["como usar a ia comercial", "ia comercial", "usar ia", "assistente comercial"], resposta: "A IA Comercial da demo gera sugestões locais com base no estado atual do portal. Ela não chama API externa; serve para simular priorização e próximos passos.", sugestoes: ["Abrir IA Comercial", "Como campanhas usam IA?"] },
  { id: "ia-sem-api", categoria: "IA Comercial", keywords: ["api ia", "openai", "ia real", "sem api"], resposta: "Nesta versão, a IA é 100% simulada em JavaScript. Nenhum dado sai do navegador, o que mantém a demo segura e previsível.", sugestoes: ["Como funciona segurança?", "Como usar IA Comercial?"] },
  { id: "ia-sugestoes", categoria: "IA Comercial", keywords: ["sugestoes ia", "recomendacao", "proximos passos"], resposta: "As sugestões aparecem como ações comerciais: revisar pedidos, criar campanhas, olhar estoque ou exportar relatórios.", sugestoes: ["Como criar campanha?", "Como exportar relatório?"] },
  { id: "ia-assistant-chat", categoria: "IA Comercial", keywords: ["nexora assistant", "chat", "ajuda inteligente", "assistente"], resposta: "Eu sou o Nexora Assistant: um chat local para tirar dúvidas do portal B2B, abrir áreas e explicar fluxos sem usar API externa.", sugestoes: ["Abrir catálogo", "Abrir pedidos"] },
  { id: "campanhas-criar", categoria: "Campanhas", keywords: ["criar campanha", "nova campanha", "campanhas"], resposta: "Campanhas aparecem no painel de Campanhas. Na demo, se não houver dados, o painel mostra estado vazio e permite acionar IA ou carregar demo.", sugestoes: ["Como usar IA Comercial?", "Como clientes entram em campanhas?"] },
  { id: "campanhas-clientes", categoria: "Campanhas", keywords: ["campanha cliente", "campanha por cliente", "publico campanha"], resposta: "Use clientes e oportunidades para orientar campanhas. Contas recorrentes ou de alto valor são bons alvos para bundles B2B.", sugestoes: ["Como segmentar clientes?", "Como criar campanha?"] },
  { id: "campanhas-relatorio", categoria: "Campanhas", keywords: ["relatorio campanha", "medir campanha", "resultado campanha"], resposta: "Resultados de campanha podem alimentar relatórios quando há pedidos e oportunidades relacionados. Na demo, o painel mostra os dados disponíveis.", sugestoes: ["Como exportar relatório?", "Como usar IA Comercial?"] },
  { id: "relatorios-exportar", categoria: "Relatórios", keywords: ["como exportar relatorio", "exportar relatorio", "exportar csv", "csv"], resposta: "Clique em Exportar CSV. O sistema baixa um arquivo com a tabela atual ou, se não houver tabela, com pedidos da empresa logada.", sugestoes: ["Abrir relatórios", "Como exportar pedidos?"] },
  { id: "relatorios-vazio", categoria: "Relatórios", keywords: ["relatorio vazio", "sem relatorio", "sem dados relatorio"], resposta: "Relatórios vazios indicam que a empresa ainda não gerou pedidos, clientes ou campanhas. Crie dados reais ou carregue demo como admin.", sugestoes: ["Como criar pedido?", "Como carregar dados demo?"] },
  { id: "relatorios-dashboard", categoria: "Relatórios", keywords: ["relatorio dashboard", "metricas relatorio", "indicadores relatorio"], resposta: "Relatórios resumem o mesmo conjunto operacional do dashboard: pedidos, receita, clientes e status. Eles ajudam a baixar dados em CSV.", sugestoes: ["Como ler dashboard?", "Como exportar CSV?"] },
  { id: "admin-demo", categoria: "Admin", keywords: ["admin demo", "painel admin", "administrador"], resposta: "O Admin demo mostra permissões, dados da empresa e ações como carregar demo, limpar dados e configurar conta.", sugestoes: ["Abrir admin", "Como funcionam permissões?"] },
  { id: "admin-permissoes", categoria: "Admin", keywords: ["permissoes por cargo", "cargos", "role", "permissao"], resposta: "Permissões são definidas por cargo: Admin tem acesso total; Vendedor foca em vendas; Estoque em pedidos e status; Financeiro em pedidos e relatórios; Cliente B2B é limitado.", sugestoes: ["Como trocar conta?", "Como adicionar usuário?"] },
  { id: "admin-demo-data", categoria: "Admin", keywords: ["carregar dados demo", "dados demo", "popular demo"], resposta: "Carregar dados demo preenche produtos, clientes, pedidos, campanhas e relatórios somente na empresa atual. É necessário cargo Admin.", sugestoes: ["Abrir admin", "Como limpar dados?"] },
  { id: "admin-limpar", categoria: "Admin", keywords: ["limpar dados", "zerar empresa", "resetar dados"], resposta: "Limpar dados zera produtos, pedidos, clientes, carrinho e relatórios da empresa atual, sem apagar usuários nem cadastro da empresa.", sugestoes: ["Como fazer backup?", "Como dados são separados?"] },
  { id: "admin-conta-pendente", categoria: "Admin", keywords: ["como ativar uma conta pendente", "ativar conta pendente", "conta pendente"], resposta: "Na demo, uma conta pendente pode ser revisada no admin e nas configurações da empresa. Para ativação real, o fluxo ideal é validar CNPJ, plano e permissões.", sugestoes: ["Abrir admin", "Como editar CNPJ?"] },
  { id: "config-conta", categoria: "Configurações", keywords: ["configuracoes da conta", "editar conta", "perfil", "minha conta"], resposta: "Abra Configurações para editar nome, e-mail, telefone, empresa, CNPJ, cidade, estado e plano. Depois salve para persistir localmente.", sugestoes: ["Abrir configurações", "Como editar CNPJ?"] },
  { id: "config-cnpj", categoria: "Configurações", keywords: ["cnpj", "editar cnpj", "cadastro cnpj"], resposta: "O CNPJ fica no cadastro da empresa. Em Configurações da conta, ajuste o campo CNPJ e salve para manter no localStorage.", sugestoes: ["Abrir configurações", "Como cadastrar empresa?"] },
  { id: "config-empresa", categoria: "Configurações", keywords: ["empresa logada", "empresa ativa", "dados da empresa"], resposta: "A empresa logada define quais produtos, pedidos, clientes e carrinho aparecem. O dropdown do usuário mostra a empresa ativa.", sugestoes: ["Como trocar conta?", "Como dados são separados?"] },
  { id: "config-limite-estoque", categoria: "Configurações", keywords: ["limite estoque", "estoque baixo", "configurar estoque"], resposta: "O limite de estoque baixo fica nas configurações operacionais da empresa. A demo usa um limite padrão de 10 unidades.", sugestoes: ["Como editar estoque?", "Como abrir configurações?"] },
  { id: "login-entrar", categoria: "Login/cadastro", keywords: ["como fazer login", "login", "entrar", "acessar conta"], resposta: "Use o botão de perfil ou a tela pública para entrar. Contas demo ficam salvas localmente para testar cargos diferentes.", sugestoes: ["Como trocar conta?", "Como recuperar senha?"] },
  { id: "login-cadastro", categoria: "Login/cadastro", keywords: ["cadastro", "criar conta", "cadastrar empresa", "registrar"], resposta: "No cadastro, informe usuário, e-mail, senha, empresa, CNPJ, segmento e plano. A conta criada fica disponível neste navegador.", sugestoes: ["Como escolher plano?", "Como fazer login?"] },
  { id: "login-logout", categoria: "Login/cadastro", keywords: ["logout", "sair", "encerrar sessao"], resposta: "Abra o dropdown do usuário e clique em Sair. A sessão encerra, mas usuários e dados da empresa continuam salvos no navegador.", sugestoes: ["Como trocar conta?", "Como fazer login?"] },
  { id: "login-trocar-conta", categoria: "Login/cadastro", keywords: ["trocar conta", "mudar usuario", "outra conta"], resposta: "No dropdown do usuário, escolha Trocar conta. Você pode alternar entre usuários demo e testar permissões diferentes.", sugestoes: ["Como funcionam permissões?", "Como dados são separados?"] },
  { id: "login-recuperar", categoria: "Login/cadastro", keywords: ["recuperar senha demo", "esqueci senha", "recuperar senha"], resposta: "A recuperação de senha é demo: ela gera feedback visual local e não envia e-mail externo.", sugestoes: ["Como fazer login?", "Como trocar conta?"] },
  { id: "sessao-persistente", categoria: "Sessão", keywords: ["usuario logado persiste", "sessao persiste", "recarregar pagina", "manter login"], resposta: "A sessão fica salva no localStorage. Ao recarregar, o app restaura o usuário logado, a última tela e os dados da empresa.", sugestoes: ["Como fazer logout?", "Como dados são separados?"] },
  { id: "seguranca-dados", categoria: "Segurança", keywords: ["seguranca", "dados separados", "multiempresa", "isolamento"], resposta: "Dados operacionais são separados por empresa no localStorage: produtos, pedidos, clientes, carrinho, campanhas e relatórios têm chaves próprias.", sugestoes: ["Como trocar conta?", "Como fazer backup?"] },
  { id: "seguranca-backup", categoria: "Segurança", keywords: ["como fazer backup", "backup", "salvar dados", "exportar dados"], resposta: "Para backup nesta demo, exporte relatórios e pedidos em CSV. Como os dados ficam no navegador, limpar localStorage apaga a operação local.", sugestoes: ["Como exportar relatório?", "Como exportar pedidos?"] },
  { id: "seguranca-console", categoria: "Segurança", keywords: ["erro no console", "console", "bug javascript"], resposta: "Se algo parecer travado, recarregue e teste a ação novamente. A revisão atual busca manter botões com feedback, modal ou toast para evitar cliques mortos.", sugestoes: ["Abrir configurações", "Abrir pedidos"] },
  { id: "planos-precos", categoria: "Planos", keywords: ["precos planos", "quanto custa", "starter", "growth", "scale", "enterprise ai"], resposta: "Planos atuais: Starter US$159.90, Growth US$210.90, Scale US$339.90 e Enterprise AI US$499.90 com oferta destacada de US$1,500.00 por US$499.90.", sugestoes: ["Como trocar de plano?", "Como contratar plano?"] },
  { id: "planos-trocar", categoria: "Planos", keywords: ["como trocar de plano", "trocar plano", "upgrade", "downgrade"], resposta: "Abra Configurações da conta, escolha o plano desejado e salve. Para contratação real, use o fluxo de solicitação no site público.", sugestoes: ["Abrir configurações", "Quais são os preços?"] },
  { id: "planos-contratar", categoria: "Planos", keywords: ["solicitacao de contratacao", "contratar plano", "assinar plano"], resposta: "Na página pública, escolha um plano e avance para cadastro. O app guarda a intenção do plano para preencher o cadastro.", sugestoes: ["Como cadastrar empresa?", "Quais são os preços?"] },
  { id: "planos-enterprise", categoria: "Planos", keywords: ["enterprise ai desconto", "desconto enterprise", "plano enterprise"], resposta: "O Enterprise AI deve comunicar a oferta premium: de US$1,500.00 por US$499.90, com foco em IA, governança e operação B2B avançada.", sugestoes: ["Como trocar de plano?", "Como usar IA Comercial?"] },
  { id: "suporte", categoria: "Suporte", keywords: ["suporte", "ajuda", "atendimento", "preciso de ajuda"], resposta: "Use o botão de suporte no topo para abrir o painel operacional. Também posso explicar fluxos e abrir áreas pelo chat.", sugestoes: ["Abrir catálogo", "Abrir pedidos"] },
  { id: "notificacoes", categoria: "Notificações", keywords: ["notificacoes", "alertas", "sino", "avisos"], resposta: "O sino abre notificações simuladas com ações úteis. Alertas reais podem vir de pedidos, estoque ou risco operacional.", sugestoes: ["Como alterar status?", "Como filtrar dados?"] },
  { id: "busca-global", categoria: "Busca global", keywords: ["busca global", "pesquisar", "buscar no sistema"], resposta: "Digite um termo na busca e pressione Enter. Se encontrar ação conhecida, o sistema abre o recurso; senão mostra um painel com orientação.", sugestoes: ["Buscar catálogo", "Buscar relatórios"] },
  { id: "responsividade", categoria: "Interface", keywords: ["responsivo", "celular", "mobile", "layout quebrado"], resposta: "A interface se adapta para desktop e mobile com sidebar horizontal, painéis compactos e cards empilhados. Se notar texto quebrado, vale revisar a largura da tela.", sugestoes: ["Abrir checkout", "Abrir dashboard"] },
  { id: "modais", categoria: "Interface", keywords: ["modal", "janela", "popup", "fechar modal"], resposta: "Modais abrem para login, cadastro, configurações e ações críticas. Clique no X, fora do modal ou pressione Escape para fechar.", sugestoes: ["Abrir configurações", "Como fazer login?"] },
  { id: "dropdown-usuario", categoria: "Interface", keywords: ["dropdown usuario", "dealoflo", "menu usuario", "perfil canto"], resposta: "O menu do usuário abre Perfil, Configurações, Empresa logada, Trocar conta, Recuperar senha e Sair. Clique fora para fechar.", sugestoes: ["Como trocar conta?", "Como ver empresa logada?"] },
  { id: "toast-feedback", categoria: "Interface", keywords: ["toast", "feedback visual", "botao sem acao", "clique morto"], resposta: "Quando uma ação não tem fluxo completo, o app deve mostrar toast, painel ou modal. A ideia é que nenhum elemento pareça quebrado.", sugestoes: ["Como abrir suporte?", "Como ver notificações?"] },
  { id: "comprador-b2b", categoria: "Operação B2B", keywords: ["cliente b2b", "comprador b2b", "portal comprador"], resposta: "O papel Cliente B2B acessa catálogo, carrinho, checkout e pedidos com permissões reduzidas, simulando o comprador da distribuidora.", sugestoes: ["Como funcionam permissões?", "Como finalizar pedido?"] },
  { id: "distribuidora", categoria: "Operação B2B", keywords: ["distribuidora", "b2b commerce", "portal distribuidora"], resposta: "A Nexora foi moldada para distribuidoras: catálogo, pedido B2B, status operacional, clientes, campanhas, relatórios e admin em um fluxo único.", sugestoes: ["Como criar produto?", "Como criar pedido?"] },
  { id: "financeiro", categoria: "Operação B2B", keywords: ["financeiro", "faturado", "pagamento opal", "pagamentos"], resposta: "Pagamentos Opal resume status financeiro a partir dos pedidos reais. O cargo Financeiro consegue ver pedidos, relatórios e alterar status quando permitido.", sugestoes: ["Abrir pagamentos", "Como exportar relatório?"] },
  { id: "risco-sla", categoria: "Operação B2B", keywords: ["risco", "sla", "morticious", "anomalia"], resposta: "A tela de Riscos e SLA calcula sinais a partir de pedidos, alertas e cancelamentos. Sem dados, ela fica zerada com orientação para criar operação real.", sugestoes: ["Abrir riscos", "Como criar pedido?"] },
  { id: "equipe-sla", categoria: "Operação B2B", keywords: ["equipe", "teamflow", "handoff", "responsavel"], resposta: "Equipe e SLA organiza handoffs de pedidos e campanhas. Ações de atribuição mostram feedback visual para não parecerem cliques mortos.", sugestoes: ["Abrir equipe", "Como avançar status?"] },
  { id: "mercados", categoria: "Operação B2B", keywords: ["mercados", "canais", "market", "oportunidades"], resposta: "Mercados mostra canais, campanhas e oportunidades com base nos dados da empresa. É útil para planejar expansão B2B.", sugestoes: ["Como criar campanha?", "Como usar IA Comercial?"] },
  { id: "componentes-operacao", categoria: "Operação B2B", keywords: ["componentes", "operacao", "modulos", "stack"], resposta: "Operação consolida saúde dos módulos: catálogo, checkout, pedidos, status e relatórios. Sem dados, a tela fica pronta para receber cadastros reais.", sugestoes: ["Abrir operação", "Como criar produto?"] },
  { id: "opal", categoria: "Pagamentos", keywords: ["opal", "pagamentos opal", "pagamento"], resposta: "Opal é a área de pagamentos. Ela lê pedidos e formas de pagamento para montar uma visão financeira do portal.", sugestoes: ["Abrir checkout", "Como status inicial funciona?"] },
  { id: "availability", categoria: "Estoque", keywords: ["availability", "disponibilidade", "estoque disponibilidade"], resposta: "Disponibilidade cruza catálogo, estoque baixo e carrinho. Cadastre produtos para a tela deixar de ficar zerada.", sugestoes: ["Como criar produto?", "Como editar estoque?"] },
  { id: "projetos", categoria: "Projetos", keywords: ["projetos", "projects", "pipeline projetos"], resposta: "Projetos usa pedidos como pipeline operacional. Cada pedido pode ser acompanhado por status e histórico.", sugestoes: ["Abrir pedidos", "Como ver histórico?"] },
  { id: "atalhos", categoria: "Navegação", keywords: ["atalhos", "comandos", "o que posso perguntar"], resposta: "Você pode pedir: abrir catálogo, abrir pedidos, abrir admin, abrir configurações, explicar checkout, status, relatórios, planos ou permissões.", sugestoes: ["Abrir catálogo", "Abrir pedidos"] },
  { id: "complaint-pedido-atrasado", categoria: "Reclamações", keywords: ["pedido atrasado", "meu pedido atrasou", "atraso no pedido", "pedido nao chegou"], resposta: "Entendi. Vou registrar essa ocorrência como atraso de pedido e pedir o número do pedido para análise.", sugestoes: ["Ver reclamações", "Como encontrar meu pedido?", "Como falar com suporte?"], tipo: "complaint" },
  { id: "complaint-produto-errado", categoria: "Reclamações", keywords: ["produto errado", "veio errado", "produto diferente", "item errado"], resposta: "Vou registrar como divergência de produto e solicitar o pedido e qual produto chegou diferente.", sugestoes: ["Ver reclamações", "Como enviar comprovante demo?", "Como falar com suporte?"], tipo: "complaint" },
  { id: "complaint-produto-faltando", categoria: "Reclamações", keywords: ["produto faltando", "item faltante", "faltou produto", "faltou item"], resposta: "Vou registrar como item faltante e pedir o número do pedido e o item que não chegou.", sugestoes: ["Ver reclamações", "Como encontrar meu pedido?", "Como falar com suporte?"], tipo: "complaint" },
  { id: "complaint-produto-defeito", categoria: "Reclamações", keywords: ["produto com defeito", "produto quebrado", "danificado", "defeito"], resposta: "Vou registrar como produto com defeito ou danificado e pedir detalhes do item afetado.", sugestoes: ["Ver reclamações", "Como enviar comprovante demo?", "Como falar com suporte?"], tipo: "complaint" },
  { id: "complaint-preco-incorreto", categoria: "Reclamações", keywords: ["preco incorreto", "preco errado", "valor errado", "preco diferente"], resposta: "Vou registrar como divergência de preço e pedir preço esperado, preço exibido e produto.", sugestoes: ["Ver reclamações", "Como exportar relatório?", "Como falar com suporte?"], tipo: "complaint" },
  { id: "complaint-desconto", categoria: "Reclamações", keywords: ["desconto nao aplicado", "desconto nao entrou", "desconto errado", "sem desconto"], resposta: "Vou registrar como problema de desconto e pedir o valor do pedido e a regra esperada.", sugestoes: ["Ver reclamações", "Como alterar status?", "Como falar com suporte?"], tipo: "complaint" },
  { id: "complaint-frete", categoria: "Reclamações", keywords: ["frete errado", "valor do frete", "entrega cobrada", "frete incorreto"], resposta: "Vou registrar como divergência de frete e pedir valor exibido, cidade, estado e total do pedido.", sugestoes: ["Ver reclamações", "Como encontrar meu pedido?", "Como falar com suporte?"], tipo: "complaint" },
  { id: "complaint-pedido-sumiu", categoria: "Reclamações", keywords: ["pedido nao aparece", "pedido sumiu", "pedido desapareceu", "nao vejo pedido"], resposta: "Vou registrar como pedido não localizado e orientar a conferência da empresa logada e do histórico.", sugestoes: ["Ver reclamações", "Abrir pedidos", "Como dados são separados?"], tipo: "complaint" },
  { id: "complaint-status", categoria: "Reclamações", keywords: ["status nao atualiza", "status nao muda", "status travou", "status errado"], resposta: "Vou registrar como problema de status do pedido e pedir o número do pedido para análise.", sugestoes: ["Ver reclamações", "Como alterar status?", "Abrir pedidos"], tipo: "complaint" },
  { id: "complaint-pagamento", categoria: "Reclamações", keywords: ["pagamento nao identificado", "pagamento nao caiu", "pagamento sumiu", "comprovante"], resposta: "Vou registrar como prioridade alta e pedir método de pagamento, valor, data e comprovante demo.", sugestoes: ["Ver reclamações", "Como enviar comprovante demo?", "Como falar com suporte?"], tipo: "complaint" },
  { id: "complaint-conta-pendente", categoria: "Reclamações", keywords: ["conta pendente", "conta nao ativa", "ativar conta", "cadastro pendente"], resposta: "Vou registrar como problema de conta e orientar validação de cadastro, CNPJ e plano.", sugestoes: ["Ver reclamações", "Como ativar uma conta pendente?", "Abrir configurações"], tipo: "complaint" },
  { id: "complaint-login", categoria: "Reclamações", keywords: ["login nao funciona", "nao consigo acessar", "senha nao funciona", "erro login"], resposta: "Vou registrar como problema de acesso e pedir e-mail da conta e mensagem exibida.", sugestoes: ["Ver reclamações", "Como recuperar senha?", "Como trocar conta?"], tipo: "complaint" },
  { id: "complaint-cnpj", categoria: "Reclamações", keywords: ["cnpj invalido", "cnpj nao aceita", "erro no cnpj", "cadastro cnpj"], resposta: "Vou registrar como problema de cadastro e orientar conferência dos 14 números do CNPJ.", sugestoes: ["Ver reclamações", "Como editar CNPJ?", "Abrir configurações"], tipo: "complaint" },
  { id: "complaint-sistema-travando", categoria: "Reclamações", keywords: ["sistema travando", "sistema lento", "tela travando", "travando totalmente"], resposta: "Vou registrar como instabilidade do sistema e pedir tela, ação executada e urgência.", sugestoes: ["Ver reclamações", "Como falar com suporte?", "Abrir suporte"], tipo: "complaint" },
  { id: "complaint-sem-estoque", categoria: "Reclamações", keywords: ["produto sem estoque", "sem estoque", "estoque errado", "ruptura"], resposta: "Vou registrar como problema de disponibilidade e pedir produto/SKU envolvido.", sugestoes: ["Ver reclamações", "Abrir catálogo", "Como editar estoque?"], tipo: "complaint" },
  { id: "complaint-vendedor", categoria: "Reclamações", keywords: ["vendedor nao respondeu", "suporte nao responde", "ninguem respondeu", "sem retorno"], resposta: "Vou registrar como falha de atendimento e encaminhar para revisão interna demo.", sugestoes: ["Ver reclamações", "Como falar com suporte?", "Abrir suporte"], tipo: "complaint" },
  { id: "complaint-checkout", categoria: "Reclamações", keywords: ["erro no checkout", "checkout nao funciona", "nao consigo finalizar", "finalizar pedido erro"], resposta: "Vou registrar como erro no checkout e pedir forma de pagamento, carrinho e mensagem exibida.", sugestoes: ["Ver reclamações", "Abrir checkout", "Como finalizar pedido?"], tipo: "complaint" },
  { id: "complaint-carrinho", categoria: "Reclamações", keywords: ["erro no carrinho", "carrinho nao funciona", "item sumiu carrinho", "carrinho errado"], resposta: "Vou registrar como erro no carrinho e pedir produto, quantidade e empresa logada.", sugestoes: ["Ver reclamações", "Abrir catálogo", "Como ver carrinho?"], tipo: "complaint" },
  { id: "complaint-relatorio", categoria: "Reclamações", keywords: ["relatorio nao exporta", "csv nao baixa", "exportacao falhou", "erro csv"], resposta: "Vou registrar como problema de exportação e pedir tela e tipo de relatório.", sugestoes: ["Ver reclamações", "Como exportar relatório?", "Abrir relatórios"], tipo: "complaint" },
  { id: "complaint-campanha", categoria: "Reclamações", keywords: ["campanha nao funciona", "erro campanha", "campanha sumiu", "campanha travou"], resposta: "Vou registrar como problema de campanha e pedir nome da campanha e ação executada.", sugestoes: ["Ver reclamações", "Abrir campanhas", "Como usar IA Comercial?"], tipo: "complaint" },
  { id: "complaint-ia", categoria: "Reclamações", keywords: ["ia comercial nao respondeu", "ia nao respondeu", "assistente nao respondeu", "ia travou"], resposta: "Vou registrar como problema de IA simulada e pedir a pergunta enviada e a tela usada.", sugestoes: ["Ver reclamações", "Como usar IA Comercial?", "Abrir suporte"], tipo: "complaint" },
  { id: "complaint-plano", categoria: "Reclamações", keywords: ["problema com plano", "plano errado", "assinatura errada", "upgrade nao entrou"], resposta: "Vou registrar como problema de plano e pedir plano esperado, plano exibido e empresa.", sugestoes: ["Ver reclamações", "Como trocar de plano?", "Abrir configurações"], tipo: "complaint" },
  { id: "complaint-cobranca", categoria: "Reclamações", keywords: ["cobranca errada", "cobraram errado", "valor cobrado errado", "fatura errada"], resposta: "Vou registrar como cobrança errada com prioridade crítica e pedir valor, data e plano/pedido relacionado.", sugestoes: ["Ver reclamações", "Como exportar relatório?", "Como falar com suporte?"], tipo: "complaint" },
  { id: "complaint-cancelar", categoria: "Reclamações", keywords: ["quero cancelar", "cancelar assinatura", "cancelar pedido", "cancelamento"], resposta: "Vou registrar uma solicitação de cancelamento sem prometer cancelamento automático; a equipe poderá analisar.", sugestoes: ["Ver reclamações", "Como falar com suporte?", "Abrir configurações"], tipo: "complaint" },
  { id: "complaint-insatisfeito", categoria: "Reclamações", keywords: ["estou insatisfeito", "insatisfeito", "ruim", "pessimo"], resposta: "Vou registrar a insatisfação e pedir detalhes para encaminhar corretamente.", sugestoes: ["Ver reclamações", "Como falar com suporte?", "Abrir suporte"], tipo: "complaint" },
  { id: "complaint-irritado", categoria: "Reclamações", keywords: ["absurdo", "ridiculo", "horrivel", "estou bravo", "palhacada", "que lixo"], resposta: "Vou responder com cuidado, registrar prioridade e pedir o pedido ou tela relacionada.", sugestoes: ["Ver reclamações", "Como falar com suporte?", "Abrir suporte"], tipo: "complaint" },
  { id: "complaint-generica", categoria: "Reclamações", keywords: ["problema", "erro", "bug", "reclamacao", "reclamar"], resposta: "Vou registrar a reclamação e pedir detalhes sobre a tela, pedido ou ação envolvida.", sugestoes: ["Ver reclamações", "Como falar com suporte?", "Como encontrar meu pedido?"], tipo: "complaint" },
  { id: "complaint-comprovante", categoria: "Reclamações", keywords: ["enviar comprovante demo", "comprovante demo", "anexar comprovante", "comprovante"], resposta: "Na demo, descreva valor, data e método de pagamento na própria mensagem. O protocolo guarda esses detalhes no histórico local.", sugestoes: ["Ver reclamações", "Pagamento não identificado", "Como falar com suporte?"], tipo: "complaint" },
  { id: "complaint-acompanhar", categoria: "Reclamações", keywords: ["acompanhar protocolo", "acompanhar reclamacao", "ver protocolo", "consultar protocolo"], resposta: "Você pode acompanhar tudo em Suporte > Reclamações, incluindo status, histórico e observações internas.", sugestoes: ["Ver reclamações", "Como mudar status da reclamação?", "Exportar reclamações"], tipo: "complaint" },
  { id: "complaint-resolver", categoria: "Reclamações", keywords: ["marcar resolvida", "resolver reclamacao", "mudar status reclamacao", "status reclamacao"], resposta: "Abra o detalhe da reclamação, escolha o novo status, adicione uma observação interna e salve.", sugestoes: ["Ver reclamações", "Como exportar reclamações?", "Abrir suporte"], tipo: "complaint" },
  { id: "complaint-exportar", categoria: "Reclamações", keywords: ["exportar reclamacoes", "csv reclamacoes", "baixar protocolos", "exportar suporte"], resposta: "Na tela Suporte, use Exportar CSV para baixar protocolos, categorias, prioridades, status e mensagens.", sugestoes: ["Ver reclamações", "Como exportar relatório?", "Abrir suporte"], tipo: "complaint" },
];

let assistantTypingTimer = null;

function readStored(key, fallback) {
  try {
    const value = localStorage.getItem(key);
    return value ? JSON.parse(value) : fallback;
  } catch {
    return fallback;
  }
}

function writeStored(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

function companyKey(scope, empresaId) {
  return `nexora_${scope}_${empresaId}`;
}

function createEmptyCompanyData(company = {}) {
  return {
    products: [],
    orders: [],
    clients: [],
    cart: [],
    campaigns: [],
    alerts: [],
    reports: [],
    opportunities: [],
    complaints: [],
    settings: { theme: "dark", density: "executive", plan: company.plano || "Growth", lowStockLimit: LOW_STOCK_LIMIT },
  };
}

function createDemoCompanyData(company = getCurrentCompany()) {
  const empresaId = company?.id || "demo";
  const empresaNome = company?.nomeEmpresa || "Empresa demo";
  return {
    products: [
      { sku: "NX-100", name: "Nexora Core Suite", price: 1284, stock: 42, status: "Ativo" },
      { sku: "OP-220", name: "Opal Payment Rail", price: 920, stock: 18, status: "Ativo" },
      { sku: "IM-510", name: "Inventory Mesh Pro", price: 1100, stock: 7, status: "Ativo" },
    ],
    orders: [
      {
        id: `ORD-${Date.now().toString().slice(-6)}`,
        empresaId,
        empresaCompradora: empresaNome,
        item: "Pacote premium B2B",
        value: formatCurrency(32480),
        amount: 32480,
        formaPagamento: "Faturado",
        status: "Aprovado",
        createdBy: getCurrentUser()?.id || "u-demo",
        historicoStatus: [{ status: "Aprovado", data: formatNow(), usuario: getCurrentUser()?.nome || "Nexora Demo" }],
      },
      {
        id: `ORD-${(Date.now() + 7).toString().slice(-6)}`,
        empresaId,
        empresaCompradora: empresaNome,
        item: "Inventory Mesh Pro",
        value: formatCurrency(18900),
        amount: 18900,
        formaPagamento: "Pix",
        status: "Em separação",
        createdBy: getCurrentUser()?.id || "u-demo",
        historicoStatus: [{ status: "Em separação", data: formatNow(), usuario: getCurrentUser()?.nome || "Nexora Demo" }],
      },
      {
        id: `ORD-${(Date.now() + 13).toString().slice(-6)}`,
        empresaId,
        empresaCompradora: empresaNome,
        item: "Checkout aguardando aprovação",
        value: formatCurrency(7280),
        amount: 7280,
        formaPagamento: "Boleto",
        status: "Pendente",
        createdBy: getCurrentUser()?.id || "u-demo",
        historicoStatus: [{ status: "Pendente", data: formatNow(), usuario: getCurrentUser()?.nome || "Nexora Demo" }],
      },
    ],
    clients: [
      { name: "Enterprise Prime", detail: "214 contas", status: "Ativo" },
      { name: "Regional Operators", detail: "438 contas", status: "Recorrente" },
      { name: "Contas estratégicas", detail: "Alto valor", status: "Alto valor" },
    ],
    cart: [],
    campaigns: [{ name: "Enterprise Prime", detail: "Bundle premium preparado", status: "Ativa" }],
    alerts: [["Estoque baixo", "Inventory Mesh Pro abaixo do limite"], ["Pedido pendente", "1 pedido aguardando aprovação"]],
    reports: [["Receita", "Demonstração executiva"], ["Pedidos", "Pipeline saudável"]],
    opportunities: [{ title: "Bundle premium", detail: "IA recomenda oferta para contas estratégicas", status: "Aberta" }],
    complaints: [],
    settings: { theme: "dark", density: "executive", plan: company?.plano || "Enterprise AI", lowStockLimit: LOW_STOCK_LIMIT },
  };
}

function resetStoredCompanyDataIfNeeded() {
  if (localStorage.getItem(STORAGE_KEYS.dataResetVersion) === DATA_RESET_VERSION) return;
  for (const company of appState.companies) {
    const empty = createEmptyCompanyData(company);
    for (const scope of DATA_SCOPES) {
      writeStored(companyKey(scope, company.id), empty[scope]);
    }
  }
  appState.companyData = {};
  localStorage.setItem(STORAGE_KEYS.dataResetVersion, DATA_RESET_VERSION);
}

function initializeSessionState() {
  appState.users = readStored(STORAGE_KEYS.users, clone(defaultUsers));
  appState.companies = readStored(STORAGE_KEYS.companies, clone(defaultCompanies));
  appState.session = readStored(STORAGE_KEYS.session, null);

  for (const defaultUser of defaultUsers) {
    if (!appState.users.some((user) => user.id === defaultUser.id || user.email === defaultUser.email)) {
      appState.users.push(clone(defaultUser));
    }
  }

  for (const defaultCompany of defaultCompanies) {
    if (!appState.companies.some((company) => company.id === defaultCompany.id)) {
      appState.companies.push(clone(defaultCompany));
    }
  }

  if (appState.session?.userId && !appState.users.some((user) => user.id === appState.session.userId)) {
    appState.session = null;
  }

  resetStoredCompanyDataIfNeeded();

  for (const company of appState.companies) {
    ensureCompanyData(company.id);
  }

  writeStored(STORAGE_KEYS.users, appState.users);
  writeStored(STORAGE_KEYS.companies, appState.companies);
  writeStored(STORAGE_KEYS.session, appState.session);
  syncActiveOrder();
}

function getCurrentUser() {
  return appState.users.find((user) => user.id === appState.session?.userId) || null;
}

function getCurrentCompany() {
  const user = getCurrentUser();
  return appState.companies.find((company) => company.id === user?.empresaId) || null;
}

function ensureCompanyData(empresaId) {
  if (!empresaId) return {};
  const seeded = defaultCompanyData[empresaId] || {};
  const company = appState.companies.find((item) => item.id === empresaId) || {};
  const empty = createEmptyCompanyData(company);
  const data = {};
  for (const scope of DATA_SCOPES) {
    const fallback = clone(seeded[scope] ?? empty[scope]);
    data[scope] = readStored(companyKey(scope, empresaId), fallback);
    writeStored(companyKey(scope, empresaId), data[scope]);
  }
  appState.companyData[empresaId] = data;
  return data;
}

function seedCompanyData(company) {
  const empresaId = company.id;
  const data = createEmptyCompanyData(company);
  appState.companyData[empresaId] = data;
  for (const scope of DATA_SCOPES) {
    writeStored(companyKey(scope, empresaId), data[scope]);
  }
  writeStored(STORAGE_KEYS.companies, appState.companies);
}

function persistCompanyData(empresaId = getCurrentUser()?.empresaId) {
  if (!empresaId) return;
  const data = appState.companyData[empresaId] || ensureCompanyData(empresaId);
  for (const scope of DATA_SCOPES) {
    writeStored(companyKey(scope, empresaId), data[scope] ?? (scope === "settings" ? {} : []));
  }
}

function getCompanyData(empresaId = getCurrentUser()?.empresaId) {
  if (!empresaId) return {};
  return appState.companyData[empresaId] || ensureCompanyData(empresaId);
}

function getCompanyOrders(empresaId = getCurrentUser()?.empresaId) {
  const data = getCompanyData(empresaId);
  data.orders ||= [];
  return data.orders;
}

function getSupabaseBaseUrl() {
  return SUPABASE_CONFIG.url.replace(/\/rest\/v1\/?$/i, "").replace(/\/$/, "");
}

function isSupabaseConfigured() {
  return Boolean(getSupabaseBaseUrl() && SUPABASE_CONFIG.publishableKey);
}

function isSupabaseProductsReady() {
  return localStorage.getItem(STORAGE_KEYS.supabaseProductsReady) === "true";
}

function setSupabaseProductsReady(ready) {
  localStorage.setItem(STORAGE_KEYS.supabaseProductsReady, ready ? "true" : "false");
}

function getSupabaseCompanyId() {
  return getCurrentUser()?.empresaId || getCurrentCompany()?.id || "demo";
}

function buildSupabaseUrl(table, query = "") {
  const base = getSupabaseBaseUrl();
  return `${base}/rest/v1/${table}${query}`;
}

async function supabaseRequest(table, { method = "GET", query = "", body = null, prefer = "" } = {}) {
  if (!isSupabaseConfigured()) throw new Error("Supabase não configurado.");
  const headers = {
    apikey: SUPABASE_CONFIG.publishableKey,
    Authorization: `Bearer ${SUPABASE_CONFIG.publishableKey}`,
  };
  if (body !== null) headers["Content-Type"] = "application/json";
  if (prefer) headers.Prefer = prefer;
  const response = await fetch(buildSupabaseUrl(table, query), {
    method,
    headers,
    body: body === null ? null : JSON.stringify(body),
  });
  if (!response.ok) {
    const detail = await response.text().catch(() => "");
    throw new Error(`Supabase ${response.status}: ${detail.slice(0, 180)}`);
  }
  if (response.status === 204) return null;
  const text = await response.text();
  return text ? JSON.parse(text) : null;
}

function getSupabaseProductPayload(product) {
  const company = getCurrentCompany() || {};
  return {
    company_id: getSupabaseCompanyId(),
    company_name: company.nomeEmpresa || "",
    sku: normalizeProductSku(getProductSku(product)),
    name: getProductName(product),
    price: getProductPrice(product),
    stock: getProductStock(product),
    status: product.status || "Ativo",
    source: getProductOrigin(product),
    source_url: getProductSourceUrl(product) || null,
    media_count: getProductMedia(product).length,
    media_summary: getProductMediaSummary(product),
    created_label: product.createdAt || product.importedAt || "",
    updated_label: formatNow(),
  };
}

async function syncProductsToSupabase(products, { notify = false, force = false } = {}) {
  const rows = (products || []).map(getSupabaseProductPayload);
  if (!rows.length || !isSupabaseConfigured()) return { ok: false, reason: "empty-or-missing-config" };
  if (!force && !isSupabaseProductsReady()) return { ok: false, reason: "supabase-not-verified" };
  try {
    const query = "?on_conflict=company_id,sku";
    await supabaseRequest(SUPABASE_CONFIG.productsTable, {
      method: "POST",
      query,
      body: rows,
      prefer: "resolution=merge-duplicates,return=minimal",
    });
    if (notify) showToast(`${rows.length} produto(s) sincronizado(s) com Supabase.`);
    return { ok: true, count: rows.length };
  } catch (error) {
    if (notify) showToast("Supabase ainda não está pronto. Rode o SQL de schema primeiro.");
    return { ok: false, reason: error.message };
  }
}

function syncProductToSupabase(product, options = {}) {
  return syncProductsToSupabase([product], options);
}

async function deleteProductFromSupabase(sku, { notify = false, force = false } = {}) {
  if (!isSupabaseConfigured()) return { ok: false, reason: "missing-config" };
  if (!force && !isSupabaseProductsReady()) return { ok: false, reason: "supabase-not-verified" };
  const companyId = encodeURIComponent(getSupabaseCompanyId());
  const cleanSku = encodeURIComponent(normalizeProductSku(sku));
  try {
    await supabaseRequest(SUPABASE_CONFIG.productsTable, {
      method: "DELETE",
      query: `?company_id=eq.${companyId}&sku=eq.${cleanSku}`,
      prefer: "return=minimal",
    });
    if (notify) showToast("Produto removido do Supabase.");
    return { ok: true };
  } catch (error) {
    if (notify) showToast("Não consegui remover no Supabase ainda.");
    return { ok: false, reason: error.message };
  }
}

async function testSupabaseProductsTable() {
  if (!isSupabaseConfigured()) return { ok: false, message: "URL ou publishable key ausente." };
  try {
    await supabaseRequest(SUPABASE_CONFIG.productsTable, { query: "?select=id&limit=1" });
    return { ok: true, message: "Tabela nexora_products conectada." };
  } catch (error) {
    return { ok: false, message: error.message };
  }
}

function getActiveOrder() {
  const orders = getCompanyOrders();
  return orders.find((order) => order.id === appState.activeOrderId) || orders[orders.length - 1] || null;
}

function syncActiveOrder() {
  const order = getActiveOrder();
  appState.activeOrderId = order?.id || null;
  appState.orderStatus = order?.status || "Pendente";
}

function persistSession() {
  writeStored(STORAGE_KEYS.users, appState.users);
  writeStored(STORAGE_KEYS.companies, appState.companies);
  writeStored(STORAGE_KEYS.session, appState.session);
  persistCompanyData();
}

function hasPermission(permission) {
  const user = getCurrentUser();
  return Boolean(user && ROLE_PERMISSIONS[user.cargo]?.includes(permission));
}

function requirePermission(permission, label) {
  if (hasPermission(permission)) return true;
  const user = getCurrentUser();
  if (!user) {
    showToast("Entre na sua conta para continuar.");
    renderPublicSite();
    openLoginModal();
    return false;
  }
  showToast("Você não tem permissão para acessar esta área.");
  openQuickPanel("Permissão insuficiente", [
    [label, "Ação bloqueada para este cargo"],
    [user?.cargo || "Visitante", "Cargo atual"],
    ["Trocar conta", "Use uma conta com permissao para continuar"],
  ], [
    { id: "switch-account", label: "Trocar conta" },
    { id: "login", label: "Login" },
  ]);
  return false;
}

function formatNow() {
  return new Date().toLocaleString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatCurrency(value) {
  return `US$${value.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function parseMoney(value) {
  if (typeof value === "number") return value;
  if (!value) return 0;
  const raw = String(value).replace(/[^\d,.-]/g, "");
  const normalized =
    raw.includes(",") && raw.includes(".")
      ? raw.lastIndexOf(".") > raw.lastIndexOf(",")
        ? raw.replace(/,/g, "")
        : raw.replace(/\./g, "").replace(",", ".")
      : raw.replace(",", ".");
  const parsed = Number(normalized);
  return Number.isFinite(parsed) ? parsed : 0;
}

function getOrderAmount(order) {
  return Number(order?.amount) || parseMoney(order?.value);
}

function getProductName(product) {
  return product?.name || product?.item || product?.produto || product?.[1] || "Produto";
}

function getProductSku(product) {
  return product?.sku || product?.[0] || "SKU";
}

function normalizeProductSku(value) {
  return String(value || "")
    .trim()
    .toUpperCase()
    .replace(/\s+/g, "-");
}

function getProductPrice(product) {
  return Number(product?.price) || parseMoney(product?.priceLabel || product?.[2]);
}

function getProductStock(product) {
  return Number(product?.stock ?? product?.estoque ?? product?.[3] ?? 0);
}

function getProductOrigin(product) {
  return product?.source || product?.origem || (product?.importedAt ? "Importação autorizada" : "Cadastro manual");
}

function normalizeProductSourceUrl(value) {
  const raw = String(value || "").trim();
  if (!raw) return "";
  if (/^https?:\/\//i.test(raw)) return raw;
  if (/^[a-z0-9.-]+\.[a-z]{2,}(\/.*)?$/i.test(raw)) return `https://${raw}`;
  return "";
}

function getProductSourceUrl(product) {
  return normalizeProductSourceUrl(product?.sourceUrl || product?.url || product?.link);
}

function getProductMedia(product) {
  return Array.isArray(product?.media) ? product.media.filter(Boolean) : [];
}

function isProductImageMedia(item) {
  return item?.kind === "image" || String(item?.type || "").startsWith("image/");
}

function isProductVideoMedia(item) {
  return item?.kind === "video" || String(item?.type || "").startsWith("video/");
}

function getProductMediaSummary(product) {
  const media = getProductMedia(product);
  if (!media.length) return "Sem mídia";
  const images = media.filter(isProductImageMedia).length;
  const videos = media.filter(isProductVideoMedia).length;
  const others = media.length - images - videos;
  const parts = [];
  if (images) parts.push(`${images} foto${images === 1 ? "" : "s"}`);
  if (videos) parts.push(`${videos} vídeo${videos === 1 ? "" : "s"}`);
  if (others) parts.push(`${others} arquivo${others === 1 ? "" : "s"}`);
  return parts.join(" · ");
}

function formatFileSize(bytes) {
  const size = Number(bytes) || 0;
  if (size < 1024) return `${size} B`;
  if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)} KB`;
  return `${(size / (1024 * 1024)).toFixed(1)} MB`;
}

function renderProductMediaPreview(product) {
  const media = getProductMedia(product);
  if (!media.length) return `<span class="product-media-placeholder">Mídia</span>`;
  const visible = media.slice(0, 3);
  return `
    <div class="product-media-strip" aria-label="${escapeHtml(getProductMediaSummary(product))}">
      ${visible
        .map((item) =>
          isProductImageMedia(item) && item.dataUrl
            ? `<img class="product-media-thumb" src="${escapeHtml(item.dataUrl)}" alt="${escapeHtml(item.name || "Foto do produto")}" loading="lazy" />`
            : `<span class="product-media-thumb product-media-video" title="${escapeHtml(item.name || "Vídeo do produto")}">VID</span>`,
        )
        .join("")}
      ${media.length > visible.length ? `<span class="product-media-more">+${media.length - visible.length}</span>` : ""}
    </div>
  `;
}

function renderProductMediaSelectionPreview(files) {
  const selected = [...(files || [])];
  if (!selected.length) return "Nenhuma mídia selecionada.";
  const images = selected.filter((file) => String(file.type || "").startsWith("image/")).length;
  const videos = selected.filter((file) => String(file.type || "").startsWith("video/")).length;
  const totalSize = selected.reduce((total, file) => total + (Number(file.size) || 0), 0);
  const invalid = selected.filter((file) => !PRODUCT_MEDIA_TYPES.some((prefix) => String(file.type || "").startsWith(prefix)));
  const summary = [
    images ? `${images} foto${images === 1 ? "" : "s"}` : "",
    videos ? `${videos} vídeo${videos === 1 ? "" : "s"}` : "",
    invalid.length ? `${invalid.length} inválido${invalid.length === 1 ? "" : "s"}` : "",
    formatFileSize(totalSize),
  ]
    .filter(Boolean)
    .join(" · ");
  const chips = selected
    .slice(0, 6)
    .map((file) => `<span>${escapeHtml(file.name)} <small>${escapeHtml(formatFileSize(file.size))}</small></span>`)
    .join("");
  return `
    <strong>${escapeHtml(summary)}</strong>
    <div class="media-file-list">${chips}${selected.length > 6 ? `<span>+${selected.length - 6} arquivo(s)</span>` : ""}</div>
  `;
}

function updateProductMediaSelection(input) {
  const output = input.closest(".modal-form")?.querySelector(".product-media-selected");
  if (!output) return;
  output.innerHTML = renderProductMediaSelectionPreview(input.files);
}

function readFileAsDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result || ""));
    reader.onerror = () => reject(reader.error || new Error("Falha ao ler arquivo."));
    reader.readAsDataURL(file);
  });
}

async function getProductMediaFromModal() {
  const input = document.querySelector('.modal-card [name="productMedia"]');
  const files = [...(input?.files || [])];
  if (!files.length) return [];
  showToast(`Carregando ${files.length} arquivo${files.length === 1 ? "" : "s"} do produto.`);
  const media = [];
  for (const file of files) {
    if (!PRODUCT_MEDIA_TYPES.some((prefix) => String(file.type || "").startsWith(prefix))) {
      showToast(`Arquivo ignorado: ${file.name}`);
      continue;
    }
    try {
      media.push({
        id: `media-${Date.now()}-${media.length}`,
        name: file.name,
        type: file.type || "application/octet-stream",
        size: file.size || 0,
        kind: file.type.startsWith("video/") ? "video" : "image",
        dataUrl: await readFileAsDataUrl(file),
        addedAt: formatNow(),
      });
    } catch {
      showToast(`Não consegui carregar ${file.name}.`);
    }
  }
  return media;
}

function getClientName(client) {
  return client?.name || client?.nome || client?.[0] || "Cliente";
}

function getClientDetail(client) {
  return client?.detail || client?.detalhe || client?.[1] || "Conta B2B";
}

function getClientStatus(client) {
  const raw = client?.status || client?.situacao || client?.[2] || client?.[1] || "";
  return String(raw).toLowerCase();
}

function getCampaignStatus(campaign) {
  return String(campaign?.status || campaign?.situacao || campaign?.[2] || campaign?.[1] || "").toLowerCase();
}

function calculateCompanyMetrics(empresaId = getCurrentUser()?.empresaId) {
  const data = getCompanyData(empresaId);
  const orders = data.orders || [];
  const products = data.products || [];
  const clients = data.clients || [];
  const campaigns = data.campaigns || [];
  const opportunities = data.opportunities || [];
  const revenueOrders = orders.filter((order) => REVENUE_STATUSES.includes(order.status));
  const faturamentoTotal = revenueOrders.reduce((total, order) => total + getOrderAmount(order), 0);
  const lowStockLimit = Number(data.settings?.lowStockLimit) || LOW_STOCK_LIMIT;
  const activeClients = clients.filter((client) => {
    const status = getClientStatus(client);
    return !status || ACTIVE_CLIENT_STATUSES.some((activeStatus) => status.includes(activeStatus));
  }).length;
  const activeCampaigns = campaigns.filter((campaign) => {
    const status = getCampaignStatus(campaign);
    return status.includes("ativa") || status.includes("ativo") || status.includes("active");
  }).length;

  return {
    receitaMensal: faturamentoTotal,
    faturamentoTotal,
    pedidosRecebidos: orders.length,
    pedidosPendentes: orders.filter((order) => order.status === "Pendente").length,
    pedidosAprovados: orders.filter((order) => order.status === "Aprovado").length,
    clientesAtivos: activeClients,
    produtosCadastrados: products.length,
    ticketMedio: revenueOrders.length ? faturamentoTotal / revenueOrders.length : 0,
    carrinhosAbandonados: (data.cart || []).length ? 1 : 0,
    produtosEstoqueBaixo: products.filter((product) => getProductStock(product) < lowStockLimit).length,
    campanhasAtivas: activeCampaigns,
    oportunidadesIA: opportunities.length,
  };
}

function renderEmptyState(title, detail, actionId, actionLabel) {
  return `
    <div class="empty-state">
      <strong>${title}</strong>
      <span>${detail}</span>
      ${actionId ? `<button class="mini-action" type="button" data-action="${actionId}">${actionLabel}</button>` : ""}
    </div>
  `;
}

function renderHomeView() {
  const company = getCurrentCompany();
  const data = getCompanyData();
  const metrics = calculateCompanyMetrics();
  const orders = data.orders || [];
  const products = data.products || [];
  const clients = data.clients || [];
  const alerts = data.alerts || [];
  const hasOrders = orders.length > 0;
  const validRevenue = metrics.faturamentoTotal > 0;
  const chartBars = hasOrders
    ? STATUS_FLOW.map((status) => orders.filter((order) => order.status === status).length)
    : [0, 0, 0, 0, 0];
  const maxBars = Math.max(...chartBars, 1);
  const recentOrders = orders.slice(-3).reverse();

  return `
    <div class="section-heading">
      <div>
        <h1>Dashboard Executivo</h1>
        <p class="section-kicker">${company?.nomeEmpresa || "Empresa"} · métricas calculadas com dados reais da empresa atual.</p>
      </div>
      <div class="segmented" role="tablist" aria-label="Dashboard range">
        <button class="active" type="button" data-range="productize">Operação</button>
        <button type="button" data-range="metrics">Métricas</button>
        <button type="button" data-range="social">Canais</button>
      </div>
    </div>

    <section class="metric-grid real-metrics" aria-label="Métricas reais">
      <article class="metric-card">
        <div>
          <p>Receita mensal</p>
          <div class="metric-value">${formatCurrency(metrics.receitaMensal)}</div>
          <small>${validRevenue ? "Pedidos aprovados e faturados" : "Nenhuma venda registrada ainda"}</small>
        </div>
        <div class="metric-icon"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 19V9"/><path d="M10 19V5"/><path d="M16 19v-8"/><path d="M22 19V3"/></svg></div>
      </article>
      <article class="metric-card">
        <div>
          <p>Pedidos recebidos</p>
          <div class="metric-value">${metrics.pedidosRecebidos}</div>
          <small>${metrics.pedidosPendentes} pendente(s) · ${metrics.pedidosAprovados} aprovado(s)</small>
        </div>
        <div class="metric-icon cluster"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 2h12l2 4v16H4V6Z"/><path d="M6 6h12"/><path d="M9 11h6"/><path d="M9 15h6"/></svg></div>
      </article>
      <article class="metric-card">
        <div>
          <p>Clientes ativos</p>
          <div class="metric-value">${metrics.clientesAtivos}</div>
          <small>${clients.length ? `${clients.length} cliente(s) cadastrados` : "Nenhum cliente cadastrado ainda"}</small>
        </div>
        <div class="metric-icon"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/></svg></div>
      </article>
      <article class="metric-card">
        <div>
          <p>Produtos cadastrados</p>
          <div class="metric-value">${metrics.produtosCadastrados}</div>
          <small>${metrics.produtosEstoqueBaixo} produto(s) com estoque baixo</small>
        </div>
        <div class="metric-icon cluster"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="m21 16-9 5-9-5V8l9-5 9 5Z"/><path d="m3.3 7.3 8.7 5 8.7-5"/><path d="M12 22V12"/></svg></div>
      </article>
    </section>

    <div class="home-data-grid">
      <section class="chart-card real-chart" aria-label="Gráfico real de pedidos">
        <div class="card-head">
          <h2>Pedidos por status</h2>
          <button class="mini-action" type="button" data-action="create-order">Novo pedido</button>
        </div>
        ${
          hasOrders
            ? `<div class="status-bars">${STATUS_FLOW.map((status, index) => `<div><span>${status}</span><b style="--bar:${Math.max(8, (chartBars[index] / maxBars) * 100)}%"></b><em>${chartBars[index]}</em></div>`).join("")}</div>`
            : renderEmptyState("Nenhuma venda registrada ainda.", "O gráfico será preenchido quando pedidos forem criados nesta empresa.", "checkout", "Abrir checkout")
        }
      </section>

      <section class="orders-card" aria-label="Pedidos recentes">
        <div class="card-head">
          <h2>Pedidos recentes</h2>
          <a href="#orders" data-action="orders">Ver todos</a>
        </div>
        ${
          recentOrders.length
            ? `<ul class="order-list">${recentOrders.map((order) => `<li class="order-item" data-order-id="${order.id}"><span class="avatar avatar-order-one" aria-hidden="true">${order.empresaCompradora.slice(0, 1)}</span><span><strong>${order.empresaCompradora}</strong><small>${order.id} · ${order.status}</small></span><em>${order.value || formatCurrency(getOrderAmount(order))}</em></li>`).join("")}</ul>`
            : renderEmptyState("Nenhum pedido criado ainda.", "Crie um pedido ou finalize um checkout para iniciar o histórico.", "checkout", "Ir para checkout")
        }
      </section>
    </div>

    <div class="home-data-grid secondary">
      <section class="orders-card">
        <div class="card-head">
          <h2>Operação comercial</h2>
          <button class="mini-action" type="button" data-action="reports">Relatórios</button>
        </div>
        <div class="metric-strip">
          <div><span>Faturamento total</span><strong>${formatCurrency(metrics.faturamentoTotal)}</strong></div>
          <div><span>Ticket médio</span><strong>${formatCurrency(metrics.ticketMedio)}</strong></div>
          <div><span>Carrinhos abandonados</span><strong>${metrics.carrinhosAbandonados}</strong></div>
          <div><span>Campanhas ativas</span><strong>${metrics.campanhasAtivas}</strong></div>
          <div><span>Oportunidades IA</span><strong>${metrics.oportunidadesIA}</strong></div>
        </div>
      </section>

      <section class="orders-card">
        <div class="card-head">
          <h2>Catálogo e alertas</h2>
          <button class="mini-action" type="button" data-action="catalog">Catálogo</button>
        </div>
        ${
          products.length
            ? `<div class="compact-list">${products.slice(0, 3).map((product) => `<div><strong>${getProductName(product)}</strong><small>SKU ${getProductSku(product)} · estoque ${getProductStock(product)}</small></div>`).join("")}</div>`
            : renderEmptyState("Nenhum produto cadastrado.", "Adicione seu primeiro produto para começar.", "add-product", "Novo produto")
        }
        ${
          alerts.length
            ? `<div class="compact-list alerts">${alerts.slice(0, 2).map((alert) => `<div><strong>${alert[0] || alert.title}</strong><small>${alert[1] || alert.detail}</small></div>`).join("")}</div>`
            : `<p class="empty-inline">Nenhum alerta comercial no momento.</p>`
        }
      </section>
    </div>
  `;
}

function renderPublicSite() {
  closeProfileDropdown();
  closeQuickPanel();
  closeModal();
  document.body.classList.add("public-mode");
  document.querySelector(".public-site")?.remove();
  const publicSite = document.createElement("main");
  publicSite.className = "public-site";
  const planCards = [
    {
      name: "Starter",
      price: "US$ 159,90",
      detail: "Catálogo e pedidos básicos",
    },
    {
      name: "Growth",
      price: "US$ 210,90",
      detail: "Equipe comercial e campanhas",
    },
    {
      name: "Scale",
      price: "US$ 339,90",
      detail: "Operação multiunidade",
    },
    {
      name: "Enterprise AI",
      price: "US$ 499,90",
      oldPrice: "US$ 1.500,00",
      detail: "IA, permissões e automações",
      discount: "Oferta premium: de US$ 1.500,00 por US$ 499,90",
    },
  ];
  publicSite.innerHTML = `
    <header class="public-nav">
      <a class="brand" href="#" data-action="public-home" aria-label="Nexora public home">
        <span class="brand-mark" aria-hidden="true"><span></span><span></span></span>
        <span>
          <strong>Nexora</strong>
          <small>B2B Commerce</small>
        </span>
      </a>
      <div class="public-nav-actions">
        <button class="mini-action" type="button" data-action="login">Login</button>
        <button class="mini-action" type="button" data-action="register">Criar conta</button>
      </div>
    </header>

    <section class="public-hero">
      <div>
        <p class="public-eyebrow">Commerce OS para distribuidoras B2B</p>
        <h1>Nexora B2B Commerce</h1>
        <p>Cadastro com CNPJ, checkout B2B, permissões por cargo e dados isolados por empresa em uma experiência SaaS premium para distribuidoras.</p>
        <div class="public-actions">
          <button type="button" data-action="register">Começar agora</button>
          <button type="button" data-action="login">Login</button>
          <button type="button" data-action="demo-login">Entrar como demo</button>
          <button type="button" data-action="view-plans">Ver planos</button>
        </div>
      </div>
      <div class="public-panel">
        <h2>Operação B2B conectada</h2>
        <div class="public-metric"><strong>4</strong><span>planos comerciais</span></div>
        <div class="public-metric"><strong>6</strong><span>status de pedido</span></div>
        <div class="public-metric"><strong>5</strong><span>cargos com permissões</span></div>
      </div>
    </section>

    <section class="public-benefits">
      <article><strong>Multiempresa</strong><span>Produtos, pedidos, clientes e alertas isolados por empresa.</span></article>
      <article><strong>Pedidos persistentes</strong><span>Checkout cria pedido, status e histórico persistem por empresa no navegador.</span></article>
      <article><strong>Permissões</strong><span>Admin, Vendedor, Estoque, Financeiro e Cliente B2B têm acessos diferentes.</span></article>
    </section>

    <section class="public-how">
      <h2>Como funciona</h2>
      <p>Crie uma conta, registre CNPJ, escolha o plano e entre no painel interno. A contratação fica simulada com dados locais e feedback visual imediato.</p>
    </section>

    <section class="public-plans" id="public-plans">
      ${planCards
        .map(
          (plan, index) => `
            <article class="${index === 3 ? "featured" : ""}">
              <strong>${plan.name}</strong>
              <div class="plan-price">
                ${plan.oldPrice ? `<small>${plan.oldPrice}</small>` : ""}
                <b>${plan.price}</b>
                <em>/mês</em>
              </div>
              ${plan.discount ? `<p class="plan-discount">${plan.discount}</p>` : ""}
              <span>${plan.detail}</span>
              <button type="button" data-action="register" data-plan="${plan.name}">Solicitar contratação</button>
            </article>
          `,
        )
        .join("")}
    </section>

    <footer class="public-footer">
      <span>Nexora B2B Commerce</span>
      <button type="button" data-action="recover-password">Esqueci minha senha</button>
    </footer>
    <div class="toast-region public-toast-region" aria-live="polite" aria-atomic="true"></div>
  `;
  document.body.prepend(publicSite);
}

function hidePublicSite() {
  document.body.classList.remove("public-mode");
  document.querySelector(".public-site")?.remove();
}

function openInternalApp(preferredView) {
  hidePublicSite();
  const user = getCurrentUser();
  if (!user) {
    renderPublicSite();
    return;
  }
  const lastPage = localStorage.getItem(`nexora_last_page_${user.empresaId}`);
  setView(preferredView || window.location.hash.replace("#", "") || lastPage || "home", { push: false });
}

const demoViews = {
  opal: {
    title: "Pagamentos Opal",
    kicker: "Pagamentos calculados somente a partir dos pedidos reais da empresa atual.",
    accent: "Orquestração de pagamentos",
    tableTitle: "Pagamentos registrados",
    insightTitle: "Foco financeiro",
  },
  availability: {
    title: "Estoque e Disponibilidade",
    kicker: "Produtos, estoque e carrinho calculados a partir do catálogo real da empresa.",
    accent: "Comando de estoque",
    tableTitle: "Produtos cadastrados",
    insightTitle: "Sinal de abastecimento",
  },
  markets: {
    title: "Mercados",
    kicker: "Canais, campanhas e oportunidades baseados apenas nos dados criados na conta.",
    accent: "Inteligência de mercado",
    tableTitle: "Campanhas e canais",
    insightTitle: "Leitura de mercado",
  },
  components: {
    title: "Operação",
    kicker: "Módulos comerciais e saúde operacional sem dados fictícios.",
    accent: "Módulos do sistema",
    tableTitle: "Saúde operacional",
    insightTitle: "Status da stack",
  },
  projects: {
    title: "Projetos",
    kicker: "Pedidos e iniciativas operacionais alimentados pela empresa atual.",
    accent: "Cockpit de projetos",
    tableTitle: "Pipeline de pedidos",
    insightTitle: "Pulso de entrega",
  },
  seglots: {
    title: "Clientes B2B",
    kicker: "Clientes e segmentos aparecem somente depois de cadastrados.",
    accent: "Inteligência de segmentos",
    tableTitle: "Mapa de clientes",
    insightTitle: "Foco comercial",
  },
  morticious: {
    title: "Riscos e SLA",
    kicker: "Riscos, alertas e cancelamentos calculados pela operação real.",
    accent: "Radar de risco",
    tableTitle: "Fila de risco",
    insightTitle: "Nota de controle",
  },
  teamflow: {
    title: "Equipe e SLA",
    kicker: "Handoffs e tarefas derivados dos pedidos e campanhas da empresa.",
    accent: "Orquestração de equipe",
    tableTitle: "Quadro de handoffs",
    insightTitle: "Pulso de execução",
  },
};

const views = {
  home: {
    title: "Dashboard Executivo",
    render: renderHomeView,
  },
  checkout: {
    title: "Checkout B2B",
    render: renderCheckoutView,
  },
  products: {
    title: "Produtos B2B",
    render: renderProductsView,
  },
  support: {
    title: "Suporte",
    render: renderSupportView,
  },
  ...Object.fromEntries(Object.entries(demoViews).map(([key, view]) => [key, { ...view, render: () => renderDemoView(key, view) }])),
};

function getCheckoutItems() {
  const cart = getCompanyData().cart || [];
  return cart.map((item, index) => ({
    ...item,
    id: item.id || `${item.sku || "item"}-${index}`,
    qty: Number(item.qty) || 1,
    price: Number(item.price) || CHECKOUT_ITEM_PRICE,
  }));
}

function buildOperationalView(key, view) {
  const data = getCompanyData();
  const metrics = calculateCompanyMetrics();
  const orders = data.orders || [];
  const products = data.products || [];
  const clients = data.clients || [];
  const campaigns = data.campaigns || [];
  const alerts = data.alerts || [];
  const opportunities = data.opportunities || [];
  const validOrders = orders.filter((order) => REVENUE_STATUSES.includes(order.status));
  const canceledOrders = orders.filter((order) => order.status === "Cancelado").length;

  const metricMap = {
    opal: [
      [formatCurrency(metrics.faturamentoTotal), "Receita aprovada", `${validOrders.length} pedido(s) faturados`],
      [`${metrics.pedidosAprovados}`, "Pedidos aprovados", "Baseado na empresa atual"],
      [`${metrics.pedidosPendentes}`, "Pedidos pendentes", "Aguardando aprovação"],
      [formatCurrency(metrics.ticketMedio), "Ticket médio", "Sem dados = zero"],
    ],
    availability: [
      [`${metrics.produtosCadastrados}`, "Produtos cadastrados", "Catálogo real"],
      [`${metrics.produtosEstoqueBaixo}`, "Estoque baixo", `Limite ${LOW_STOCK_LIMIT}`],
      [`${(data.cart || []).length}`, "Itens no carrinho", "Empresa atual"],
      ["0", "Rupturas críticas", "Nenhum alerta automático"],
    ],
    markets: [
      [`${metrics.clientesAtivos}`, "Clientes ativos", "Contas reais"],
      [`${metrics.campanhasAtivas}`, "Campanhas ativas", "Canais em operação"],
      [`${metrics.oportunidadesIA}`, "Oportunidades IA", "Criadas localmente"],
      [formatCurrency(metrics.faturamentoTotal), "Demanda faturada", "Pedidos válidos"],
    ],
    components: [
      [`${metrics.produtosCadastrados}`, "Produtos", "Módulos comerciais"],
      [`${(data.reports || []).length}`, "Relatórios", "Dados reais"],
      [`${alerts.length}`, "Alertas", "Operação atual"],
      [`${metrics.pedidosRecebidos}`, "Pedidos", "Pipeline real"],
    ],
    projects: [
      [`${metrics.pedidosRecebidos}`, "Pedidos abertos", "Carteira atual"],
      [`${metrics.pedidosPendentes}`, "Pendências", "Precisam ação"],
      [`${metrics.pedidosAprovados}`, "Aprovados", "Prontos para operação"],
      [formatCurrency(metrics.faturamentoTotal), "Valor previsto", "Sem cancelados"],
    ],
    seglots: [
      [`${clients.length}`, "Clientes cadastrados", "Base real"],
      [`${metrics.clientesAtivos}`, "Clientes ativos", "Ativo, recorrente ou alto valor"],
      [formatCurrency(metrics.ticketMedio), "Ticket médio", "Pedidos válidos"],
      [`${metrics.oportunidadesIA}`, "Oportunidades IA", "Sem dados = zero"],
    ],
    morticious: [
      [`${metrics.produtosEstoqueBaixo}`, "Sinais de estoque", "Produtos abaixo do limite"],
      [`${alerts.length}`, "Alertas abertos", "Empresa atual"],
      [`${metrics.pedidosPendentes}`, "Pedidos pendentes", "Risco comercial"],
      [`${canceledOrders}`, "Cancelados", "Fora da receita"],
    ],
    teamflow: [
      [`${metrics.pedidosRecebidos}`, "Tarefas de pedido", "Fluxo operacional"],
      [`${metrics.pedidosPendentes}`, "Handoffs pendentes", "Aguardando dono"],
      [`${metrics.campanhasAtivas}`, "Campanhas ativas", "Equipe comercial"],
      [`${metrics.clientesAtivos}`, "Contas ativas", "Customer success"],
    ],
  };

  const rowMap = {
    opal: orders.map((order) => [order.id, order.formaPagamento || "Faturado", order.status, order.value || formatCurrency(getOrderAmount(order))]),
    availability: products.map((product) => [getProductName(product), getProductSku(product), `Estoque ${getProductStock(product)}`, formatCurrency(getProductPrice(product))]),
    markets: campaigns.map((campaign) => [campaign.name || campaign[0], campaign.status || "Ativa", campaign.detail || campaign[1] || "Campanha", "Canal B2B"]),
    components: products.map((product) => [getProductName(product), getProductSku(product), getProductStock(product) < LOW_STOCK_LIMIT ? "Estoque baixo" : "Saudável", formatCurrency(getProductPrice(product))]),
    projects: orders.map((order) => [order.id, order.status, order.empresaCompradora, order.value || formatCurrency(getOrderAmount(order))]),
    seglots: clients.map((client) => [getClientName(client), client.status || "Ativo", getClientDetail(client), "Conta B2B"]),
    morticious: alerts.map((alert) => [alert.title || alert[0], "Aberto", "Operação", alert.detail || alert[1] || "Alerta"]),
    teamflow: orders.map((order) => [order.id, order.status, order.createdBy || "Sistema", order.value || formatCurrency(getOrderAmount(order))]),
  };

  const headerMap = {
    opal: ["Pedido", "Pagamento", "Status", "Valor"],
    availability: ["Produto", "SKU", "Estoque", "Preço"],
    markets: ["Campanha", "Status", "Detalhe", "Canal"],
    components: ["Módulo", "SKU", "Saúde", "Valor"],
    projects: ["Pedido", "Etapa", "Cliente", "Valor"],
    seglots: ["Cliente", "Status", "Detalhe", "Tipo"],
    morticious: ["Sinal", "Estado", "Responsável", "Detalhe"],
    teamflow: ["Pedido", "Status", "Responsável", "Valor"],
  };

  const emptyMessages = {
    opal: "Nenhum pagamento registrado ainda.",
    availability: "Nenhum produto cadastrado ainda.",
    markets: "Nenhuma campanha ou canal ativo ainda.",
    components: "Nenhum módulo comercial com dados reais ainda.",
    projects: "Nenhum pedido ou projeto operacional ainda.",
    seglots: "Nenhum cliente cadastrado ainda.",
    morticious: "Nenhum alerta comercial no momento.",
    teamflow: "Nenhuma tarefa operacional registrada ainda.",
  };

  const rows = rowMap[key] || [];
  return {
    ...view,
    metrics: metricMap[key] || metricMap.components,
    headers: headerMap[key] || view.headers,
    rows,
    emptyMessage: emptyMessages[key] || "Nenhum dado real registrado ainda.",
    insight: rows.length
      ? ["Dados calculados a partir da empresa atual.", "Pedidos cancelados não entram na receita.", "A tela atualiza conforme novos dados são criados."]
      : ["Tudo zerado para esta empresa.", "Crie produtos, clientes ou pedidos para alimentar esta tela.", "Dados demo só entram se forem carregados manualmente."],
  };
}

function renderCheckoutView() {
  const user = getCurrentUser();
  const company = getCurrentCompany();
  const items = getCheckoutItems();
  const itemCount = items.reduce((total, item) => total + (Number(item.qty) || 1), 0);
  const subtotal = items.reduce((total, item) => total + (Number(item.qty) || 1) * (Number(item.price) || 0), 0);
  const serviceFee = Math.round(subtotal * 0.03);
  const total = subtotal + serviceFee;
  const lines = items
    .map(
      (item) => `
        <div class="checkout-line" data-cart-item-id="${escapeHtml(item.id)}">
          <span class="checkout-line-icon" aria-hidden="true">${String(item.item || "N").slice(0, 1)}</span>
          <div>
            <strong>${escapeHtml(item.item || "Produto B2B")}</strong>
            <small>SKU ${escapeHtml(item.sku || "NX-100")} · ${formatCurrency(Number(item.price) || 0)} cada · ${escapeHtml(item.addedAt || "Carrinho ativo")}</small>
          </div>
          <em>${item.qty || 1}x</em>
          <b>${formatCurrency((Number(item.qty) || 1) * (Number(item.price) || 0))}</b>
          <button class="checkout-remove" type="button" data-action="remove-cart-item" data-cart-item-id="${escapeHtml(item.id)}" aria-label="Remover ${escapeHtml(item.item || "item")}">Remover</button>
        </div>
      `,
    )
    .join("") || renderEmptyState("Nenhum item no checkout.", "Adicione um item com produto, preço e quantidade para gerar um pedido.", "add-to-cart", "Adicionar item");

  return `
    <div class="checkout-page">
      <div class="section-heading checkout-heading">
        <div>
          <h1>Checkout B2B</h1>
          <p class="section-kicker">Finalize o pedido da empresa ativa com pagamento, status inicial e resumo comercial em uma página dedicada.</p>
        </div>
        <div class="checkout-secure">
          <span></span>
          <strong>Ambiente seguro</strong>
        </div>
      </div>

      <div class="checkout-layout">
        <section class="checkout-panel checkout-items">
          <div class="card-head">
            <h2>Itens do pedido</h2>
            <button class="mini-action" type="button" data-action="add-to-cart">Adicionar item</button>
          </div>
          <div class="checkout-lines">
            ${lines}
          </div>
          <div class="checkout-note">
            <strong>Condição B2B</strong>
            <span>Pedido vinculado à empresa logada, com carrinho e histórico separados no localStorage. Você pode remover itens antes de confirmar.</span>
          </div>
        </section>

        <section class="checkout-panel checkout-form-card">
          <div class="card-head">
            <h2>Pagamento e aprovação</h2>
            <button class="mini-action" type="button" data-action="cart">Ver carrinho</button>
          </div>
          <div class="checkout-form">
            <label>Empresa compradora
              <input type="text" value="${escapeHtml(company?.nomeEmpresa || "Empresa sem login")}" readonly />
            </label>
            <label>Responsável
              <input type="text" value="${escapeHtml(`${user?.nome || "Usuário"} · ${user?.cargo || "Cargo"}`)}" readonly />
            </label>
            <label>Forma de pagamento
              <select name="paymentMethod">
                <option value="Pix">Pix</option>
                <option value="Cartão">Cartão</option>
                <option value="Boleto">Boleto</option>
                <option value="Faturado" selected>Faturado</option>
              </select>
            </label>
            <label>Status inicial
              <select name="initialStatus">
                <option value="Pendente" selected>Pendente</option>
                <option value="Aprovado">Aprovado</option>
              </select>
            </label>
          </div>
          <div class="checkout-actions">
            <button class="checkout-primary" type="button" data-action="confirm-checkout">Confirmar pedido</button>
            <button class="mini-action" type="button" data-action="catalog">Voltar ao catálogo</button>
          </div>
        </section>

        <aside class="checkout-summary">
          <h2>Resumo</h2>
          <div><span>Itens</span><strong>${itemCount}</strong></div>
          <div><span>Subtotal</span><strong>${formatCurrency(subtotal)}</strong></div>
          <div><span>Serviço B2B</span><strong>${formatCurrency(serviceFee)}</strong></div>
          <div class="checkout-total"><span>Total</span><strong>${formatCurrency(total)}</strong></div>
          <p>Ao confirmar, o pedido entra no histórico da empresa ${escapeHtml(company?.nomeEmpresa || "ativa")} e o dashboard é atualizado automaticamente.</p>
        </aside>
      </div>
    </div>
  `;
}
function renderProductsView() {
  const company = getCurrentCompany();
  const data = getCompanyData();
  const products = data.products || [];
  const authorized = Boolean(company?.productsAuthorization?.authorized);
  const totalStock = products.reduce((total, product) => total + getProductStock(product), 0);
  const catalogValue = products.reduce((total, product) => total + getProductPrice(product) * getProductStock(product), 0);
  const lowStock = products.filter((product) => getProductStock(product) < LOW_STOCK_LIMIT).length;
  const rows = products
    .map(
      (product) => `
        <tr>
          <td>
            <div class="product-cell">
              ${renderProductMediaPreview(product)}
              <span><strong>${escapeHtml(getProductName(product))}</strong><small>${escapeHtml(product.status || "Ativo")}</small></span>
            </div>
          </td>
          <td>${escapeHtml(getProductMediaSummary(product))}</td>
          <td>${escapeHtml(getProductSku(product))}</td>
          <td>${formatCurrency(getProductPrice(product))}</td>
          <td>${getProductStock(product)}</td>
          <td class="source-cell">
            <strong>${escapeHtml(getProductOrigin(product))}</strong>
            <small>${escapeHtml(getProductSourceUrl(product) ? "Link salvo" : product.importedAt || product.createdAt || "Cadastro local")}</small>
          </td>
          <td>
            <div class="product-row-actions">
              <button class="mini-action" type="button" data-action="product-detail" data-product-sku="${escapeHtml(getProductSku(product))}">Ver</button>
              <button class="mini-action danger-action" type="button" data-action="delete-product" data-product-sku="${escapeHtml(getProductSku(product))}">Excluir</button>
            </div>
          </td>
        </tr>
      `,
    )
    .join("");

  return `
    <div class="products-page">
      <div class="section-heading products-heading">
        <div>
          <h1>Produtos B2B</h1>
          <p class="section-kicker">Página de produtos autorizados da empresa logada, pronta para catálogo, carrinho e checkout B2B.</p>
        </div>
        <div class="products-actions">
          <button class="mini-action" type="button" data-action="company-products-setup">Informar empresa</button>
          <button class="mini-action" type="button" data-action="add-product">Novo produto</button>
          <button class="mini-action" type="button" data-action="products-export">Exportar CSV</button>
        </div>
      </div>

      <section class="products-company-band">
        <div>
          <strong>${escapeHtml(company?.nomeEmpresa || "Empresa não informada")}</strong>
          <span>${escapeHtml(company?.segmento || "Segmento não informado")} · ${escapeHtml(company?.cnpj || "CNPJ não informado")}</span>
        </div>
        <div class="products-auth ${authorized ? "authorized" : ""}">
          <b>${authorized ? "Autorizado" : "Pendente"}</b>
          <small>${authorized ? `Produtos autorizados em ${escapeHtml(company.productsAuthorization.authorizedAt || "data local")}` : "Autorize a importação local antes de carregar produtos."}</small>
        </div>
      </section>

      <section class="metric-grid real-metrics products-metrics" aria-label="Resumo de produtos">
        <article class="metric-card demo-stat"><div><p>Produtos cadastrados</p><div class="metric-value">${products.length}</div><small>Empresa atual</small></div></article>
        <article class="metric-card demo-stat"><div><p>Estoque total</p><div class="metric-value">${totalStock}</div><small>Unidades disponíveis</small></div></article>
        <article class="metric-card demo-stat"><div><p>Estoque baixo</p><div class="metric-value">${lowStock}</div><small>Limite ${LOW_STOCK_LIMIT}</small></div></article>
        <article class="metric-card demo-stat"><div><p>Valor catálogo</p><div class="metric-value">${formatCurrency(catalogValue)}</div><small>Preço x estoque</small></div></article>
      </section>

      <section class="chart-card products-table-card">
        <div class="card-head">
          <h2>Produtos da empresa</h2>
          <button class="mini-action" type="button" data-action="company-products-setup">Importar autorizados</button>
        </div>
        ${
          products.length
            ? `
              <div class="table-wrap">
                <table class="demo-table products-table">
                  <thead>
                    <tr>
                      <th>Produto</th>
                      <th>Mídia</th>
                      <th>SKU</th>
                      <th>Preço</th>
                      <th>Estoque</th>
                      <th>Origem</th>
                      <th>Ação</th>
                    </tr>
                  </thead>
                  <tbody>${rows}</tbody>
                </table>
              </div>
            `
            : renderEmptyState("Nenhum produto cadastrado.", "Informe os dados da empresa, marque a autorização e importe a lista de produtos para montar o site B2B.", "company-products-setup", "Informar empresa")
        }
      </section>
    </div>
  `;
}

function renderSupportView() {
  const complaints = getCompanyComplaints();
  const openCount = complaints.filter((complaint) => complaint.status === "Aberta").length;
  const analysisCount = complaints.filter((complaint) => complaint.status === "Em análise").length;
  const resolvedCount = complaints.filter((complaint) => complaint.status === "Resolvida").length;
  const priorityCount = complaints.filter((complaint) => ["Alta", "Crítica"].includes(complaint.prioridade)).length;
  const latestRows = complaints
    .slice()
    .reverse()
    .map(
      (complaint) => `
        <tr data-complaint-id="${escapeHtml(complaint.id)}">
          <td><strong>${escapeHtml(complaint.protocolo)}</strong><small>${escapeHtml(complaint.pedidoRelacionado || "Sem pedido informado")}</small></td>
          <td>${escapeHtml(complaint.categoria)}</td>
          <td><span class="complaint-priority ${cssToken(complaint.prioridade)}">${escapeHtml(complaint.prioridade)}</span></td>
          <td><span class="complaint-status ${cssToken(complaint.status)}">${escapeHtml(complaint.status)}</span></td>
          <td>${escapeHtml(complaint.dataCriacao)}</td>
          <td class="complaint-message-cell">${escapeHtml(complaint.mensagemOriginal)}</td>
          <td>
            <div class="support-table-actions">
              <button class="mini-action" type="button" data-action="complaint-detail" data-complaint-id="${escapeHtml(complaint.id)}">Ver detalhes</button>
              <button class="mini-action" type="button" data-action="complaint-resolve" data-complaint-id="${escapeHtml(complaint.id)}">Resolver</button>
            </div>
          </td>
        </tr>
      `,
    )
    .join("");

  return `
    <div class="support-page">
      <div class="section-heading support-heading">
        <div>
          <h1>Suporte</h1>
          <p class="section-kicker">Reclamações registradas pelo Nexora Assistant, protocolos, status e observações internas por empresa.</p>
        </div>
        <div class="support-actions">
          <button class="mini-action" type="button" data-action="messages">Nexora Assistant</button>
          <button class="mini-action" type="button" data-action="complaints-export">Exportar CSV</button>
        </div>
      </div>

      <section class="metric-grid real-metrics support-metrics" aria-label="Resumo de reclamações">
        <article class="metric-card demo-stat">
          <div><p>Reclamações abertas</p><div class="metric-value">${openCount}</div><small>Protocolos aguardando triagem</small></div>
        </article>
        <article class="metric-card demo-stat">
          <div><p>Em análise</p><div class="metric-value">${analysisCount}</div><small>Ocorrências em atendimento</small></div>
        </article>
        <article class="metric-card demo-stat">
          <div><p>Resolvidas</p><div class="metric-value">${resolvedCount}</div><small>Concluídas pela equipe</small></div>
        </article>
        <article class="metric-card demo-stat">
          <div><p>Alta/Crítica</p><div class="metric-value">${priorityCount}</div><small>Prioridade elevada</small></div>
        </article>
      </section>

      <section class="chart-card support-table-card">
        <div class="card-head">
          <h2>Reclamações</h2>
          <button class="mini-action" type="button" data-action="complaints-export">Exportar CSV</button>
        </div>
        ${
          complaints.length
            ? `
              <div class="table-wrap">
                <table class="demo-table complaints-table">
                  <thead>
                    <tr>
                      <th>Protocolo</th>
                      <th>Categoria</th>
                      <th>Prioridade</th>
                      <th>Status</th>
                      <th>Data</th>
                      <th>Mensagem</th>
                      <th>Ação</th>
                    </tr>
                  </thead>
                  <tbody>${latestRows}</tbody>
                </table>
              </div>
            `
            : renderEmptyState("Nenhuma reclamação registrada.", "Abra o Nexora Assistant e descreva um problema para gerar o primeiro protocolo.", "messages", "Abrir assistente")
        }
      </section>
    </div>
  `;
}

function renderDemoView(key, view) {
  const operationalView = buildOperationalView(key, view);
  const metricCards = operationalView.metrics
    .map(
      ([value, label, detail], index) => `
        <article class="metric-card demo-stat">
          <div>
            <p>${label}</p>
            <div class="metric-value">${value}</div>
            <small>${detail}</small>
          </div>
          <div class="metric-icon ${index % 2 ? "cluster" : ""}">
            ${demoIcon(index)}
          </div>
        </article>
      `,
    )
    .join("");

  const rows = operationalView.rows
    .map(
      (row) => `
        <tr>
          ${row.map((cell, index) => `<td${index === 2 ? ' class="status-cell"' : ""}>${cell}</td>`).join("")}
        </tr>
      `,
    )
    .join("");

  return `
    <div class="section-heading">
      <div>
        <h1>${operationalView.title}</h1>
        <p class="section-kicker">${operationalView.kicker}</p>
      </div>
      <div class="segmented" role="tablist" aria-label="${operationalView.title} mode">
        <button class="active" type="button" data-demo-tab="overview">Visão geral</button>
        <button type="button" data-demo-tab="pipeline">Pipeline</button>
        <button type="button" data-demo-tab="audit">Auditoria</button>
      </div>
    </div>

    <div class="demo-grid">
      <section class="metric-grid demo-metrics" aria-label="${operationalView.title} metrics">
        ${metricCards}
      </section>

      <section class="chart-card demo-feature" data-demo-view="${key}">
        <div class="card-head">
          <h2>${operationalView.accent}</h2>
          <button class="mini-action" type="button" data-action="${key}-refresh">Atualizar</button>
        </div>
        <div class="demo-orbit" aria-hidden="true">
          <span></span><span></span><span></span>
        </div>
        <p class="demo-mode">A visão geral mostra apenas os dados reais de ${operationalView.title.toLowerCase()}.</p>
        <div class="signal-row">
          <span style="--signal: ${Math.min(100, Number(operationalView.metrics[0]?.[0]) || 0)}%">Confiança</span>
          <span style="--signal: ${Math.min(100, Number(operationalView.metrics[1]?.[0]) || 0)}%">Velocidade</span>
          <span style="--signal: ${Math.min(100, Number(operationalView.metrics[2]?.[0]) || 0)}%">Cobertura</span>
        </div>
      </section>
    </div>

    <div class="demo-lower-grid">
      <section class="orders-card demo-table-card">
        <div class="card-head">
          <h2>${operationalView.tableTitle}</h2>
          <button class="mini-action" type="button" data-action="${key}-export">Exportar</button>
        </div>
        ${
          operationalView.rows.length
            ? `<div class="table-wrap">
                <table class="demo-table">
                  <thead>
                    <tr>${operationalView.headers.map((header) => `<th>${header}</th>`).join("")}</tr>
                  </thead>
                  <tbody>${rows}</tbody>
                </table>
              </div>`
            : renderEmptyState(operationalView.emptyMessage, "Esta tela será preenchida quando houver dados reais na empresa atual.", "home", "Ver dashboard")
        }
      </section>

      <section class="orders-card demo-insight-card">
        <div class="card-head">
          <h2>${operationalView.insightTitle}</h2>
          <button class="mini-action" type="button" data-action="${key}-assign">Atribuir</button>
        </div>
        <ul class="insight-list">
          ${operationalView.insight.map((item) => `<li>${item}</li>`).join("")}
        </ul>
      </section>
    </div>
  `;
}

function demoIcon(index) {
  const icons = [
    '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 19V9"/><path d="M10 19V5"/><path d="M16 19v-8"/><path d="M22 19V3"/></svg>',
    '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M16 21v-2a4 4 0 0 0-4-4H7a4 4 0 0 0-4 4v2"/><circle cx="9.5" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/></svg>',
    '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M20 7h-9"/><path d="M14 17H5"/><circle cx="17" cy="17" r="3"/><circle cx="7" cy="7" r="3"/></svg>',
    '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 2v20"/><path d="m17 5-5-3-5 3"/><path d="m17 19-5 3-5-3"/><path d="M2 12h20"/></svg>',
  ];
  return icons[index] || icons[0];
}

function setView(viewKey, options = {}) {
  const user = getCurrentUser();
  if (!user) {
    renderPublicSite();
    return;
  }
  const key = views[viewKey] ? viewKey : "home";
  if (key === "checkout" && !requirePermission("checkout", "Checkout")) return;
  const view = views[key];
  dashboardContent.innerHTML = view.render();
  dashboardContent.dataset.currentView = key;
  document.title = `${view.title} - Nexora`;

  document.querySelectorAll(".nav-item").forEach((item) => {
    item.classList.toggle("active", item.dataset.view === key);
  });

  if (options.push !== false) {
    history.pushState({ view: key }, "", `#${key}`);
  }
  localStorage.setItem(`nexora_last_page_${user.empresaId}`, key);

  closeProfileDropdown();
  closeQuickPanel();
  updateAuthUI();
  updateCartCount();
  updateDashboardOrderWidgets();
  animateContent();
}

function animateContent() {
  dashboardContent.animate(
    [
      { opacity: 0.45, transform: "translateY(8px)" },
      { opacity: 1, transform: "translateY(0)" },
    ],
    { duration: 260, easing: "ease-out" },
  );
}

function refreshHomeIfVisible() {
  if (dashboardContent.dataset.currentView !== "home") return;
  dashboardContent.innerHTML = renderHomeView();
  updateDashboardOrderWidgets();
}

function applyRange(button) {
  button.closest(".segmented").querySelectorAll("button").forEach((item) => item.classList.toggle("active", item === button));
  dashboardContent.querySelectorAll(".metric-card, .orders-card, .chart-card").forEach((card) => {
    card.animate(
      [
        { opacity: 0.72, transform: "translateY(4px)" },
        { opacity: 1, transform: "translateY(0)" },
      ],
      { duration: 260, easing: "ease-out" },
    );
  });
  showToast("Dashboard recalculado com dados reais da empresa.");
}

function setDemoMode(button) {
  const group = button.closest(".segmented");
  const feature = dashboardContent.querySelector(".demo-feature");
  const modeText = dashboardContent.querySelector(".demo-mode");
  const currentTitle = dashboardContent.querySelector("h1")?.textContent || "esta tela";
  const messages = {
    overview: `A visão geral mostra os sinais mais fortes de ${currentTitle.toLowerCase()}.`,
    pipeline: "O pipeline prioriza próximos trabalhos, volume em movimento e handoffs de responsável.",
    audit: "A auditoria destaca controles, notas de revisão e exceções que pedem atenção.",
  };

  group.querySelectorAll("button").forEach((item) => item.classList.toggle("active", item === button));
  if (modeText) modeText.textContent = messages[button.dataset.demoTab] || messages.overview;
  feature?.animate(
    [
      { opacity: 0.65, transform: "scale(.992)" },
      { opacity: 1, transform: "scale(1)" },
    ],
    { duration: 220, easing: "ease-out" },
  );
}

function toggleTinyTab(button) {
  const group = button.closest(".tiny-tabs");
  const card = button.closest(".chart-card, .orders-card");
  group.querySelectorAll("button").forEach((item) => item.classList.toggle("active", item === button));
  card?.animate(
    [
      { filter: "brightness(1.12)" },
      { filter: "brightness(1)" },
    ],
    { duration: 240, easing: "ease-out" },
  );
}

function selectOrder(item) {
  document.querySelectorAll(".order-item").forEach((order) => order.classList.toggle("active", order === item));
  const storedOrder = getCompanyOrders().find((order) => order.id === item.dataset.orderId);
  if (storedOrder) {
    appState.activeOrderId = storedOrder.id;
    appState.orderStatus = storedOrder.status;
    persistSession();
  }
  const order = storedOrder || getActiveOrder();
  const orderName = order?.empresaCompradora || item.querySelector("strong")?.textContent || "Pedido selecionado";
  const orderValue = order?.value || item.querySelector("em")?.textContent || "Em revisão";
  openQuickPanel("Detalhe do pedido", [
    [orderName, "Pedido selecionado"],
    [orderValue, "Valor atual"],
    [order?.status || "Pendente", "Status atual"],
  ], [
    { id: "change-status", label: "Avançar" },
    { id: "manual-status", label: "Selecionar" },
    { id: "status-history", label: "Histórico" },
  ]);
}

function toggleProfileDropdown() {
  const nextExpanded = profileButton.getAttribute("aria-expanded") !== "true";
  if (nextExpanded) {
    closeQuickPanel();
    closeModal();
  }
  profileButton.setAttribute("aria-expanded", String(nextExpanded));
  profileDropdown.hidden = !nextExpanded;
}

function closeProfileDropdown() {
  profileButton?.setAttribute("aria-expanded", "false");
  if (profileDropdown) profileDropdown.hidden = true;
}

function updateAuthUI() {
  const user = getCurrentUser();
  const company = getCurrentCompany();
  const profileName = profileButton?.querySelector("strong");
  if (profileName) profileName.textContent = user?.nome || "Entrar";

  document.querySelectorAll(".sidebar-user strong").forEach((item) => {
    item.textContent = user?.nome || "Visitante";
  });
  document.querySelectorAll(".sidebar-user small").forEach((item) => {
    item.textContent = user ? `${company?.nomeEmpresa || "Empresa"} · ${user.cargo}` : "Sessão demo";
  });

  if (profileDropdown) {
    profileDropdown.innerHTML = user
      ? `
        <button type="button" role="menuitem" data-profile-action="profile">Perfil</button>
        <button type="button" role="menuitem" data-profile-action="settings">Configura&ccedil;&otilde;es</button>
        <button type="button" role="menuitem" data-profile-action="company">Empresa logada</button>
        <button type="button" role="menuitem" data-profile-action="switch">Trocar conta</button>
        <button type="button" role="menuitem" data-profile-action="recover">Recuperar senha</button>
        <button type="button" role="menuitem" data-profile-action="logout">Sair</button>
      `
      : `
        <button type="button" role="menuitem" data-profile-action="login">Login</button>
        <button type="button" role="menuitem" data-profile-action="register">Cadastro</button>
        <button type="button" role="menuitem" data-profile-action="recover">Recuperar senha</button>
      `;
  }
}

function handleProfileAction(action) {
  closeProfileDropdown();
  const user = getCurrentUser();
  const company = getCurrentCompany();

  if (action === "login") {
    openLoginModal();
    return;
  }

  if (action === "demo-login") {
    const demoUser = appState.users.find((user) => user.email === "demo@nexora.com");
    if (!demoUser) return showToast("Conta demo indisponível.");
    appState.session = { userId: demoUser.id };
    persistSession();
    syncActiveOrder();
    updateAuthUI();
    hidePublicSite();
    openInternalApp("home");
    showToast("Conta demo carregada.");
    return;
  }

  if (action === "register") {
    openRegisterModal();
    return;
  }

  if (action === "recover") {
    openRecoverModal();
    return;
  }

  if (action === "switch") {
    openSwitchAccountModal();
    return;
  }

  if (action === "logout") {
    confirmLogout();
    return;
  }

  if (!user) {
    openLoginModal();
    return;
  }

  const panels = {
    profile: {
      title: "Perfil",
      rows: [
        [user.nome, user.email],
        [company?.nomeEmpresa || "Empresa", "Empresa ativa"],
        [user.cargo, "Cargo e permissões"],
      ],
      actions: [
        { id: "switch-account", label: "Trocar conta" },
        { id: "account-settings", label: "Configurar" },
      ],
    },
    settings: {
      title: "Configurações da conta",
      rows: [
        [user.email, "E-mail da sessão"],
        [user.cargo, "Cargo atual"],
        ["LocalStorage", "Sessão e pedidos persistidos"],
      ],
      actions: [{ id: "account-settings", label: "Editar conta" }],
    },
    company: {
      title: "Empresa logada",
      rows: [
        [company?.nomeEmpresa || "Empresa", user.empresaId],
        [`${getCompanyOrders().length} pedido(s)`, "Dados isolados por empresa"],
        [getActiveOrder()?.status || "Sem pedido", "Status do pedido ativo"],
      ],
      actions: [
        { id: "orders", label: "Pedidos" },
        { id: "switch-account", label: "Trocar conta" },
      ],
    },
  };

  const panel = panels[action] || panels.profile;
  openQuickPanel(panel.title, panel.rows, panel.actions);
}

function openLoginModal() {
  openModal(
    "Login",
    `
      <div class="modal-form">
        <label>E-mail <input name="email" type="email" value="admin@nexora.demo" autocomplete="username" /></label>
        <label>Senha <input name="password" type="password" value="admin123" autocomplete="current-password" /></label>
      </div>
      <p class="modal-copy">Contas demo: admin@nexora.demo/admin123, ops@micora.demo/ops123, buyer@astra.demo/buyer123.</p>
    `,
    [
      { id: "confirm-login", label: "Entrar" },
      { id: "register", label: "Cadastro" },
      { id: "recover-password", label: "Recuperar" },
    ],
  );
}

function openRegisterModal() {
  const selectedPlan = appState.pendingPlan || "Growth";
  openModal(
    "Cadastro",
    `
      <div class="modal-form">
        <label>Nome completo <input name="name" type="text" value="" placeholder="Maria Silva" /></label>
        <label>E-mail <input name="email" type="email" value="" placeholder="maria@empresa.com" /></label>
        <label>Senha <input name="password" type="password" value="" placeholder="Mínimo 6 caracteres" /></label>
        <label>Confirmar senha <input name="confirmPassword" type="password" value="" placeholder="Repita a senha" /></label>
        <label>Nome da empresa <input name="company" type="text" value="" placeholder="Mercado São Jorge" /></label>
        <label>CNPJ <input name="cnpj" type="text" value="" placeholder="00.000.000/0001-00" /></label>
        <label>Telefone <input name="phone" type="text" value="" placeholder="(11) 99999-0000" /></label>
        <label>Segmento da distribuidora <input name="segment" type="text" value="" placeholder="Alimentos, bebidas, indústria..." /></label>
        <label>Cidade <input name="city" type="text" value="" placeholder="São Paulo" /></label>
        <label>Estado <input name="state" type="text" value="" placeholder="SP" maxlength="2" /></label>
        <label>Plano desejado
          <select name="plan">
            ${["Starter", "Growth", "Scale", "Enterprise AI"].map((plan) => `<option value="${plan}" ${plan === selectedPlan ? "selected" : ""}>${plan}</option>`).join("")}
          </select>
        </label>
      </div>
    `,
    [{ id: "confirm-register", label: "Criar conta" }],
  );
}

function openRecoverModal() {
  openModal(
    "Recuperar senha",
    `
      <div class="modal-form">
        <label>E-mail <input name="email" type="email" value="${getCurrentUser()?.email || "admin@nexora.demo"}" /></label>
      </div>
      <p class="modal-copy">Este fluxo demo não envia e-mail externo. Ele gera um código visual e mantém tudo local.</p>
    `,
    [{ id: "confirm-recover", label: "Gerar codigo" }],
  );
}

function openSwitchAccountModal() {
  openModal(
    "Trocar conta",
    `
      <div class="account-list">
        ${appState.users
          .map(
            (user) => `
              <button type="button" data-auth-action="switch-user" data-user-id="${user.id}">
                <strong>${user.nome}</strong>
                <small>${user.email} · ${appState.companies.find((company) => company.id === user.empresaId)?.nomeEmpresa || user.empresaId} · ${user.cargo}</small>
              </button>
            `,
          )
          .join("")}
      </div>
    `,
    [
      { id: "confirm-switch-account", label: "Login manual" },
      { id: "register", label: "Cadastro" },
    ],
  );
}

function openAccountSettingsModal() {
  const user = getCurrentUser();
  const company = getCurrentCompany();
  if (!user) {
    openLoginModal();
    return;
  }
  openModal(
    "Configuracoes da conta",
    `
      <div class="modal-form">
        <label>Nome do usuário <input name="name" type="text" value="${user.nome}" /></label>
        <label>Email <input name="email" type="email" value="${user.email}" /></label>
        <label>Senha <input name="password" type="password" value="${user.senha}" /></label>
        <label>Cargo <input name="role" type="text" value="${user.cargo}" ${user.cargo !== "Admin" ? "readonly" : ""} /></label>
        <label>Nome da empresa <input name="company" type="text" value="${company?.nomeEmpresa || ""}" /></label>
        <label>Telefone da empresa <input name="phone" type="text" value="${company?.telefone || ""}" /></label>
        <label>CNPJ <input name="cnpj" type="text" value="${company?.cnpj || ""}" /></label>
        <label>Cidade <input name="city" type="text" value="${company?.cidade || ""}" /></label>
        <label>Estado <input name="state" type="text" value="${company?.estado || ""}" /></label>
        <label>Plano atual
          <select name="plan">
            ${["Starter", "Growth", "Scale", "Enterprise AI"].map((plan) => `<option value="${plan}" ${plan === company?.plano ? "selected" : ""}>${plan}</option>`).join("")}
          </select>
        </label>
      </div>
      <p class="modal-copy">As permissões são aplicadas por cargo.</p>
    `,
    [
      { id: "save-account-settings", label: "Salvar" },
      ...(user.cargo === "Admin" ? [{ id: "add-demo-user", label: "Adicionar usuário" }] : []),
      { id: "switch-account", label: "Trocar conta" },
      { id: "logout", label: "Sair da conta" },
    ],
  );
}

function openAddDemoUserModal() {
  const company = getCurrentCompany();
  if (!requirePermission("admin", "Adicionar usuário")) return;
  openModal(
    "Adicionar usuário",
    `
      <div class="modal-form">
        <label>Nome <input name="name" type="text" value="" placeholder="Novo usuário" /></label>
        <label>E-mail <input name="email" type="email" value="" placeholder="usuario@empresa.com" /></label>
        <label>Senha <input name="password" type="password" value="demo123" /></label>
        <label>Cargo
          <select name="role">
            ${["Admin", "Vendedor", "Estoque", "Financeiro", "Cliente B2B"].map((role) => `<option value="${role}">${role}</option>`).join("")}
          </select>
        </label>
      </div>
      <p class="modal-copy">Empresa: ${company?.nomeEmpresa || "Empresa atual"}</p>
    `,
    [{ id: "confirm-add-demo-user", label: "Adicionar" }],
  );
}

function getModalField(name) {
  return document.querySelector(`.modal-card [name="${name}"]`)?.value.trim() || "";
}

function getCheckoutField(name) {
  return document.querySelector(`.modal-card [name="${name}"]`)?.value || dashboardContent.querySelector(`.checkout-page [name="${name}"]`)?.value || "";
}

function getCheckboxField(name) {
  return Boolean(document.querySelector(`.modal-card [name="${name}"]`)?.checked);
}

function loginUser(email, password) {
  if (!email) {
    showToast("Informe o e-mail.");
    return false;
  }
  if (!password) {
    showToast("Informe a senha.");
    return false;
  }
  const exists = appState.users.find((item) => item.email.toLowerCase() === email.toLowerCase());
  if (!exists) {
    showToast("E-mail não encontrado.");
    return false;
  }
  const user = appState.users.find((item) => item.email.toLowerCase() === email.toLowerCase() && item.senha === password);
  if (!user) {
    showToast("Senha incorreta.");
    return false;
  }
  showToast("Entrando...");
  appState.session = { userId: user.id };
  syncActiveOrder();
  persistSession();
  updateAuthUI();
  updateDashboardOrderWidgets();
  closeModal();
  openInternalApp();
  showToast("Login realizado com sucesso.");
  return true;
}

function registerUser() {
  const name = getModalField("name") || "Nova Conta";
  const email = getModalField("email") || `nova-${Date.now()}@nexora.demo`;
  const password = getModalField("password") || "demo123";
  const confirmPassword = getModalField("confirmPassword");
  const companyName = getModalField("company") || "Nova Commerce";
  const cnpj = getModalField("cnpj");
  const telefone = getModalField("phone");
  const segmento = getModalField("segment");
  const cidade = getModalField("city");
  const estado = getModalField("state").toUpperCase();
  const plano = document.querySelector('.modal-card [name="plan"]')?.value || "Growth";

  if (!name.trim()) return showToast("Nome obrigatório.");
  if (!email.trim()) return showToast("E-mail obrigatório.");
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return showToast("Informe um e-mail válido.");
  if (!password) return showToast("Senha obrigatória.");
  if (password.length < 6) return showToast("Senha deve ter pelo menos 6 caracteres.");
  if (password !== confirmPassword) return showToast("Confirmação de senha diferente.");
  if (!companyName.trim()) return showToast("Nome da empresa obrigatório.");

  if (appState.users.some((user) => user.email.toLowerCase() === email.toLowerCase())) {
    showToast("E-mail já cadastrado.");
    return;
  }

  showToast("Criando conta...");
  const companyId = `${companyName.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "")}-${Date.now().toString().slice(-4)}`;
  const company = {
    id: companyId,
    nomeEmpresa: companyName,
    cnpj,
    telefone,
    email,
    segmento,
    cidade,
    estado,
    plano,
    statusConta: "Ativa",
    tipoConta: "real",
  };

  const user = {
    id: `u-${Date.now()}`,
    nome: name,
    email,
    senha: password,
    cargo: "Admin",
    empresaId: companyId,
    plano,
    criadoEm: formatNow(),
  };
  appState.companies.push(company);
  appState.users.push(user);
  seedCompanyData(company);
  appState.session = { userId: user.id };
  syncActiveOrder();
  persistSession();
  updateAuthUI();
  updateDashboardOrderWidgets();
  closeModal();
  openInternalApp("home");
  showToast("Conta criada com sucesso.");
}

function logoutUser() {
  const user = getCurrentUser();
  appState.session = null;
  appState.activeOrderId = null;
  appState.activeComplaintId = null;
  appState.orderStatus = "Pendente";
  persistSession();
  updateAuthUI();
  updateDashboardOrderWidgets();
  closeModal();
  renderPublicSite();
  showToast("Você saiu da conta.");
}

function confirmLogout() {
  openModal(
    "Sair da conta",
    `<p class="modal-copy">Deseja encerrar a sessão atual Usuários, empresas e pedidos continuarão salvos neste navegador.</p>`,
    [
      { id: "confirm-logout", label: "Sair" },
      { id: "public-home", label: "Cancelar" },
    ],
  );
}

function confirmSwitchAccount() {
  openModal(
    "Trocar conta",
    `<p class="modal-copy">Você será levado para o login para entrar com outra conta.</p>`,
    [
      { id: "confirm-switch-account", label: "Trocar" },
      { id: "public-home", label: "Cancelar" },
    ],
  );
}

function switchUser(userId) {
  const user = appState.users.find((item) => item.id === userId);
  if (!user) return;
  appState.session = { userId: user.id };
  syncActiveOrder();
  persistSession();
  updateAuthUI();
  updateDashboardOrderWidgets();
  closeModal();
  openQuickPanel("Conta trocada", [
    [user.nome, user.email],
    [getCurrentCompany()?.nomeEmpresa || "Empresa", "Dados da empresa carregados"],
    [user.cargo, "Permissões aplicadas"],
  ]);
}

function recoverPasswordDemo() {
  const email = getModalField("email") || getCurrentUser()?.email || "admin@nexora.demo";
  const user = appState.users.find((item) => item.email.toLowerCase() === email.toLowerCase());
  if (!user) {
    showToast("E-mail não encontrado.");
    return;
  }
  closeModal();
  openQuickPanel("Recuperação de senha", [
    [email, "Conta solicitada"],
    ["Código visual gerado em modo demo.", "Sem envio externo"],
    [user.nome, "Usuário encontrado"],
  ]);
}

function saveAccountSettings() {
  const user = getCurrentUser();
  const company = getCurrentCompany();
  if (!user) return;
  user.nome = getModalField("name") || user.nome;
  user.email = getModalField("email") || user.email;
  user.senha = getModalField("password") || user.senha;
  if (company) {
    company.nomeEmpresa = getModalField("company") || company.nomeEmpresa;
    company.telefone = getModalField("phone") || company.telefone;
    company.cnpj = getModalField("cnpj") || company.cnpj;
    company.cidade = getModalField("city") || company.cidade;
    company.estado = getModalField("state") || company.estado;
    company.plano = document.querySelector('.modal-card [name="plan"]')?.value || company.plano;
    user.plano = company.plano;
  }
  persistSession();
  updateAuthUI();
  closeModal();
  openQuickPanel("Conta atualizada", [
    [user.nome, user.email],
    [company?.nomeEmpresa || "Empresa", "Empresa ativa"],
    [user.cargo, "Cargo mantido"],
  ]);
}

async function addProductFromModal() {
  const data = getCompanyData();
  data.products ||= [];
  const name = getModalField("productName");
  const sku = normalizeProductSku(getModalField("sku"));
  const price = parseMoney(getModalField("price"));
  const stock = Number(getModalField("stock"));
  const source = getModalField("productSource") || "Cadastro manual";
  const rawSourceUrl = getModalField("productSourceUrl");
  const sourceUrl = normalizeProductSourceUrl(rawSourceUrl);
  if (!name) {
    showToast("Informe o nome do produto.");
    return;
  }
  if (!sku) {
    showToast("Informe um SKU único para o produto.");
    return;
  }
  if (data.products.some((product) => getProductSku(product).toLowerCase() === sku.toLowerCase())) {
    showToast("Já existe um produto com esse SKU.");
    return;
  }
  if (!Number.isFinite(price) || price <= 0) {
    showToast("Informe um preço maior que zero.");
    return;
  }
  if (!Number.isFinite(stock) || stock < 0) {
    showToast("Informe um estoque válido.");
    return;
  }
  if (rawSourceUrl && !sourceUrl) {
    showToast("Informe um link de origem válido.");
    return;
  }
  const media = await getProductMediaFromModal();
  const product = { sku, name, price, stock, media, source, sourceUrl, status: "Ativo", createdAt: formatNow() };
  data.products.push(product);
  try {
    persistCompanyData();
  } catch {
    data.products = data.products.filter((item) => item !== product);
    try {
      persistCompanyData();
    } catch {
      // Se o navegador estiver sem espaço, mantemos o feedback visual e evitamos travar a demo.
    }
    showToast("Arquivos muito grandes para salvar nesta demo local. Tente mídias menores.");
    return;
  }
  closeModal();
  showToast(media.length ? `Produto cadastrado com ${getProductMediaSummary(product).toLowerCase()}.` : "Produto cadastrado com sucesso.");
  syncProductToSupabase(product);
  if (dashboardContent.dataset.currentView === "products") setView("products", { push: false });
  if (dashboardContent.dataset.currentView === "home") refreshHomeIfVisible();
  openCatalogPanel();
}

function openProductDetailModal(sku = appState.pendingProductSku) {
  const product = findProductBySku(sku);
  if (!product) {
    showToast("Produto não encontrado.");
    return;
  }
  appState.pendingProductSku = getProductSku(product);
  const media = getProductMedia(product);
  const sourceUrl = getProductSourceUrl(product);
  const mediaMarkup = media.length
    ? `
      <div class="product-detail-gallery">
        ${media
          .map((item) => {
            const caption = `${item.name || "Mídia do produto"} · ${formatFileSize(item.size)}`;
            if (isProductImageMedia(item) && item.dataUrl) {
              return `<figure><img src="${escapeHtml(item.dataUrl)}" alt="${escapeHtml(item.name || getProductName(product))}" loading="lazy" /><figcaption>${escapeHtml(caption)}</figcaption></figure>`;
            }
            if (isProductVideoMedia(item) && item.dataUrl) {
              return `<figure><video controls preload="metadata" src="${escapeHtml(item.dataUrl)}"></video><figcaption>${escapeHtml(caption)}</figcaption></figure>`;
            }
            return `<figure><span class="product-media-thumb product-media-video">MID</span><figcaption>${escapeHtml(caption)}</figcaption></figure>`;
          })
          .join("")}
      </div>
    `
    : `<p class="modal-copy">Este produto ainda não tem fotos ou vídeos. Edite o cadastro no próximo ciclo para anexar mídia de fornecedor.</p>`;

  openModal(
    getProductName(product),
    `
      <div class="modal-grid product-detail-grid">
        <div><strong>SKU</strong><small>${escapeHtml(getProductSku(product))}</small></div>
        <div><strong>Preço</strong><small>${formatCurrency(getProductPrice(product))}</small></div>
        <div><strong>Estoque</strong><small>${getProductStock(product)} unidade(s)</small></div>
        <div><strong>Mídias</strong><small>${escapeHtml(getProductMediaSummary(product))}</small></div>
        <div><strong>Origem</strong><small>${escapeHtml(getProductOrigin(product))}</small></div>
        <div><strong>Link</strong><small>${sourceUrl ? `<a class="modal-link" href="${escapeHtml(sourceUrl)}" target="_blank" rel="noreferrer">${escapeHtml(sourceUrl)}</a>` : "Sem link salvo"}</small></div>
      </div>
      ${mediaMarkup}
    `,
    [{ id: "delete-product", label: "Excluir produto" }],
  );
}

function openDeleteProductModal(sku = appState.pendingProductSku) {
  const product = findProductBySku(sku);
  if (!product) {
    showToast("Produto não encontrado.");
    if (dashboardContent.dataset.currentView === "products") setView("products", { push: false });
    return;
  }
  appState.pendingProductSku = getProductSku(product);
  const cartQty = getCartSkuQuantity(appState.pendingProductSku);
  openModal(
    "Excluir produto",
    `
      <p class="modal-copy">Tem certeza que deseja excluir ${escapeHtml(getProductName(product))} do catálogo da empresa?</p>
      <div class="modal-grid">
        <div><strong>SKU</strong><small>${escapeHtml(getProductSku(product))}</small></div>
        <div><strong>Estoque atual</strong><small>${getProductStock(product)} unidade(s)</small></div>
        <div><strong>Preço</strong><small>${formatCurrency(getProductPrice(product))}</small></div>
        <div><strong>Carrinho</strong><small>${cartQty ? `${cartQty} unidade(s) serão removidas` : "Sem item no carrinho"}</small></div>
      </div>
      <p class="modal-copy">Pedidos antigos continuam salvos para histórico. O produto sai do catálogo, do carrinho e do checkout aberto.</p>
    `,
    [
      { id: "confirm-delete-product", label: "Excluir produto" },
      { id: "cancel-delete-product", label: "Cancelar" },
    ],
  );
}

function deleteProduct(sku = appState.pendingProductSku) {
  const cleanSku = String(sku || "").trim().toLowerCase();
  if (!cleanSku) {
    showToast("Selecione um produto para excluir.");
    return;
  }
  const data = getCompanyData();
  data.products ||= [];
  data.cart ||= [];
  const product = data.products.find((item) => getProductSku(item).toLowerCase() === cleanSku);
  if (!product) {
    closeModal();
    showToast("Produto já foi removido.");
    if (dashboardContent.dataset.currentView === "products") setView("products", { push: false });
    return;
  }
  const productName = getProductName(product);
  data.products = data.products.filter((item) => getProductSku(item).toLowerCase() !== cleanSku);
  const previousCartLength = data.cart.length;
  data.cart = data.cart.filter((item) => String(item.sku || "").trim().toLowerCase() !== cleanSku);
  persistCompanyData();
  deleteProductFromSupabase(appState.pendingProductSku);
  updateCartCount();
  closeModal();
  const currentView = dashboardContent.dataset.currentView;
  if (views[currentView]) setView(currentView, { push: false });
  if (previousCartLength !== data.cart.length) {
    showToast(`${productName} excluído e removido do carrinho.`);
  } else {
    showToast(`${productName} excluído do catálogo.`);
  }
}

function parseAuthorizedProducts(rawProducts) {
  return String(rawProducts || "")
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean)
    .filter((line) => !/^nome\s*[;,|\t]\s*sku/i.test(line))
    .map((line, index) => {
      const separator = line.includes(";") ? ";" : line.includes("|") ? "|" : line.includes("\t") ? "\t" : ",";
      const parts = line.split(separator).map((part) => part.trim());
      const name = parts[0] || "";
      if (!name) return null;
      const sku =
        parts[1] ||
        `${name
          .toLowerCase()
          .normalize("NFD")
          .replace(/[\u0300-\u036f]/g, "")
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/^-|-$/g, "")
          .slice(0, 16)
          .toUpperCase()}-${String(index + 1).padStart(3, "0")}`;
      return {
        name,
        sku,
        price: parseMoney(parts[2]),
        stock: Number(parts[3]) || 0,
        status: "Ativo",
        importedAt: formatNow(),
        source: "Importação autorizada",
      };
    })
    .filter(Boolean);
}

function upsertAuthorizedProducts(products) {
  const data = getCompanyData();
  data.products ||= [];
  let created = 0;
  let updated = 0;
  for (const product of products) {
    const existing = data.products.find((item) => getProductSku(item).toLowerCase() === product.sku.toLowerCase());
    if (existing) {
      existing.name = product.name;
      existing.price = product.price;
      existing.stock = product.stock;
      existing.status = product.status;
      existing.importedAt = product.importedAt;
      existing.source = product.source;
      updated += 1;
    } else {
      data.products.push(product);
      created += 1;
    }
  }
  persistCompanyData();
  syncProductsToSupabase(products);
  return { created, updated };
}

function openCompanyProductsModal() {
  const user = getCurrentUser();
  const company = getCurrentCompany();
  if (!user || !company) {
    openLoginModal();
    return;
  }
  openModal(
    "Empresa e produtos B2B",
    `
      <div class="modal-form">
        <label>Nome da empresa <input name="company" type="text" value="${escapeHtml(company.nomeEmpresa || "")}" placeholder="Distribuidora Aurora" /></label>
        <label>CNPJ <input name="cnpj" type="text" value="${escapeHtml(company.cnpj || "")}" placeholder="00.000.000/0001-00" /></label>
        <label>E-mail comercial <input name="companyEmail" type="email" value="${escapeHtml(company.email || user.email || "")}" placeholder="comercial@empresa.com" /></label>
        <label>Telefone <input name="phone" type="text" value="${escapeHtml(company.telefone || "")}" placeholder="(11) 99999-0000" /></label>
        <label>Segmento <input name="segment" type="text" value="${escapeHtml(company.segmento || "")}" placeholder="Alimentos, bebidas, indústria..." /></label>
        <label>Cidade <input name="city" type="text" value="${escapeHtml(company.cidade || "")}" placeholder="São Paulo" /></label>
        <label>Estado <input name="state" type="text" value="${escapeHtml(company.estado || "")}" placeholder="SP" maxlength="2" /></label>
        <label class="modal-check">
          <input name="productsAuthorization" type="checkbox" ${company.productsAuthorization?.authorized ? "checked" : ""} />
          <span>Autorizo a Nexora demo a carregar e exibir os produtos informados pela minha empresa nesta página B2B local.</span>
        </label>
        <label>Produtos autorizados
          <textarea name="productsBulk" placeholder="Nome;SKU;Preço;Estoque&#10;Café Premium;CAF-001;19.90;120&#10;Açúcar Cristal;ACU-010;6.50;240"></textarea>
        </label>
      </div>
      <p class="modal-copy">Nesta versão local, os produtos precisam ser informados pela empresa ou importados por texto autorizado. Integração automática com ERP, planilha online ou marketplace exige backend/API real no futuro.</p>
    `,
    [{ id: "save-company-products-profile", label: "Salvar e importar" }],
  );
}

function saveCompanyProductsProfile() {
  const user = getCurrentUser();
  const company = getCurrentCompany();
  if (!user || !company) return;
  const authorized = getCheckboxField("productsAuthorization");
  const rawProducts = getModalField("productsBulk");

  company.nomeEmpresa = getModalField("company") || company.nomeEmpresa;
  company.cnpj = getModalField("cnpj") || company.cnpj;
  company.email = getModalField("companyEmail") || company.email || user.email;
  company.telefone = getModalField("phone") || company.telefone;
  company.segmento = getModalField("segment") || company.segmento;
  company.cidade = getModalField("city") || company.cidade;
  company.estado = (getModalField("state") || company.estado || "").toUpperCase();
  company.productsAuthorization = {
    authorized,
    authorizedAt: authorized ? formatNow() : "",
    authorizedBy: user.nome,
    scope: "Produtos informados pela empresa para exibição no portal B2B local.",
  };

  if (rawProducts && !authorized) {
    showToast("Marque a autorização antes de importar produtos.");
    return;
  }

  const parsedProducts = authorized ? parseAuthorizedProducts(rawProducts) : [];
  const result = parsedProducts.length ? upsertAuthorizedProducts(parsedProducts) : { created: 0, updated: 0 };
  persistSession();
  updateAuthUI();
  closeModal();
  setView("products", { push: false });
  showToast(parsedProducts.length ? `${result.created} produto(s) importado(s), ${result.updated} atualizado(s).` : "Informações da empresa salvas.");
}

function addClientFromModal() {
  const data = getCompanyData();
  data.clients ||= [];
  const name = getModalField("clientName") || "Novo cliente";
  const detail = getModalField("clientDetail") || "Conta B2B";
  const status = document.querySelector('.modal-card [name="clientStatus"]')?.value || "Ativo";
  data.clients.push({ name, detail, status, createdAt: formatNow() });
  persistCompanyData();
  closeModal();
  showToast("Cliente cadastrado com sucesso.");
  if (dashboardContent.dataset.currentView === "home") refreshHomeIfVisible();
  openFeaturePanel("clients");
}

function loadDemoDataForCurrentCompany() {
  const company = getCurrentCompany();
  if (!company) return;
  appState.companyData[company.id] = createDemoCompanyData(company);
  persistCompanyData(company.id);
  syncActiveOrder();
  updateCartCount();
  updateDashboardOrderWidgets();
  closeModal();
  if (dashboardContent.dataset.currentView === "home") refreshHomeIfVisible();
  showToast("Dados demo carregados com sucesso.");
}

function clearCurrentCompanyData() {
  const company = getCurrentCompany();
  if (!company) return;
  appState.companyData[company.id] = createEmptyCompanyData(company);
  persistCompanyData(company.id);
  appState.activeOrderId = null;
  appState.orderStatus = "Pendente";
  updateCartCount();
  updateDashboardOrderWidgets();
  closeModal();
  if (dashboardContent.dataset.currentView === "home") refreshHomeIfVisible();
  showToast("Dados da empresa limpos com sucesso.");
}

function openQuickPanel(title, rows, actions = []) {
  closeQuickPanel();
  const panel = document.createElement("aside");
  panel.className = "quick-panel";
  panel.setAttribute("aria-label", title);
  const actionMarkup = actions.length
    ? `<div class="quick-panel-actions">${actions
        .map((action) => `<button class="mini-action" type="button" data-action="${action.id}">${action.label}</button>`)
        .join("")}</div>`
    : "";
  panel.innerHTML = `
    <div class="card-head">
      <h2>${title}</h2>
      <button class="icon-button" type="button" data-panel-close aria-label="Close panel">
        <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
      </button>
    </div>
    <div class="quick-panel-list">
      ${rows.map(([primary, secondary]) => `<div><strong>${primary}</strong><small>${secondary}</small></div>`).join("")}
    </div>
    ${actionMarkup}
  `;
  dashboard.append(panel);
  panel.animate(
    [
      { opacity: 0, transform: "translateX(18px)" },
      { opacity: 1, transform: "translateX(0)" },
    ],
    { duration: 220, easing: "ease-out" },
  );
}

function closeQuickPanel() {
  document.querySelector(".quick-panel")?.remove();
}

function escapeHtml(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function normalizeAssistantText(value) {
  return String(value ?? "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function cssToken(value) {
  return normalizeAssistantText(value).replace(/\s+/g, "-") || "default";
}

function includesAnyNormalized(text, keywords) {
  return keywords.some((keyword) => {
    const normalizedKeyword = normalizeAssistantText(keyword);
    return normalizedKeyword && text.includes(normalizedKeyword);
  });
}

function detectComplaintIntent(message) {
  const normalized = normalizeAssistantText(message);
  if (!normalized) return null;

  const complaintKeywords = [
    "problema",
    "erro",
    "bug",
    "reclamação",
    "reclamar",
    "atrasou",
    "atraso",
    "atrasado",
    "não chegou",
    "nao chegou",
    "veio errado",
    "produto errado",
    "faltou",
    "faltando",
    "defeito",
    "quebrado",
    "danificado",
    "preço errado",
    "preco errado",
    "preço incorreto",
    "preco incorreto",
    "desconto não entrou",
    "desconto nao entrou",
    "desconto não aplicado",
    "desconto nao aplicado",
    "frete errado",
    "pedido não aparece",
    "pedido nao aparece",
    "conta pendente",
    "login não funciona",
    "login nao funciona",
    "cnpj inválido",
    "cnpj invalido",
    "produto sem estoque",
    "erro no checkout",
    "erro no carrinho",
    "relatório não exporta",
    "relatorio nao exporta",
    "campanha não funciona",
    "campanha nao funciona",
    "ia comercial não respondeu",
    "ia comercial nao respondeu",
    "problema com plano",
    "cobrança errada",
    "cobranca errada",
    "pagamento não caiu",
    "pagamento nao caiu",
    "pagamento não identificado",
    "pagamento nao identificado",
    "não consigo",
    "nao consigo",
    "não funciona",
    "nao funciona",
    "travando",
    "sumiu",
    "pedido sumiu",
    "status não muda",
    "status nao muda",
    "status não atualiza",
    "status nao atualiza",
    "cobraram errado",
    "não exporta",
    "nao exporta",
    "não respondeu",
    "nao respondeu",
    "quero cancelar",
    "insatisfeito",
    "ruim",
    "péssimo",
    "pessimo",
    "suporte não responde",
    "suporte nao responde",
    "vendedor não respondeu",
    "vendedor nao respondeu",
  ];
  const irritatedKeywords = ["absurdo", "ridículo", "ridiculo", "péssimo", "pessimo", "horrível", "horrivel", "estou bravo", "palhaçada", "palhacada", "não aguento", "nao aguento", "que lixo"];
  const directComplaintKeywords = complaintKeywords.filter((keyword) => !["problema", "erro", "bug", "reclamação", "reclamar"].includes(keyword));
  const isHowToOnly = normalized.startsWith("como ") && !includesAnyNormalized(normalized, directComplaintKeywords) && !includesAnyNormalized(normalized, irritatedKeywords);
  if (isHowToOnly) return null;

  const detected = includesAnyNormalized(normalized, complaintKeywords) || includesAnyNormalized(normalized, irritatedKeywords);
  return detected ? { detected: true, irritated: includesAnyNormalized(normalized, irritatedKeywords), normalized } : null;
}

function classifyComplaint(message) {
  const normalized = normalizeAssistantText(message);
  let categoria = "Outro";

  if (includesAnyNormalized(normalized, ["atraso", "atrasou", "atrasado", "não chegou", "nao chegou", "entrega", "frete"])) {
    categoria = "Entrega";
  } else if (includesAnyNormalized(normalized, ["produto errado", "veio errado", "faltou", "faltando", "defeito", "danificado", "quebrado", "sem estoque", "estoque"])) {
    categoria = "Produto";
  } else if (includesAnyNormalized(normalized, ["pagamento", "cobrança", "cobranca", "valor", "preço", "preco", "desconto"])) {
    categoria = "Pagamento";
  } else if (includesAnyNormalized(normalized, ["login", "conta", "senha", "cnpj", "cadastro"])) {
    categoria = "Conta";
  } else if (includesAnyNormalized(normalized, ["plano", "assinatura", "cancelar", "cancelamento"])) {
    categoria = "Plano";
  } else if (includesAnyNormalized(normalized, ["suporte", "vendedor", "ninguém respondeu", "ninguem respondeu", "sem retorno"])) {
    categoria = "Suporte";
  } else if (includesAnyNormalized(normalized, ["pedido", "status", "checkout", "carrinho"])) {
    categoria = "Pedido";
  } else if (includesAnyNormalized(normalized, ["bug", "erro", "travando", "não funciona", "nao funciona", "sistema"])) {
    categoria = "Sistema";
  }

  let prioridade = "Baixa";
  if (includesAnyNormalized(normalized, ["cobrança errada", "cobranca errada", "cobraram errado", "pagamento não identificado", "pagamento nao identificado", "pagamento não caiu", "pagamento nao caiu", "pedido grande", "quero cancelar", "cancelar", "travando totalmente"])) {
    prioridade = "Crítica";
  } else if (includesAnyNormalized(normalized, ["atraso", "atrasou", "atrasado", "produto errado", "veio errado", "status não muda", "status nao muda", "status não atualiza", "status nao atualiza", "checkout com erro", "erro no checkout", "não consigo finalizar", "nao consigo finalizar"])) {
    prioridade = "Alta";
  } else if (includesAnyNormalized(normalized, ["desconto", "frete", "cadastro", "cnpj", "cnpj inválido", "cnpj invalido"])) {
    prioridade = "Média";
  }

  return { categoria, prioridade };
}

function getComplaintOwner(categoria) {
  const owners = {
    Pedido: "Operações B2B",
    Entrega: "Logística demo",
    Produto: "Qualidade e estoque",
    Pagamento: "Financeiro demo",
    Conta: "Administração de contas",
    Sistema: "Suporte técnico demo",
    Plano: "Customer Success demo",
    Suporte: "Coordenação comercial",
    Outro: "Atendimento Nexora",
  };
  return owners[categoria] || owners.Outro;
}

function extractRelatedOrder(message) {
  const match = String(message).match(/(?:#?\b(?:B2B|ORD|NX)-?\d{3,}\b|#\d{3,})/i);
  return match ? match[0].replace(/^#/, "") : "";
}

function getComplaintBaseResponse(message, classification, detection) {
  const normalized = normalizeAssistantText(message);
  if (detection?.irritated) {
    return "Eu entendo sua frustração e sinto muito pelo transtorno. Vou registrar isso com prioridade para que não se perca no atendimento. Me envie, por favor, o número do pedido ou a tela onde o problema aconteceu.";
  }
  if (includesAnyNormalized(normalized, ["pedido atrasado", "meu pedido atrasou", "atraso", "atrasou", "não chegou", "nao chegou"])) {
    return "Entendi. Vou registrar essa ocorrência como atraso de pedido. Me envie o número do pedido para verificarmos o status e o histórico.";
  }
  if (includesAnyNormalized(normalized, ["produto errado", "veio errado", "produto diferente", "item errado"])) {
    return "Entendi. Vou registrar como divergência de produto. Para avançar, preciso do número do pedido e qual produto chegou diferente do solicitado.";
  }
  if (includesAnyNormalized(normalized, ["produto faltando", "item faltante", "faltou", "faltando"])) {
    return "Certo. Vou registrar como item faltante. Me informe o número do pedido e qual item não chegou.";
  }
  if (includesAnyNormalized(normalized, ["produto com defeito", "defeito", "quebrado", "danificado"])) {
    return "Sinto muito pelo problema. Vou registrar como produto com defeito/danificado. Informe o número do pedido, produto afetado e uma breve descrição do defeito.";
  }
  if (includesAnyNormalized(normalized, ["preço incorreto", "preco incorreto", "preço errado", "preco errado", "valor errado"])) {
    return "Entendi. Vou registrar como divergência de preço. Me envie o produto, preço esperado e preço que apareceu no sistema.";
  }
  if (includesAnyNormalized(normalized, ["desconto não aplicado", "desconto nao aplicado", "desconto não entrou", "desconto nao entrou", "desconto errado"])) {
    return "Certo. Vou registrar como problema de desconto. Me diga o valor do pedido e qual regra de desconto deveria ter sido aplicada.";
  }
  if (includesAnyNormalized(normalized, ["frete errado", "frete incorreto"])) {
    return "Entendi. Vou registrar como divergência de frete. Me informe o valor exibido, cidade/estado de entrega e total do pedido.";
  }
  if (includesAnyNormalized(normalized, ["pagamento não identificado", "pagamento nao identificado", "pagamento não caiu", "pagamento nao caiu"])) {
    return "Entendi. Vou registrar como prioridade alta. Me envie o método de pagamento, valor, data e comprovante demo, se houver.";
  }
  if (includesAnyNormalized(normalized, ["status não atualiza", "status nao atualiza", "status não muda", "status nao muda"])) {
    return "Certo. Vou registrar como problema no status do pedido. Me envie o número do pedido para análise.";
  }
  if (includesAnyNormalized(normalized, ["login não funciona", "login nao funciona", "não consigo acessar", "nao consigo acessar"])) {
    return "Entendi. Vou registrar como problema de acesso. Confirme o e-mail da conta e se aparece alguma mensagem de erro.";
  }
  if (includesAnyNormalized(normalized, ["cnpj inválido", "cnpj invalido", "cnpj não aceita", "cnpj nao aceita"])) {
    return "Entendi. O sistema valida o CNPJ pelos dígitos verificadores. Confira se foram digitados os 14 números corretos. Se o problema continuar, esta ocorrência já fica registrada para análise.";
  }
  if (includesAnyNormalized(normalized, ["sistema travando", "travando", "não funciona", "nao funciona", "bug"])) {
    return "Entendi. Vou registrar como instabilidade do sistema. Informe em qual tela aconteceu e o que você estava tentando fazer.";
  }
  if (includesAnyNormalized(normalized, ["quero cancelar", "cancelar assinatura", "cancelamento"])) {
    return "Entendi. Vou registrar uma solicitação de cancelamento. Antes de seguir, informe o motivo principal para que a equipe possa avaliar e tentar ajudar.";
  }
  return "Entendi que você teve um problema. Vou registrar a reclamação e preciso de alguns detalhes para encaminhar corretamente: qual tela ou pedido está relacionado e o que aconteceu?";
}

function getComplaintFollowUpPrompt(message, classification) {
  const normalized = normalizeAssistantText(message);
  const hasOrder = Boolean(extractRelatedOrder(message));
  if (["Pedido", "Entrega", "Produto", "Pagamento"].includes(classification.categoria) && !hasOrder) {
    return "Você pode me enviar o número do pedido Exemplo: #B2B-1234.";
  }
  if (classification.categoria === "Sistema") {
    return "Em qual tela isso aconteceu Dashboard, Catálogo, Carrinho, Checkout, Pedidos, Clientes, Admin ou Configurações?";
  }
  if (classification.categoria === "Conta" && !includesAnyNormalized(normalized, ["@", "email", "e-mail", "cnpj"])) {
    return "Confirme também o e-mail da conta ou o CNPJ relacionado, se puder.";
  }
  if (classification.categoria === "Plano") {
    return "Informe o plano exibido, o plano esperado e se a solicitação é ajuste, upgrade, downgrade ou cancelamento.";
  }
  return "Se puder, envie também urgência, telefone/e-mail e qualquer detalhe que ajude a equipe a analisar mais rápido.";
}

function getCompanyComplaints(empresaId = getCurrentUser()?.empresaId) {
  const data = getCompanyData(empresaId);
  data.complaints ||= [];
  return data.complaints;
}

function nextComplaintProtocol(complaints) {
  const next = complaints.reduce((max, complaint) => {
    const number = Number(String(complaint.protocolo || "").match(/(\d+)$/)?.[1] || 0);
    return Math.max(max, number);
  }, 0) + 1;
  return `NX-SUP-${String(next).padStart(4, "0")}`;
}

function registerComplaint(message, classification, respostaInicial) {
  const user = getCurrentUser();
  const company = getCurrentCompany();
  if (!user) return null;
  const complaints = getCompanyComplaints(user.empresaId);
  const now = formatNow();
  const complaint = {
    id: `cmp-${Date.now()}`,
    protocolo: nextComplaintProtocol(complaints),
    empresaId: user.empresaId,
    usuarioId: user.id,
    categoria: classification.categoria,
    mensagemOriginal: message,
    status: "Aberta",
    prioridade: classification.prioridade,
    dataCriacao: now,
    ultimaAtualizacao: now,
    pedidoRelacionado: extractRelatedOrder(message),
    clienteRelacionado: company?.nomeEmpresa || "",
    historico: [
      {
        status: "Aberta",
        data: now,
        usuario: user.nome,
        nota: "Ocorrência registrada pelo Nexora Assistant.",
      },
    ],
    respostaInicial,
    responsavelDemo: getComplaintOwner(classification.categoria),
  };
  if (["Alta", "Crítica"].includes(classification.prioridade)) {
    complaint.historico.push({
      status: "Em análise",
      data: now,
      usuario: "Nexora Assistant",
      nota: "Prioridade alta/crítica sinalizada para atendimento humano/admin demo.",
    });
  }
  complaints.push(complaint);
  persistCompanyData(user.empresaId);
  return complaint;
}

function buildComplaintReply(message) {
  const detection = detectComplaintIntent(message);
  if (!detection) return null;
  const classification = classifyComplaint(message);
  const respostaInicial = getComplaintBaseResponse(message, classification, detection);
  const complaint = registerComplaint(message, classification, respostaInicial);
  if (!complaint) {
    return {
      id: "complaint-login-required",
      categoria: "Suporte",
      resposta: "Posso registrar a reclamação, mas preciso que você esteja logado para vincular o protocolo à empresa correta.",
      sugestoes: ["Login", "Cadastro", "Como falar com suporte?"],
    };
  }
  const followUp = getComplaintFollowUpPrompt(message, classification);
  const escalation = ["Alta", "Crítica"].includes(complaint.prioridade) ? " Como a prioridade é elevada, deixei a ocorrência sinalizada para atendimento humano/admin demo." : "";
  return {
    id: `complaint-${complaint.protocolo}`,
    categoria: "Reclamação registrada",
    resposta: `${respostaInicial}\n\nRegistrei sua reclamação com o protocolo ${complaint.protocolo}. A categoria é ${complaint.categoria} e a prioridade é ${complaint.prioridade}. Você pode acompanhar em Suporte > Reclamações.${escalation}\n\n${followUp}`,
    sugestoes: ["Ver reclamações", "Como encontrar meu pedido?", "Como falar com suporte?", "Como enviar comprovante demo?"],
    tipo: "complaint",
    complaint: {
      id: complaint.id,
      protocolo: complaint.protocolo,
      categoria: complaint.categoria,
      prioridade: complaint.prioridade,
      status: complaint.status,
    },
  };
}

function getAssistantStorageKey() {
  const empresaId = getCurrentUser()?.empresaId || getCurrentCompany()?.id || "public";
  return `nexora_assistant_${empresaId}`;
}

function readAssistantHistory() {
  const history = readStored(getAssistantStorageKey(), []);
  return Array.isArray(history) ? history : [];
}

function saveAssistantHistory(history) {
  writeStored(getAssistantStorageKey(), history.slice(-80));
}

function ensureAssistantWidget() {
  let widget = document.querySelector(".assistant-widget");
  if (widget) return widget;

  widget = document.createElement("aside");
  widget.className = "assistant-widget";
  widget.setAttribute("aria-label", "Nexora Assistant");
  widget.hidden = true;
  widget.innerHTML = `
    <div class="assistant-head">
      <div>
        <span class="assistant-orb" aria-hidden="true"></span>
        <div>
          <h2>Nexora Assistant</h2>
          <p>Ajuda inteligente para seu portal B2B</p>
        </div>
      </div>
      <button class="icon-button" type="button" data-assistant-close aria-label="Fechar Nexora Assistant">
        <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
      </button>
    </div>
    <div class="assistant-messages" role="log" aria-live="polite" aria-label="Mensagens do Nexora Assistant"></div>
    <div class="assistant-quick" aria-label="Perguntas rápidas">
      ${assistantQuickQuestions.map((question) => `<button type="button" data-assistant-quick="${escapeHtml(question)}">${escapeHtml(question)}</button>`).join("")}
    </div>
    <div class="assistant-composer">
      <input class="assistant-input" type="text" autocomplete="off" placeholder="Pergunte sobre pedidos, checkout, planos..." aria-label="Mensagem para o Nexora Assistant" />
      <button class="assistant-send" type="button" data-assistant-send>Enviar</button>
    </div>
    <button class="assistant-clear" type="button" data-assistant-clear>Limpar conversa</button>
  `;
  dashboard.append(widget);
  return widget;
}

function isAssistantOpen() {
  const widget = document.querySelector(".assistant-widget");
  return Boolean(widget && !widget.hidden);
}

function openAssistant() {
  if (!getCurrentUser()) {
    showToast("Entre na sua conta para usar o Nexora Assistant.");
    openLoginModal();
    return;
  }
  const widget = ensureAssistantWidget();
  closeQuickPanel();
  closeProfileDropdown();
  widget.hidden = false;
  widget.classList.add("is-open");
  renderAssistantMessages();
  setTimeout(() => widget.querySelector(".assistant-input")?.focus(), 40);
}

function closeAssistant() {
  const widget = document.querySelector(".assistant-widget");
  if (!widget) return;
  widget.classList.remove("is-open");
  widget.hidden = true;
  if (assistantTypingTimer) {
    clearTimeout(assistantTypingTimer);
    assistantTypingTimer = null;
  }
}

function toggleAssistant() {
  if (isAssistantOpen()) {
    closeAssistant();
    return;
  }
  openAssistant();
}

function renderAssistantMessage(message) {
  const role = message.role === "user" ? "user" : "assistant";
  const suggestions = role === "assistant" && Array.isArray(message.suggestions) ? message.suggestions : [];
  const category = message.categoria || message.category || "Nexora";
  const complaint = message.complaint;
  const suggestionMarkup = suggestions.length
    ? `<div class="assistant-suggestions">${suggestions
        .map((suggestion) => `<button type="button" data-assistant-suggestion="${escapeHtml(suggestion)}">${escapeHtml(suggestion)}</button>`)
        .join("")}</div>`
    : "";
  const complaintMarkup =
    role === "assistant" && complaint
      ? `
        <div class="assistant-complaint-card">
          <strong>Reclamação registrada</strong>
          <b>${escapeHtml(complaint.protocolo)}</b>
          <small>${escapeHtml(complaint.categoria)} · ${escapeHtml(complaint.prioridade)} · ${escapeHtml(complaint.status)}</small>
        </div>
      `
      : "";

  return `
    <div class="assistant-row ${role}${complaint ? " complaint" : ""}">
      <div class="assistant-bubble">
        ${role === "assistant" ? `<span>${escapeHtml(category)}</span>` : ""}
        <p>${escapeHtml(message.text).replace(/\n/g, "<br>")}</p>
        ${complaintMarkup}
        ${suggestionMarkup}
      </div>
    </div>
  `;
}

function renderAssistantMessages(options = {}) {
  const widget = ensureAssistantWidget();
  const target = widget.querySelector(".assistant-messages");
  if (!target) return;
  const intro = {
    role: "assistant",
    categoria: "Ajuda",
    text: "Olá, eu sou o Nexora Assistant. Posso explicar fluxos do portal, abrir áreas como catálogo e pedidos, e orientar checkout, status, planos e permissões.",
    suggestions: ["O que posso perguntar?", "Abrir catálogo", "Abrir pedidos"],
  };
  const history = readAssistantHistory();
  const messages = history.length ? history : [intro];
  target.innerHTML = `
    ${messages.map(renderAssistantMessage).join("")}
    ${
      options.typing
        ? `<div class="assistant-row assistant"><div class="assistant-bubble assistant-typing" aria-label="Nexora Assistant digitando"><i></i><i></i><i></i></div></div>`
        : ""
    }
  `;
  requestAnimationFrame(() => {
    target.scrollTop = target.scrollHeight;
  });
}

function findAssistantIntent(question) {
  const normalizedQuestion = normalizeAssistantText(question);
  const questionTokens = normalizedQuestion.split(" ").filter((token) => token.length > 2);
  let bestIntent = null;
  let bestScore = 0;

  for (const intent of assistantKnowledge) {
    let score = 0;
    for (const keyword of intent.keywords) {
      const normalizedKeyword = normalizeAssistantText(keyword);
      if (!normalizedKeyword) continue;
      if (normalizedQuestion.includes(normalizedKeyword)) {
        score += 7 + Math.min(normalizedKeyword.split(" ").length, 5);
        continue;
      }
      const keywordTokens = normalizedKeyword.split(" ").filter((token) => token.length > 3);
      if (!keywordTokens.length) continue;
      const matches = keywordTokens.filter((token) => questionTokens.includes(token)).length;
      if (matches) score += matches / keywordTokens.length;
    }
    if (normalizeAssistantText(intent.categoria) && normalizedQuestion.includes(normalizeAssistantText(intent.categoria))) {
      score += 0.5;
    }
    if (score > bestScore) {
      bestScore = score;
      bestIntent = intent;
    }
  }

  return bestScore >= 1.2 ? bestIntent : null;
}

function buildAssistantReply(question) {
  const complaintReply = buildComplaintReply(question);
  if (complaintReply) return complaintReply;

  const intent = findAssistantIntent(question);
  if (intent) return intent;

  return {
    id: "fallback",
    categoria: "Ajuda",
    resposta: "Não encontrei uma resposta exata, mas posso ajudar com navegação, pedidos, checkout, catálogo, clientes, planos, permissões e relatórios. Tente uma das sugestões abaixo.",
    sugestoes: ["Abrir catálogo", "Abrir pedidos", "Como finalizar um pedido?", "Como exportar relatório?"],
  };
}

function runAssistantAction(action) {
  const actionMap = {
    home: () => setView("home"),
    checkout: () => handleAction("checkout"),
    products: () => handleAction("products"),
    catalog: () => handleAction("catalog"),
    orders: () => handleAction("orders"),
    admin: () => handleAction("admin"),
    settings: () => handleAction("settings"),
    support: () => {
      handleAction("support");
      closeAssistant();
    },
  };
  if (!actionMap[action]) return;
  actionMap[action]();
}

function sendAssistantMessage(rawMessage) {
  const text = String(rawMessage ?? "").trim();
  if (!text) return;
  const widget = ensureAssistantWidget();
  const input = widget.querySelector(".assistant-input");
  if (input) input.value = "";
  if (assistantTypingTimer) clearTimeout(assistantTypingTimer);

  const history = readAssistantHistory();
  history.push({ role: "user", text, at: Date.now() });
  saveAssistantHistory(history);
  renderAssistantMessages({ typing: true });

  assistantTypingTimer = setTimeout(() => {
    const reply = buildAssistantReply(text);
    const nextHistory = readAssistantHistory();
    nextHistory.push({
      role: "assistant",
      text: reply.resposta,
      categoria: reply.categoria,
      suggestions: reply.sugestoes || [],
      tipo: reply.tipo,
      complaint: reply.complaint,
      at: Date.now(),
    });
    saveAssistantHistory(nextHistory);
    assistantTypingTimer = null;
    renderAssistantMessages();
    if (reply.acao) {
      setTimeout(() => runAssistantAction(reply.acao), 120);
    }
  }, 520);
}

function clearAssistantConversation() {
  localStorage.removeItem(getAssistantStorageKey());
  renderAssistantMessages();
  showToast("Conversa do Nexora Assistant limpa.");
}

function openModal(title, body, actions = []) {
  closeModal();
  const modal = document.createElement("div");
  modal.className = "modal-backdrop";
  modal.innerHTML = `
    <section class="modal-card" role="dialog" aria-modal="true" aria-label="${title}">
      <div class="card-head">
        <h2>${title}</h2>
        <button class="icon-button" type="button" data-modal-close aria-label="Close modal">
          <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
        </button>
      </div>
      <div class="modal-body">${body}</div>
      <div class="modal-actions">
        ${actions.map((action) => `<button class="mini-action" type="button" data-action="${action.id}">${action.label}</button>`).join("")}
      </div>
    </section>
  `;
  document.body.append(modal);
  modal.querySelector(".modal-card").animate(
    [
      { opacity: 0, transform: "translateY(12px) scale(.98)" },
      { opacity: 1, transform: "translateY(0) scale(1)" },
    ],
    { duration: 220, easing: "ease-out" },
  );
}

function closeModal() {
  document.querySelector(".modal-backdrop")?.remove();
}

function updateCartCount() {
  const cart = getCompanyData().cart || [];
  appState.cartCount = cart.length;
  document.querySelectorAll(".cart-count").forEach((item) => {
    item.textContent = String(appState.cartCount);
    item.classList.toggle("active", appState.cartCount > 0);
  });
}

function getCartSubtotal(cart = getCheckoutItems()) {
  return cart.reduce((total, item) => total + (Number(item.qty) || 1) * (Number(item.price) || 0), 0);
}

function findProductBySku(sku, products = getCompanyData().products || []) {
  const cleanSku = String(sku || "").trim().toLowerCase();
  if (!cleanSku) return null;
  return products.find((product) => getProductSku(product).toLowerCase() === cleanSku) || null;
}

function setProductStock(product, stock) {
  const nextStock = Math.max(0, Number(stock) || 0);
  if (Array.isArray(product)) {
    product[3] = nextStock;
    return;
  }
  if (Object.prototype.hasOwnProperty.call(product, "estoque") && !Object.prototype.hasOwnProperty.call(product, "stock")) {
    product.estoque = nextStock;
    return;
  }
  product.stock = nextStock;
}

function getCartSkuQuantity(sku, cart = getCompanyData().cart || []) {
  const cleanSku = String(sku || "").trim().toLowerCase();
  if (!cleanSku) return 0;
  return cart.reduce((total, item) => {
    return String(item.sku || "").trim().toLowerCase() === cleanSku ? total + (Number(item.qty) || 1) : total;
  }, 0);
}

function getCheckoutStockIssue(items, products = getCompanyData().products || []) {
  const totals = new Map();
  items.forEach((item) => {
    const sku = String(item.sku || "").trim();
    if (!sku) return;
    const cleanSku = sku.toLowerCase();
    const current = totals.get(cleanSku) || { sku, qty: 0, item };
    current.qty += Number(item.qty) || 1;
    totals.set(cleanSku, current);
  });

  for (const entry of totals.values()) {
    const product = findProductBySku(entry.sku, products);
    if (!product) continue;
    const available = getProductStock(product);
    if (entry.qty > available) {
      return { ...entry, product, available };
    }
  }
  return null;
}

function applyCheckoutStock(items, data = getCompanyData()) {
  data.products ||= [];
  const impact = new Map();
  const totals = new Map();
  items.forEach((item) => {
    const sku = String(item.sku || "").trim();
    if (!sku) return;
    const cleanSku = sku.toLowerCase();
    totals.set(cleanSku, (totals.get(cleanSku) || 0) + (Number(item.qty) || 1));
  });

  totals.forEach((qty, cleanSku) => {
    const product = data.products.find((item) => getProductSku(item).toLowerCase() === cleanSku);
    if (!product) return;
    const before = getProductStock(product);
    const after = Math.max(0, before - qty);
    setProductStock(product, after);
    impact.set(cleanSku, { before, after, qty });
  });

  return items.map((item) => {
    const cleanSku = String(item.sku || "").trim().toLowerCase();
    const itemImpact = impact.get(cleanSku);
    return itemImpact ? { ...item, stockBefore: itemImpact.before, stockAfter: itemImpact.after, stockControlled: true } : { ...item, stockControlled: false };
  });
}

function getLiveReportRows(data = getCompanyData()) {
  const metrics = calculateCompanyMetrics();
  const totalStock = (data.products || []).reduce((total, product) => total + getProductStock(product), 0);
  const stockValue = (data.products || []).reduce((total, product) => total + getProductPrice(product) * getProductStock(product), 0);
  const cartSubtotal = getCartSubtotal(data.cart || []);
  return [
    [formatCurrency(metrics.faturamentoTotal), "Receita aprovada"],
    [String(metrics.pedidosRecebidos), "Pedidos recebidos"],
    [String(metrics.pedidosPendentes), "Pedidos pendentes"],
    [String(metrics.pedidosAprovados), "Pedidos aprovados"],
    [formatCurrency(metrics.ticketMedio), "Ticket médio"],
    [String(metrics.produtosCadastrados), "Produtos cadastrados"],
    [String(totalStock), "Estoque disponível"],
    [String(metrics.produtosEstoqueBaixo), "Produtos com estoque baixo"],
    [formatCurrency(stockValue), "Valor em estoque"],
    [formatCurrency(cartSubtotal), "Subtotal no carrinho"],
  ];
}

function createOrder(source = "manual", options = {}) {
  const user = getCurrentUser();
  const company = getCurrentCompany();
  if (!user) {
    openLoginModal();
    return null;
  }
  const data = getCompanyData();
  const cart = source === "checkout" ? getCheckoutItems() : data.cart || [];
  const stockIssue = source === "checkout" ? getCheckoutStockIssue(cart, data.products || []) : null;
  if (stockIssue) {
    showToast(`Estoque insuficiente para ${getProductName(stockIssue.product)}. Disponível: ${stockIssue.available}.`);
    return null;
  }
  const orderItems = source === "checkout" ? applyCheckoutStock(cart, data) : [];
  const itemCount = Math.max(cart.reduce((total, item) => total + (Number(item.qty) || 1), 0), appState.cartCount || 0, 1);
  const subtotal = source === "checkout" ? getCartSubtotal(cart) : CHECKOUT_ITEM_PRICE;
  const total = source === "checkout" ? subtotal + Math.round(subtotal * 0.03) : subtotal;
  const companyOrders = getCompanyOrders(user.empresaId);
  const formaPagamento = options.formaPagamento || "Faturado";
  const statusInicial = options.statusInicial || (["Pix", "Cartão"].includes(formaPagamento) ? "Aprovado" : "Pendente");
  const order = {
    id: `ORD-${Date.now().toString().slice(-6)}`,
    empresaId: user.empresaId,
    empresaCompradora: company?.nomeEmpresa || "Empresa",
    item: source === "checkout" ? `${itemCount} item${itemCount === 1 ? "" : "s"} do checkout B2B` : "Nexora Core Suite",
    value: formatCurrency(total),
    amount: total,
    items: orderItems,
    formaPagamento,
    status: statusInicial,
    createdBy: user.id,
    historicoStatus: [{ status: statusInicial, data: formatNow(), usuario: user.nome }],
  };
  companyOrders.push(order);
  appState.activeOrderId = order.id;
  appState.orderStatus = order.status;
  persistCompanyData(user.empresaId);
  updateDashboardOrderWidgets();
  return order;
}

function setOrderStatus(order, status, mode = "manual") {
  const user = getCurrentUser();
  if (!order || !user) return;
  if (order.status === status) {
    showToast(`Status já está em ${status}.`);
    return;
  }
  order.status = status;
  order.historicoStatus ||= [];
  order.historicoStatus.push({ status, data: formatNow(), usuario: user.nome, modo: mode });
  appState.activeOrderId = order.id;
  appState.orderStatus = status;
  persistCompanyData(user.empresaId);
  updateDashboardOrderWidgets();
  refreshHomeIfVisible();
  showToast("Status atualizado com sucesso.");
}

function openOrderStatusPanel(order = getActiveOrder()) {
  if (!order) {
    openQuickPanel("Status do pedido", [["Sem pedido", "Crie um pedido ou finalize checkout primeiro"]], [
      { id: "create-order", label: "Novo pedido" },
      { id: "checkout", label: "Checkout" },
    ]);
    return;
  }
  openQuickPanel("Status do pedido", [
    [order.id, order.item],
    [order.status, "Status atual"],
    [String((order.historicoStatus || []).length), "Eventos no histórico"],
  ], [
    { id: "change-status", label: "Avançar status" },
    { id: "manual-status", label: "Selecionar" },
    { id: "status-history", label: "Histórico" },
  ]);
}

function openManualStatusModal() {
  const order = getActiveOrder();
  if (!order) {
    openOrderStatusPanel(order);
    return;
  }
  openModal(
    "Selecionar status",
    `
      <div class="modal-form">
        <label>Status
          <select name="status" class="status-select">
            ${ALL_STATUSES.map((status) => `<option value="${status}" ${status === order.status ? "selected" : ""}>${status}</option>`).join("")}
          </select>
        </label>
      </div>
      <p class="modal-copy">${order.id} · ${order.item}</p>
    `,
    [{ id: "confirm-manual-status", label: "Salvar status" }],
  );
}

function openStatusHistoryPanel(order = getActiveOrder()) {
  if (!order) {
    openOrderStatusPanel(order);
    return;
  }
  openQuickPanel(
    "Histórico de status",
    (order.historicoStatus || []).map((entry) => [entry.status, `${entry.data} · ${entry.usuario}${entry.modo ? ` · ${entry.modo}` : ""}`]),
    [
      { id: "change-status", label: "Avançar" },
      { id: "manual-status", label: "Selecionar" },
    ],
  );
}

function getComplaintById(id = appState.activeComplaintId) {
  if (!id) return null;
  return getCompanyComplaints().find((complaint) => complaint.id === id) || null;
}

function refreshSupportIfVisible() {
  if (dashboardContent.dataset.currentView === "support") {
    setView("support", { push: false });
  }
}

function updateComplaintRecord(complaint, status, note, mode = "manual") {
  const user = getCurrentUser();
  if (!complaint || !user) return false;
  const now = formatNow();
  const nextStatus = COMPLAINT_STATUSES.includes(status) ? status : complaint.status;
  const changedStatus = complaint.status !== nextStatus;
  const cleanNote = String(note || "").trim();
  if (!changedStatus && !cleanNote) return false;

  complaint.status = nextStatus;
  complaint.ultimaAtualizacao = now;
  complaint.historico ||= [];
  complaint.historico.push({
    status: nextStatus,
    data: now,
    usuario: user.nome,
    modo: mode,
    nota: cleanNote || (changedStatus ? `Status alterado para ${nextStatus}.` : "Observação interna registrada."),
  });
  persistCompanyData(user.empresaId);
  return true;
}

function openComplaintDetailsModal(id = appState.activeComplaintId) {
  const complaint = getComplaintById(id);
  if (!complaint) {
    showToast("Reclamação não encontrada.");
    refreshSupportIfVisible();
    return;
  }
  appState.activeComplaintId = complaint.id;
  const user = appState.users.find((item) => item.id === complaint.usuarioId);
  const historyMarkup = (complaint.historico || [])
    .map(
      (entry) => `
        <li>
          <strong>${escapeHtml(entry.status)}</strong>
          <span>${escapeHtml(entry.data)} · ${escapeHtml(entry.usuario || "Nexora")}${entry.modo ? ` · ${escapeHtml(entry.modo)}` : ""}</span>
          <small>${escapeHtml(entry.nota || "Evento registrado.")}</small>
        </li>
      `,
    )
    .join("");

  openModal(
    `Reclamação ${complaint.protocolo}`,
    `
      <div class="modal-grid complaint-detail-grid">
        <div><strong>Protocolo</strong><small>${escapeHtml(complaint.protocolo)}</small></div>
        <div><strong>Categoria</strong><small>${escapeHtml(complaint.categoria)}</small></div>
        <div><strong>Prioridade</strong><small>${escapeHtml(complaint.prioridade)}</small></div>
        <div><strong>Status</strong><small>${escapeHtml(complaint.status)}</small></div>
        <div><strong>Usuário</strong><small>${escapeHtml(user?.nome || complaint.usuarioId || "Usuário")}</small></div>
        <div><strong>Responsável demo</strong><small>${escapeHtml(complaint.responsavelDemo)}</small></div>
        <div><strong>Pedido</strong><small>${escapeHtml(complaint.pedidoRelacionado || "Não informado")}</small></div>
        <div><strong>Data</strong><small>${escapeHtml(complaint.dataCriacao)}</small></div>
      </div>
      <div class="complaint-detail-block">
        <strong>Mensagem original</strong>
        <p>${escapeHtml(complaint.mensagemOriginal)}</p>
      </div>
      <div class="complaint-detail-block">
        <strong>Resposta inicial do assistente</strong>
        <p>${escapeHtml(complaint.respostaInicial)}</p>
      </div>
      <div class="modal-form modal-form-spaced">
        <label>Status
          <select name="complaintStatus" class="complaint-status-select">
            ${COMPLAINT_STATUSES.map((status) => `<option value="${status}" ${status === complaint.status ? "selected" : ""}>${status}</option>`).join("")}
          </select>
        </label>
        <label>Observação interna
          <textarea name="complaintNote" class="complaint-note" placeholder="Descreva a resposta interna, evidência ou próximo passo."></textarea>
        </label>
      </div>
      <div class="complaint-detail-block">
        <strong>Histórico</strong>
        <ul class="complaint-history">${historyMarkup || "<li><strong>Sem histórico</strong><span>Aguardando movimentação</span></li>"}</ul>
      </div>
    `,
    [
      { id: "save-complaint-note", label: "Salvar" },
      { id: "resolve-complaint", label: "Marcar resolvida" },
      { id: "complaints-export", label: "Exportar CSV" },
    ],
  );
}

function saveComplaintDetails() {
  const complaint = getComplaintById();
  if (!complaint) return showToast("Reclamação não encontrada.");
  const status = document.querySelector(".complaint-status-select")?.value || complaint.status;
  const note = document.querySelector(".complaint-note")?.value || "";
  const updated = updateComplaintRecord(complaint, status, note, "interno");
  if (!updated) {
    showToast("Nenhuma alteração para salvar.");
    return;
  }
  closeModal();
  refreshSupportIfVisible();
  showToast("Reclamação atualizada.");
}

function resolveComplaint(id = appState.activeComplaintId) {
  const complaint = getComplaintById(id);
  if (!complaint) return showToast("Reclamação não encontrada.");
  const note = document.querySelector(".complaint-note")?.value || "Ocorrência marcada como resolvida.";
  updateComplaintRecord(complaint, "Resolvida", note, "resolução");
  closeModal();
  refreshSupportIfVisible();
  showToast("Reclamação marcada como resolvida.");
}

function exportComplaintsCsv() {
  if (!requirePermission("export", "Exportar reclamações")) return;
  const complaints = getCompanyComplaints();
  const rows = [
    ["Protocolo", "Categoria", "Prioridade", "Status", "Data", "Pedido", "Cliente", "Responsável", "Mensagem"],
    ...(complaints.length
      ? complaints.map((complaint) => [
          complaint.protocolo,
          complaint.categoria,
          complaint.prioridade,
          complaint.status,
          complaint.dataCriacao,
          complaint.pedidoRelacionado || "",
          complaint.clienteRelacionado || "",
          complaint.responsavelDemo || "",
          complaint.mensagemOriginal || "",
        ])
      : [["Sem reclamações", "", "", "", formatNow(), "", getCurrentCompany()?.nomeEmpresa || "", "", ""]]),
  ];
  const csv = rows.map((row) => row.map((cell) => `"${String(cell).replaceAll('"', '""')}"`).join(",")).join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `nexora-complaints-${Date.now()}.csv`;
  document.body.append(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
  showToast("Reclamações exportadas em CSV.");
}

function exportProductsCsv() {
  if (!requirePermission("export", "Exportar produtos")) return;
  const products = getCompanyData().products || [];
  const rows = [
    ["Produto", "SKU", "Preço", "Estoque", "Mídias", "Status", "Origem", "Link de origem"],
    ...(products.length
      ? products.map((product) => [
          getProductName(product),
          getProductSku(product),
          formatCurrency(getProductPrice(product)),
          getProductStock(product),
          getProductMediaSummary(product),
          product.status || "Ativo",
          getProductOrigin(product),
          getProductSourceUrl(product),
        ])
      : [["Sem produtos", "", formatCurrency(0), 0, "Sem mídia", "", "", ""]]),
  ];
  const csv = rows.map((row) => row.map((cell) => `"${String(cell).replaceAll('"', '""')}"`).join(",")).join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `nexora-products-${Date.now()}.csv`;
  document.body.append(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
  showToast("Produtos exportados em CSV.");
}

function updateDashboardOrderWidgets() {
  syncActiveOrder();
  const user = getCurrentUser();
  const company = getCurrentCompany();
  const order = getActiveOrder();
  document.querySelectorAll(".status-pill small").forEach((item) => {
    item.textContent = company ? `Plano ${company.plano}` : "Sessão";
  });
  document.querySelectorAll(".status-pill strong").forEach((item) => {
    item.textContent = company ? `${company.nomeEmpresa} · ${order?.status || "Sem pedido"}` : "Login";
  });

  const orderCards = dashboardContent.querySelectorAll(".order-item");
  const companyOrders = getCompanyOrders();
  orderCards.forEach((card, index) => {
    const companyOrder = card.dataset.orderId ? companyOrders.find((order) => order.id === card.dataset.orderId) : companyOrders[index];
    if (!companyOrder) return;
    card.dataset.orderId = companyOrder.id;
    card.querySelector("strong").textContent = companyOrder.empresaCompradora;
    card.querySelector("small").textContent = `${companyOrder.id} · ${companyOrder.status}`;
    card.querySelector("em").textContent = companyOrder.value;
  });
}

function openActionCenter() {
  openQuickPanel(
    "Central de ações",
    featureActions.map((action) => [action.title, action.detail]),
    [
      { id: "catalog", label: "Catálogo" },
      { id: "products", label: "Produtos" },
      { id: "filters", label: "Filtros" },
      { id: "sorting", label: "Ordenar" },
      { id: "csv-export", label: "CSV" },
      { id: "create-order", label: "Novo pedido" },
      { id: "change-status", label: "Status" },
      { id: "manual-status", label: "Selecionar status" },
      { id: "clients", label: "Clientes" },
      { id: "campaigns", label: "Campanhas" },
      { id: "reports", label: "Relatórios" },
      { id: "admin", label: "Admin" },
      { id: "supabase-status", label: "Supabase" },
      { id: "support", label: "Suporte" },
      { id: "settings", label: "Config" },
      { id: "checkout", label: "Checkout" },
      { id: "load-demo-data", label: "Carregar demo" },
      { id: "clear-company-data", label: "Limpar dados" },
      { id: "ai-assistant", label: "IA" },
    ],
  );
}

function openCatalogPanel() {
  const products = getCompanyData().products || [];
  openQuickPanel(
    "Catálogo",
    products.length
      ? products.map((product) => [
          getProductName(product),
          `SKU ${getProductSku(product)} · estoque ${getProductStock(product)} · ${formatCurrency(getProductPrice(product))} · ${getProductMediaSummary(product)} · ${getProductOrigin(product)}`,
        ])
      : [["Nenhum produto cadastrado", "Adicione seu primeiro produto para começar"]],
    [
      { id: "products", label: "Página produtos" },
      { id: "add-product", label: "Novo produto" },
      { id: "add-to-cart", label: "Adicionar" },
      { id: "filters", label: "Filtrar" },
      { id: "sorting", label: "Ordenar" },
    ],
  );
}

function openCartPanel() {
  const user = getCurrentUser();
  const company = getCurrentCompany();
  const subtotal = getCartSubtotal();
  openQuickPanel(
    "Carrinho",
    [
      [`${appState.cartCount} item${appState.cartCount === 1 ? "" : "s"}`, "Carrinho local da empresa"],
      [formatCurrency(subtotal), "Subtotal estimado"],
      [company?.nomeEmpresa || "Sem login", "Empresa do checkout"],
    ],
    [
      { id: "catalog", label: "Catálogo" },
      { id: "add-to-cart", label: "Adicionar item" },
      { id: "checkout", label: "Checkout" },
    ],
  );
}

function openAddCartItemModal() {
  if (!getCurrentUser()) {
    openLoginModal();
    return;
  }
  const products = getCompanyData().products || [];
  const firstProduct = products[0];
  openModal(
    "Adicionar item ao checkout",
    `
      <div class="modal-form">
        <label>Produto cadastrado
          <select name="cartProductPreset" class="cart-product-select">
            <option value="" ${firstProduct ? "" : "selected"}>Item personalizado</option>
            ${products
              .map(
                (product) =>
                  `<option value="${escapeHtml(getProductSku(product))}" data-name="${escapeHtml(getProductName(product))}" data-price="${getProductPrice(product)}" data-stock="${getProductStock(product)}" ${product === firstProduct ? "selected" : ""}>${escapeHtml(getProductName(product))} · ${escapeHtml(getProductSku(product))}</option>`,
              )
              .join("")}
          </select>
        </label>
        <label>Nome do item <input name="cartItemName" type="text" value="${escapeHtml(firstProduct ? getProductName(firstProduct) : "")}" placeholder="Produto B2B" /></label>
        <label>SKU <input name="cartSku" type="text" value="${escapeHtml(firstProduct ? getProductSku(firstProduct) : "")}" placeholder="SKU-001" /></label>
        <label>Preço unitário <input name="cartPrice" type="number" min="0" step="0.01" value="${firstProduct ? getProductPrice(firstProduct) : ""}" placeholder="0.00" /></label>
        <label>Quantidade <input name="cartQty" type="number" min="1" step="1" value="1" /></label>
      </div>
      <p class="modal-copy">Use produto cadastrado ou informe manualmente item, SKU, preço e quantidade antes de colocar no pedido.</p>
    `,
    [{ id: "confirm-add-cart-item", label: "Adicionar item" }],
  );
}

function addCartItemFromModal() {
  if (!getCurrentUser()) {
    openLoginModal();
    return;
  }
  const data = getCompanyData();
  data.cart ||= [];
  const name = getModalField("cartItemName") || "Produto B2B";
  const sku = getModalField("cartSku") || `SKU-${Date.now().toString().slice(-5)}`;
  const price = Number(getModalField("cartPrice")) || 0;
  const qty = Math.max(1, Number(getModalField("cartQty")) || 1);
  if (price <= 0) {
    showToast("Informe um preço maior que zero.");
    return;
  }
  const product = findProductBySku(sku, data.products || []);
  if (product) {
    const requestedQty = getCartSkuQuantity(sku, data.cart) + qty;
    const available = getProductStock(product);
    if (requestedQty > available) {
      showToast(`Estoque disponível para ${getProductName(product)}: ${available}.`);
      return;
    }
  }
  data.cart.push({
    id: `cart-${Date.now()}-${data.cart.length}`,
    sku,
    item: name,
    price,
    qty,
    addedAt: formatNow(),
  });
  persistCompanyData();
  updateCartCount();
  closeModal();
  if (dashboardContent.dataset.currentView === "checkout") {
    setView("checkout", { push: false });
  } else {
    openCartPanel();
  }
  showToast("Item adicionado ao pedido.");
}

function removeCartItem(itemId) {
  const data = getCompanyData();
  data.cart ||= [];
  const previousLength = data.cart.length;
  data.cart = data.cart.filter((item, index) => (item.id || `${item.sku || "item"}-${index}`) !== itemId);
  if (data.cart.length === previousLength) {
    showToast("Item não encontrado no carrinho.");
    return;
  }
  persistCompanyData();
  updateCartCount();
  if (dashboardContent.dataset.currentView === "checkout") {
    setView("checkout", { push: false });
  } else {
    openCartPanel();
  }
  showToast("Item removido do pedido.");
}

function openCheckoutModal() {
  if (!requirePermission("checkout", "Checkout")) return;
  const user = getCurrentUser();
  const company = getCurrentCompany();
  openModal(
    "Checkout",
    `
      <div class="modal-grid">
        <div><strong>Cliente</strong><small>${company?.nomeEmpresa || "Sem login"}</small></div>
        <div><strong>Itens</strong><small>${appState.cartCount || 1} pacote premium</small></div>
        <div><strong>Entrega</strong><small>Esteira prioritária · 24h</small></div>
        <div><strong>Total</strong><small>${formatCurrency((appState.cartCount || 1) * CHECKOUT_ITEM_PRICE)}</small></div>
      </div>
      <div class="modal-form modal-form-spaced">
        <label>Forma de pagamento
          <select name="paymentMethod">
            <option value="Pix">Pix</option>
            <option value="Cartão">Cartão</option>
            <option value="Boleto">Boleto</option>
            <option value="Faturado" selected>Faturado</option>
          </select>
        </label>
        <label>Status inicial
          <select name="initialStatus">
            <option value="Pendente" selected>Pendente</option>
            <option value="Aprovado">Aprovado</option>
          </select>
        </label>
      </div>
    `,
    [
      { id: "confirm-checkout", label: "Confirmar" },
      { id: "cart", label: "Carrinho" },
    ],
  );
}

function openCreateOrderModal() {
  if (!requirePermission("createOrder", "Criação de pedido")) return;
  const user = getCurrentUser();
  const company = getCurrentCompany();
  openModal(
    "Criação de pedido",
    `
      <div class="modal-form">
        <label>Cliente <input name="client" type="text" value="${company?.nomeEmpresa || "Micora Commerce"}" /></label>
        <label>Produto <input type="text" value="Nexora Core Suite" /></label>
        <label>Prioridade <input type="text" value="Premium" /></label>
      </div>
    `,
    [{ id: "confirm-order", label: "Criar pedido" }],
  );
}

function openAddProductModal() {
  if (!requirePermission("catalog", "Novo produto")) return;
  openModal(
    "Novo produto",
    `
      <div class="modal-form">
        <label>Nome do produto <input name="productName" type="text" value="" placeholder="Nexora Core Suite" /></label>
        <label>SKU <input name="sku" type="text" value="" placeholder="NX-100" /></label>
        <label>Preço <input name="price" type="number" min="0" step="0.01" value="1284" /></label>
        <label>Estoque <input name="stock" type="number" min="0" step="1" value="0" /></label>
        <label>Origem / fornecedor <input name="productSource" type="text" value="" placeholder="Shopee, ERP, distribuidor, planilha..." /></label>
        <label>Link de origem <input name="productSourceUrl" type="url" value="" placeholder="https://fornecedor.com/produto" /></label>
        <label>Fotos e vídeos do produto
          <input name="productMedia" class="product-media-input" type="file" accept="${PRODUCT_MEDIA_ACCEPT}" multiple />
          <span class="media-upload-hint">Envie PNG, JPG, JPEG, WebP, GIF, MP4, WebM ou MOV baixados do fornecedor. A seleção aceita várias fotos e vídeos no mesmo produto, sem limite de quantidade.</span>
          <span class="product-media-selected" aria-live="polite">Nenhuma mídia selecionada.</span>
        </label>
      </div>
    `,
    [{ id: "confirm-add-product", label: "Cadastrar produto" }],
  );
}

function openAddClientModal() {
  if (!requirePermission("clients", "Novo cliente")) return;
  openModal(
    "Novo cliente",
    `
      <div class="modal-form">
        <label>Nome do cliente <input name="clientName" type="text" value="" placeholder="Distribuidora Aurora" /></label>
        <label>Detalhe <input name="clientDetail" type="text" value="" placeholder="Conta regional" /></label>
        <label>Status
          <select name="clientStatus">
            <option value="Ativo" selected>Ativo</option>
            <option value="Recorrente">Recorrente</option>
            <option value="Alto valor">Alto valor</option>
            <option value="Inativo">Inativo</option>
          </select>
        </label>
      </div>
    `,
    [{ id: "confirm-add-client", label: "Cadastrar cliente" }],
  );
}

function confirmLoadDemoData() {
  openModal(
    "Carregar dados demo",
    `<p class="modal-copy">Isso vai carregar produtos, clientes, pedidos, campanhas, relatórios e oportunidades fictícias somente para a empresa atual.</p>`,
    [
      { id: "confirm-load-demo-data", label: "Carregar dados demo" },
      { id: "public-home", label: "Cancelar" },
    ],
  );
}

function confirmClearCompanyData() {
  openModal(
    "Limpar dados da empresa",
    `<p class="modal-copy">Isso apaga produtos, pedidos, clientes, carrinho, campanhas, alertas, relatórios e oportunidades da empresa atual. Usuário e empresa serão mantidos.</p>`,
    [
      { id: "confirm-clear-company-data", label: "Limpar dados" },
      { id: "public-home", label: "Cancelar" },
    ],
  );
}

function openAiModal() {
  openModal(
    "IA simulada",
    `
      <p class="modal-copy">A recomendação local sugere priorizar Inventory Mesh Pro, acionar campanha para Enterprise Prime e revisar o risco de login burst antes do checkout.</p>
      <div class="ai-score"><span style="--signal: 88%">Confiança</span><span style="--signal: 73%">Impacto</span></div>
    `,
    [
      { id: "campaigns", label: "Campanhas" },
      { id: "change-status", label: "Atualizar status" },
    ],
  );
}

function applyFilters() {
  dashboardContent.dataset.filter = "premium";
  dashboardContent.querySelector(".demo-table-card, .orders-card")?.animate(
    [
      { outlineColor: "rgba(98, 229, 196, 0)" },
      { outlineColor: "rgba(98, 229, 196, .38)" },
      { outlineColor: "rgba(98, 229, 196, 0)" },
    ],
    { duration: 520, easing: "ease-out" },
  );
  showToast("Filtro premium aplicado.");
}

function sortCurrentTable() {
  const tbody = dashboardContent.querySelector(".demo-table tbody");
  if (!tbody) {
    showToast("Ordenacao aplicada ao ranking atual.");
    return;
  }
  [...tbody.querySelectorAll("tr")]
    .sort((left, right) => left.cells[0].textContent.localeCompare(right.cells[0].textContent))
    .forEach((row) => tbody.append(row));
  showToast("Tabela ordenada por nome.");
}

function changeStatus() {
  if (!requirePermission("changeStatus", "Avançar status")) return;
  const order = getActiveOrder();
  if (!order) {
    openOrderStatusPanel(order);
    return;
  }
  if (order.status === "Entregue" || order.status === "Cancelado") {
    showToast(`Pedido ${order.status.toLowerCase()} não pode avançar.`);
    return;
  }
  const current = STATUS_FLOW.indexOf(order.status);
  const nextStatus = STATUS_FLOW[Math.min(current + 1, STATUS_FLOW.length - 1)];
  setOrderStatus(order, nextStatus, "avanço");
  openOrderStatusPanel(order);
}

function exportCurrentCsv() {
  if (!requirePermission("export", "Exportação CSV")) return;
  const table = dashboardContent.querySelector(".demo-table");
  const quickPanel = document.querySelector(".quick-panel");
  const quickPanelRows = quickPanel
    ? [
        [quickPanel.querySelector("h2")?.textContent.trim() || "Painel", "Resumo"],
        ...[...quickPanel.querySelectorAll(".quick-panel-list > div")].map((row) => [row.querySelector("strong")?.textContent.trim() || "", row.querySelector("small")?.textContent.trim() || ""]),
      ]
    : null;
  const companyRows = getCompanyOrders().map((order) => [order.id, order.empresaCompradora, order.status, order.value]);
  const fallbackRows = [["Pedido", "Cliente", "Status", "Valor"], ...(companyRows.length ? companyRows : [["Sem pedidos", getCurrentCompany()?.nomeEmpresa || "Sem empresa", "Pendente", formatCurrency(0)]])];
  const rows = table
    ? [...table.querySelectorAll("tr")].map((row) => [...row.children].map((cell) => cell.textContent.trim()))
    : quickPanelRows || fallbackRows;
  const csv = rows.map((row) => row.map((cell) => `"${cell.replaceAll('"', '""')}"`).join(",")).join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `nexora-export-${++appState.csvExports}.csv`;
  document.body.append(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
  showToast("CSV exportado.");
}

function openFeaturePanel(action) {
  const data = getCompanyData();
  const reportRows = [...getLiveReportRows(data), ...((data.reports || []).length ? (data.reports || []).map((report) => [report.name || report[0], report.detail || report[1] || "Relatório manual"]) : [])];
  const panels = {
    clients: [
      "Clientes",
      (data.clients || []).length ? (data.clients || []).map((client) => [getClientName(client), `${getClientDetail(client)} · ${client.status || "Ativo"}`]) : [["Nenhum cliente cadastrado ainda", "Cadastre o primeiro cliente da empresa"]],
      [{ id: "add-client", label: "Novo cliente" }, { id: "seglots", label: "Abrir clientes" }],
    ],
    campaigns: ["Campanhas", (data.campaigns || []).length ? (data.campaigns || []).map((campaign) => [campaign.name || campaign[0], `${campaign.detail || campaign[1] || "Campanha"} · ${campaign.status || "Ativa"}`]) : [["Nenhuma campanha ativa", "Campanhas aparecerão aqui quando forem criadas"]], [{ id: "ai-assistant", label: "IA" }]],
    reports: ["Relatórios", reportRows, [{ id: "csv-export", label: "Exportar CSV" }]],
    admin: ["Admin demo", [["Acesso", "Enterprise Plus"], ["Dados da empresa", `${(data.orders || []).length} pedido(s) · ${(data.products || []).length} produto(s)`], ["Supabase", "Banco real configurado para produtos"], ["Permissões", "Operador premium ativo"]], [{ id: "supabase-status", label: "Supabase" }, { id: "load-demo-data", label: "Carregar demo" }, { id: "clear-company-data", label: "Limpar dados" }, { id: "settings", label: "Configurar" }]],
    settings: ["Configurações", [["Tema", "Dark neon"], ["Densidade", "Executiva"], ["Notificações", "Alta prioridade"]], [{ id: "admin", label: "Admin" }]],
  };
  const panel = panels[action];
  if (!panel) return;
  openQuickPanel(panel[0], panel[1], panel[2]);
}

async function openSupabaseStatusPanel() {
  const baseUrl = getSupabaseBaseUrl();
  const company = getCurrentCompany();
  openQuickPanel(
    "Supabase",
    [
      ["Projeto", baseUrl],
      ["Tabela de produtos", SUPABASE_CONFIG.productsTable],
      ["Empresa ativa", company?.nomeEmpresa || getSupabaseCompanyId()],
      ["Status", "Verificando conexão..."],
    ],
    [
      { id: "products", label: "Produtos" },
      { id: "products-export", label: "CSV" },
    ],
  );
  const result = await testSupabaseProductsTable();
  setSupabaseProductsReady(result.ok);
  if (result.ok) {
    syncProductsToSupabase(getCompanyData().products || [], { force: true });
  }
  openQuickPanel(
    "Supabase",
    [
      ["Projeto", baseUrl],
      ["Tabela de produtos", SUPABASE_CONFIG.productsTable],
      ["Empresa ativa", company?.nomeEmpresa || getSupabaseCompanyId()],
      [result.ok ? "Conectado" : "Aguardando schema", result.ok ? "Produtos já podem sincronizar." : "Rode o arquivo supabase-schema.sql no SQL Editor."],
      ["Fallback local", "localStorage continua ativo para a demo"],
    ],
    [
      { id: "products", label: "Produtos" },
      { id: "products-export", label: "CSV" },
    ],
  );
}

function showToast(message) {
  const target = document.querySelector(".public-site .toast-region") || toastRegion;
  if (!target) return;
  target.textContent = "";
  const toast = document.createElement("div");
  toast.className = "toast";
  toast.textContent = message;
  target.append(toast);
  setTimeout(() => toast.remove(), 2400);
}

function handleAction(action) {
  if (action === "public-home") {
    closeModal();
    if (!getCurrentUser()) renderPublicSite();
    return;
  }

  if (action === "view-plans") {
    document.querySelector("#public-plans")?.scrollIntoView({ behavior: "smooth", block: "start" });
    return;
  }

  if (action === "login") {
    openLoginModal();
    return;
  }

  if (action === "register") {
    openRegisterModal();
    return;
  }

  if (action === "recover-password") {
    openRecoverModal();
    return;
  }

  if (action === "switch-account") {
    openSwitchAccountModal();
    return;
  }

  if (action === "logout") {
    confirmLogout();
    return;
  }

  if (action === "account-settings") {
    openAccountSettingsModal();
    return;
  }

  if (action === "supabase-status") {
    openSupabaseStatusPanel();
    return;
  }

  if (action === "add-demo-user") {
    openAddDemoUserModal();
    return;
  }

  if (action === "add-product") {
    openAddProductModal();
    return;
  }

  if (action === "product-detail") {
    openProductDetailModal();
    return;
  }

  if (action === "delete-product") {
    openDeleteProductModal();
    return;
  }

  if (action === "confirm-delete-product") {
    deleteProduct();
    return;
  }

  if (action === "cancel-delete-product") {
    closeModal();
    return;
  }

  if (action === "company-products-setup") {
    openCompanyProductsModal();
    return;
  }

  if (action === "save-company-products-profile") {
    saveCompanyProductsProfile();
    return;
  }

  if (action === "add-client") {
    openAddClientModal();
    return;
  }

  if (action === "load-demo-data") {
    if (!requirePermission("admin", "Carregar dados demo")) return;
    confirmLoadDemoData();
    return;
  }

  if (action === "clear-company-data") {
    if (!requirePermission("admin", "Limpar dados da empresa")) return;
    confirmClearCompanyData();
    return;
  }

  if (views[action]) {
    setView(action);
    return;
  }

  if (action === "command-center") {
    openActionCenter();
    return;
  }

  if (action === "catalog") {
    if (!requirePermission("catalog", "Catálogo")) return;
    openCatalogPanel();
    return;
  }

  if (action === "cart") {
    if (!requirePermission("cart", "Carrinho")) return;
    openCartPanel();
    return;
  }

  if (action === "checkout") {
    setView("checkout");
    return;
  }

  if (action === "create-order") {
    openCreateOrderModal();
    return;
  }

  if (action === "ai-assistant") {
    if (!requirePermission("ai", "IA simulada")) return;
    openAiModal();
    return;
  }

  if (["clients", "campaigns", "reports", "admin", "settings"].includes(action)) {
    if (action === "admin" && !requirePermission("admin", "Admin")) return;
    if (action === "reports" && !requirePermission("reports", "Relatórios")) return;
    if (action === "clients" && !requirePermission("clients", "Clientes")) return;
    if (action === "campaigns" && !requirePermission("campaigns", "Campanhas")) return;
    if (action === "settings") {
      openAccountSettingsModal();
      return;
    }
    openFeaturePanel(action);
    return;
  }

  if (action === "filters") {
    applyFilters();
    return;
  }

  if (action === "sorting") {
    sortCurrentTable();
    return;
  }

  if (action === "change-status") {
    changeStatus();
    return;
  }

  if (action === "manual-status") {
    if (!requirePermission("manualStatus", "Selecionar status")) return;
    openManualStatusModal();
    return;
  }

  if (action === "view-created-order") {
    setView("home");
    openOrderStatusPanel(getActiveOrder());
    return;
  }

  if (action === "status-history") {
    openStatusHistoryPanel();
    return;
  }

  if (action === "csv-export") {
    exportCurrentCsv();
    return;
  }

  if (action === "products-export") {
    exportProductsCsv();
    return;
  }

  if (action === "complaints-export") {
    exportComplaintsCsv();
    return;
  }

  if (action === "complaint-detail") {
    openComplaintDetailsModal();
    return;
  }

  if (action === "save-complaint-note") {
    saveComplaintDetails();
    return;
  }

  if (action === "resolve-complaint" || action === "complaint-resolve") {
    resolveComplaint();
    return;
  }

  if (action === "add-to-cart") {
    openAddCartItemModal();
    return;
  }

  if (action === "confirm-add-cart-item") {
    addCartItemFromModal();
    return;
  }

  if (action === "remove-cart-item") {
    removeCartItem(appState.pendingCartItemId);
    return;
  }

  if (action === "confirm-order") {
    if (!requirePermission("createOrder", "Criação de pedido")) return;
    const order = createOrder("manual");
    if (!order) return;
    closeModal();
    openQuickPanel("Pedido criado", [[order.id, order.item], ["Status inicial", order.status], [order.empresaCompradora, "Empresa do pedido"]], [
      { id: "view-created-order", label: "Ver pedido" },
      { id: "change-status", label: "Avançar status" },
      { id: "manual-status", label: "Selecionar" },
      { id: "status-history", label: "Histórico" },
      { id: "csv-export", label: "Exportar CSV" },
    ]);
    return;
  }

  if (action === "confirm-checkout") {
    if (!requirePermission("checkout", "Checkout")) return;
    if (!(getCompanyData().cart || []).length) {
      showToast("Adicione um item ao carrinho antes de confirmar.");
      return;
    }
    const formaPagamento = getCheckoutField("paymentMethod") || "Faturado";
    const statusInicial = getCheckoutField("initialStatus") || (["Pix", "Cartão"].includes(formaPagamento) ? "Aprovado" : "Pendente");
    const order = createOrder("checkout", { formaPagamento, statusInicial });
    if (!order) return;
    const data = getCompanyData();
    data.cart = [];
    persistCompanyData();
    updateCartCount();
    closeModal();
    if (dashboardContent.dataset.currentView === "checkout") {
      setView("home");
    }
    showToast("Pedido criado pelo checkout.");
    openQuickPanel("Pedido criado pelo checkout", [[order.id, order.item], [order.empresaCompradora, "Empresa compradora"], [order.value, "Total"], [order.formaPagamento, "Forma de pagamento"], [order.status, "Status inicial"]], [
      { id: "view-created-order", label: "Ver pedido" },
      { id: "change-status", label: "Avançar status" },
      { id: "manual-status", label: "Selecionar" },
      { id: "status-history", label: "Histórico" },
    ]);
    return;
  }

  if (action === "confirm-login") {
    loginUser(getModalField("email"), getModalField("password"));
    return;
  }

  if (action === "confirm-logout") {
    logoutUser();
    return;
  }

  if (action === "confirm-switch-account") {
    appState.session = null;
    persistSession();
    closeModal();
    renderPublicSite();
    openLoginModal();
    showToast("Entre com outra conta.");
    return;
  }

  if (action === "confirm-register") {
    registerUser();
    return;
  }

  if (action === "confirm-recover") {
    recoverPasswordDemo();
    return;
  }

  if (action === "save-account-settings") {
    saveAccountSettings();
    return;
  }

  if (action === "confirm-add-demo-user") {
    const user = getCurrentUser();
    if (!user || !requirePermission("admin", "Adicionar usuário")) return;
    const name = getModalField("name") || "Novo usuário";
    const email = getModalField("email");
    const password = getModalField("password") || "demo123";
    const role = document.querySelector('.modal-card [name="role"]')?.value || "Vendedor";
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return showToast("Informe um e-mail válido.");
    if (appState.users.some((item) => item.email.toLowerCase() === email.toLowerCase())) return showToast("E-mail já cadastrado.");
    appState.users.push({
      id: `u-${Date.now()}`,
      nome: name,
      email,
      senha: password,
      cargo: role,
      empresaId: user.empresaId,
      plano: getCurrentCompany()?.plano || "Growth",
      criadoEm: formatNow(),
    });
    persistSession();
    closeModal();
    showToast("Usuário adicionado.");
    openAccountSettingsModal();
    return;
  }

  if (action === "confirm-add-product") {
    addProductFromModal().catch(() => showToast("Não consegui cadastrar o produto agora."));
    return;
  }

  if (action === "confirm-add-client") {
    addClientFromModal();
    return;
  }

  if (action === "confirm-load-demo-data") {
    loadDemoDataForCurrentCompany();
    return;
  }

  if (action === "confirm-clear-company-data") {
    clearCurrentCompanyData();
    return;
  }

  if (action === "confirm-manual-status") {
    if (!requirePermission("manualStatus", "Selecionar status")) return;
    const status = document.querySelector(".status-select")?.value || "Pendente";
    const order = getActiveOrder();
    setOrderStatus(order, status, "manual");
    closeModal();
    openStatusHistoryPanel(order);
    return;
  }

  if (action === "support") {
    openQuickPanel("Suporte operacional", [
      ["Atendimento ativo", "Canal interno pronto"],
      ["Resposta média", "4 minutos"],
      ["Escalonamento", "Fila de equipe conectada"],
    ]);
    return;
  }

  if (action === "notifications") {
    openQuickPanel("Notificações", [
      ["3 pedidos premium", "Precisam de roteamento"],
      ["Estoque sincronizado", "6 centros online"],
      ["Anomalia atribuída", "Segurança notificada"],
    ], [
      { id: "change-status", label: "Alterar status" },
      { id: "filters", label: "Filtrar" },
    ]);
    return;
  }

  if (action === "messages") {
    toggleAssistant();
    return;
  }

  if (action === "orders") {
    const orders = getCompanyOrders();
    openQuickPanel("Todos os pedidos", (orders.length ? orders : [{ id: "Sem pedido", status: "Crie um pedido", value: formatCurrency(0) }]).map((order) => [
      order.id,
      `${order.status} · ${order.value}`,
    ]), [
      { id: "create-order", label: "Novo pedido" },
      { id: "change-status", label: "Avançar status" },
      { id: "manual-status", label: "Selecionar" },
      { id: "csv-export", label: "Exportar CSV" },
    ]);
    return;
  }

  if (action === "sidebar-settings") {
    openFeaturePanel("settings");
    return;
  }

  if (action.endsWith("-refresh")) {
    showToast("Dados atualizados.");
    dashboardContent.querySelector(".demo-feature")?.animate(
      [
        { boxShadow: "0 0 0 rgba(98, 229, 196, 0)" },
        { boxShadow: "0 0 36px rgba(98, 229, 196, .18)" },
        { boxShadow: "0 0 0 rgba(98, 229, 196, 0)" },
      ],
      { duration: 520, easing: "ease-out" },
    );
    return;
  }

  if (action.endsWith("-export")) {
    exportCurrentCsv();
    return;
  }

  if (action.endsWith("-assign")) {
    showToast("Responsável atribuído à fila.");
  }
}

function handleSearch(event) {
  if (event.key !== "Enter") return;
  const query = event.target.value.trim();
  if (!query) {
    openActionCenter();
    return;
  }

  const normalized = query.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  const directMatch = featureActions.find((action) => {
    const haystack = `${action.id} ${action.title} ${action.detail}`.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
    return haystack.includes(normalized);
  });

  if (directMatch) {
    handleAction(directMatch.id);
    return;
  }

  const currentScreen = dashboardContent.querySelector("h1")?.textContent || "Nexora";
  openQuickPanel(
    "Resultados da busca",
    [
      [query, "Termo pesquisado"],
      [currentScreen, "Tela atual"],
      ["Sem correspondência exata", "Abra a central de ações para ver fluxos disponíveis"],
    ],
    [{ id: "command-center", label: "Central de ações" }],
  );
}

document.addEventListener("click", (event) => {
  const assistantClose = event.target.closest("[data-assistant-close]");
  if (assistantClose) {
    event.preventDefault();
    closeAssistant();
    return;
  }

  const assistantClear = event.target.closest("[data-assistant-clear]");
  if (assistantClear) {
    event.preventDefault();
    clearAssistantConversation();
    return;
  }

  const assistantSend = event.target.closest("[data-assistant-send]");
  if (assistantSend) {
    event.preventDefault();
    sendAssistantMessage(document.querySelector(".assistant-input")?.value || "");
    return;
  }

  const assistantQuick = event.target.closest("[data-assistant-quick]");
  if (assistantQuick) {
    event.preventDefault();
    sendAssistantMessage(assistantQuick.dataset.assistantQuick);
    return;
  }

  const assistantSuggestion = event.target.closest("[data-assistant-suggestion]");
  if (assistantSuggestion) {
    event.preventDefault();
    sendAssistantMessage(assistantSuggestion.dataset.assistantSuggestion);
    return;
  }

  const viewLink = event.target.closest("[data-view]");
  if (viewLink) {
    event.preventDefault();
    setView(viewLink.dataset.view);
    return;
  }

  const profileToggle = event.target.closest(".profile-button");
  if (profileToggle) {
    event.preventDefault();
    toggleProfileDropdown();
    return;
  }

  const profileAction = event.target.closest("[data-profile-action]");
  if (profileAction) {
    event.preventDefault();
    handleProfileAction(profileAction.dataset.profileAction);
    return;
  }

  const authAction = event.target.closest("[data-auth-action]");
  if (authAction) {
    event.preventDefault();
    if (authAction.dataset.authAction === "switch-user") {
      switchUser(authAction.dataset.userId);
    }
    return;
  }

  const panelClose = event.target.closest("[data-panel-close]");
  if (panelClose) {
    event.preventDefault();
    closeQuickPanel();
    return;
  }

  const modalClose = event.target.closest("[data-modal-close]");
  if (modalClose || event.target.classList.contains("modal-backdrop")) {
    event.preventDefault();
    closeModal();
    return;
  }

  const rangeButton = event.target.closest("[data-range]");
  if (rangeButton) {
    event.preventDefault();
    applyRange(rangeButton);
    return;
  }

  const demoTab = event.target.closest("[data-demo-tab]");
  if (demoTab) {
    event.preventDefault();
    setDemoMode(demoTab);
    return;
  }

  const tinyTab = event.target.closest(".tiny-tabs button");
  if (tinyTab) {
    event.preventDefault();
    toggleTinyTab(tinyTab);
    return;
  }

  const orderItem = event.target.closest(".order-item");
  if (orderItem) {
    event.preventDefault();
    selectOrder(orderItem);
    return;
  }

  const tableRow = event.target.closest(".demo-table tbody tr");
  if (tableRow && !event.target.closest("[data-action]")) {
    event.preventDefault();
    const cells = [...tableRow.cells].map((cell) => cell.textContent.trim());
    openQuickPanel("Detalhe da linha", [
      [cells[0] || "Registro", "Linha selecionada"],
      [cells[2] || appState.orderStatus, "Status atual"],
      [cells[3] || "Premium", "Valor operacional"],
    ], [
      { id: "change-status", label: "Alterar status" },
      { id: "csv-export", label: "Exportar CSV" },
    ]);
    return;
  }

  const action = event.target.closest("[data-action]");
  if (action) {
    event.preventDefault();
    if (action.dataset.plan) {
      appState.pendingPlan = action.dataset.plan;
    }
    if (action.dataset.complaintId) {
      appState.activeComplaintId = action.dataset.complaintId;
    }
    if (action.dataset.cartItemId) {
      appState.pendingCartItemId = action.dataset.cartItemId;
    }
    if (action.dataset.productSku) {
      appState.pendingProductSku = action.dataset.productSku;
    }
    handleAction(action.dataset.action);
    return;
  }

  const metricCard = event.target.closest(".metric-card");
  if (metricCard) {
    event.preventDefault();
    const title = metricCard.querySelector("p")?.textContent || "Métrica";
    const value = metricCard.querySelector(".metric-value")?.textContent.trim() || "Ativo";
    openQuickPanel("Detalhe da métrica", [[title, value], ["Tendência", "Sinal premium disponível"], ["Ação", "Use filtros ou relatórios para revisar melhor"]], [
      { id: "filters", label: "Filtrar" },
      { id: "reports", label: "Relatórios" },
    ]);
    return;
  }

  const surfaceCard = event.target.closest(".chart-card, .orders-card");
  if (surfaceCard) {
    event.preventDefault();
    const title = surfaceCard.querySelector("h2")?.textContent || "Painel";
    openQuickPanel(`Detalhe de ${title}`, [["Painel", "Superfície interativa"], ["Modo", "Prévia ativa"], ["Exportação", "CSV disponível quando houver tabela"]], [
      { id: "filters", label: "Filtrar" },
      { id: "csv-export", label: "Exportar CSV" },
    ]);
    return;
  }

  if (!event.target.closest(".profile-menu")) {
    closeProfileDropdown();
  }

  if (!event.target.closest(".quick-panel")) {
    closeQuickPanel();
  }
});

document.addEventListener("keydown", (event) => {
  const assistantInput = event.target.closest(".assistant-input");
  if (assistantInput && event.key === "Enter" && !event.shiftKey) {
    event.preventDefault();
    sendAssistantMessage(assistantInput.value);
    return;
  }

  if (event.key === "Escape") {
    closeProfileDropdown();
    closeQuickPanel();
    closeModal();
    closeAssistant();
  }
});

document.addEventListener("change", (event) => {
  const productMedia = event.target.closest('[name="productMedia"]');
  if (productMedia) {
    updateProductMediaSelection(productMedia);
  }

  const payment = event.target.closest('[name="paymentMethod"]');
  if (payment) {
    const scope = payment.closest(".modal-card, .checkout-page") || document;
    const statusSelect = scope.querySelector('[name="initialStatus"]');
    if (statusSelect) {
      statusSelect.value = ["Pix", "Cartão"].includes(payment.value) ? "Aprovado" : "Pendente";
    }
  }

  const cartProduct = event.target.closest(".cart-product-select");
  if (cartProduct) {
    const option = cartProduct.selectedOptions[0];
    const scope = cartProduct.closest(".modal-card") || document;
    if (!option || !cartProduct.value) return;
    const nameField = scope.querySelector('[name="cartItemName"]');
    const skuField = scope.querySelector('[name="cartSku"]');
    const priceField = scope.querySelector('[name="cartPrice"]');
    if (nameField) nameField.value = option.dataset.name || "";
    if (skuField) skuField.value = cartProduct.value || "";
    if (priceField) priceField.value = option.dataset.price || "";
  }
});

document.querySelector(".search input")?.addEventListener("keydown", handleSearch);

window.addEventListener("popstate", () => {
  const key = window.location.hash.replace("#", "") || "home";
  if (getCurrentUser()) {
    setView(key, { push: false });
  } else {
    renderPublicSite();
  }
});

initializeSessionState();
if (getCurrentUser()) {
  openInternalApp();
} else {
  renderPublicSite();
}
updateCartCount();
