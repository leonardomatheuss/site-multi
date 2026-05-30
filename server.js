const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

const produtos = [
  {
    id: 1,
    nome: 'Teclado USB',
    categoria: 'perifericos',
    descricao: 'Teclado com fio USB ABNT2, layout padrão brasileiro, ideal para escritório e uso diário.',
    specs: ['Conexão USB', 'Layout ABNT2', 'Teclas silenciosas', 'Marca: Hayom'],
    imagem: '/images/produto1.jpeg',
    estoque: 10,
    destaque: false
  },
  {
    id: 2,
    nome: 'Mouse com Fio e sem Fio',
    categoria: 'perifericos',
    descricao: 'Mouse disponível com fio USB e sem fio 2.4GHz, design ergonômico e scroll preciso.',
    specs: ['Conexão USB com fio', 'Sem fio 2.4GHz', 'Design ergonômico', 'Botões programáveis'],
    imagem: '/images/produto2.jpeg',
    estoque: 15,
    destaque: true
  },
  {
    id: 3,
    nome: 'Placa de Rede',
    categoria: 'componentes',
    descricao: 'Placa de rede PCI-E Gigabit para desktop, conexão cabeada de alta velocidade e estabilidade.',
    specs: ['Interface PCI-E', 'Gigabit Ethernet 10/100/1000', 'Plug & Play', 'Marca: Vinik'],
    imagem: '/images/produto3.jpeg',
    estoque: 8,
    destaque: false
  },
  {
    id: 4,
    nome: 'SSD SATA 120GB / 240GB',
    categoria: 'componentes',
    descricao: 'SSD SATA de alta velocidade disponível em 120GB e 240GB, ideal para upgrade do seu computador.',
    specs: ['Interface SATA III', 'Disponível em 120GB e 240GB', 'Boot mais rápido', 'Marca: FNX Gamer'],
    imagem: '/images/produto4.jpeg',
    estoque: 12,
    destaque: true
  },
  {
    id: 5,
    nome: 'SSD NVMe M.2 256GB',
    categoria: 'componentes',
    descricao: 'SSD NVMe M.2 PCIe Gen3×4 de 256GB, ultra velocidade para leitura e gravação de dados.',
    specs: ['Interface M.2 PCIe Gen3×4', '256GB de capacidade', 'Ultra velocidade NVMe', 'Marca: XPG SX8100'],
    imagem: '/images/produto5.jpeg',
    estoque: 6,
    destaque: true
  },
  {
    id: 6,
    nome: 'Memória RAM DDR4 8GB',
    categoria: 'componentes',
    descricao: 'Memória RAM DDR4 8GB para upgrade de desktops, alto desempenho e compatibilidade ampla.',
    specs: ['8GB DDR4', 'Alta performance', 'Compatível com desktops', 'Marca: Enix Fire'],
    imagem: '/images/produto6.jpeg',
    estoque: 10,
    destaque: true
  },
  {
    id: 7,
    nome: 'Memória RAM DDR3 4GB',
    categoria: 'componentes',
    descricao: 'Memória RAM DDR3 4GB 1600MHz para upgrade de computadores compatíveis com DDR3.',
    specs: ['4GB DDR3', '1600MHz', 'Compatível com desktops e notebooks', 'Marca: Keepdata'],
    imagem: '/images/produto7.jpeg',
    estoque: 8,
    destaque: false
  },
  {
    id: 8,
    nome: 'SSD NVMe M.2 240GB Kingston',
    categoria: 'componentes',
    descricao: 'SSD NVMe M.2 Kingston A400 240GB, confiável e rápido, excelente custo-benefício.',
    specs: ['Interface M.2', '240GB de capacidade', 'Alta velocidade NVMe', 'Marca: Kingston A400'],
    imagem: '/images/produto11.jpeg',
    estoque: 7,
    destaque: false
  },
  {
    id: 9,
    nome: 'Cooler para Processador',
    categoria: 'componentes',
    descricao: 'Cooler para processador com alta eficiência de resfriamento, compatível com soquetes Intel e AMD.',
    specs: ['Compatível Intel e AMD', 'Alto fluxo de ar', 'Operação silenciosa', 'Marca: DEX'],
    imagem: '/images/produto12.jpeg',
    estoque: 5,
    destaque: false
  }
];

const servicos = [
  {
    id: 1,
    nome: 'Manutenção de Impressoras',
    icone: 'fa-print',
    descricao: 'Limpeza de cabeçote, troca de cartuchos, ajuste de alimentação de papel, calibração, diagnóstico completo.',
    itens: ['Limpeza de cabeçote de impressão', 'Troca e calibração de cartuchos', 'Ajuste mecânico do alimentador', 'Diagnóstico de erros', 'Teste de impressão'],
    tempo: '1 a 3 dias úteis'
  },
  {
    id: 2,
    nome: 'Formatação e Instalação de Windows',
    icone: 'fa-windows',
    descricao: 'Formatação completa, instalação do Windows 10 ou 11, drivers, programas essenciais e configuração inicial.',
    itens: ['Backup dos dados do cliente', 'Formatação completa do sistema', 'Instalação Windows 10 ou 11', 'Instalação de drivers', 'Programas essenciais (Office, antivírus)'],
    tempo: '4 a 8 horas'
  },
  {
    id: 3,
    nome: 'Limpeza e Manutenção Preventiva',
    icone: 'fa-broom',
    descricao: 'Limpeza interna completa do computador, troca de pasta térmica, verificação de componentes e otimização.',
    itens: ['Limpeza interna completa', 'Troca de pasta térmica', 'Verificação de temperatura', 'Teste de componentes', 'Otimização do sistema'],
    tempo: '2 a 4 horas'
  },
  {
    id: 4,
    nome: 'Recuperação de Dados',
    icone: 'fa-database',
    descricao: 'Recuperação de arquivos perdidos por formatação acidental, falha no HD, vírus ou partição corrompida.',
    itens: ['Diagnóstico do dispositivo', 'Recuperação de fotos e documentos', 'HD, SSD, Pen Drive e Cartão SD', 'Sem recuperação = sem cobrança', 'Entrega em mídia do cliente'],
    tempo: '1 a 5 dias úteis'
  },
  {
    id: 5,
    nome: 'Remoção de Vírus e Malware',
    icone: 'fa-shield-virus',
    descricao: 'Varredura completa, remoção de vírus, spyware, ransomware e adware. Instalação de antivírus e firewall.',
    itens: ['Varredura completa do sistema', 'Remoção de vírus e spyware', 'Limpeza de arquivos maliciosos', 'Instalação de antivírus', 'Configuração de firewall'],
    tempo: '2 a 6 horas'
  },
  {
    id: 6,
    nome: 'Upgrade de Hardware',
    icone: 'fa-microchip',
    descricao: 'Instalação de memória RAM, SSD, HD, placa de vídeo e demais componentes com garantia de serviço.',
    itens: ['Instalação de memória RAM', 'Upgrade para SSD (+ backup)', 'Troca de HD', 'Instalação de placa de vídeo', 'Teste de estabilidade pós-instalação'],
    tempo: '1 a 3 horas'
  },
  {
    id: 7,
    nome: 'Configuração de Rede Wi-Fi',
    icone: 'fa-wifi',
    descricao: 'Configuração de roteadores, repetidores, rede cabeada, solução de problemas de conexão e segurança de rede.',
    itens: ['Configuração de roteador', 'Extensão e repetição de sinal', 'Rede cabeada Cat5e/Cat6', 'Segurança e senha de rede', 'Diagnóstico de conexão lenta'],
    tempo: '1 a 2 horas'
  },
  {
    id: 8,
    nome: 'Suporte Técnico Remoto',
    icone: 'fa-headset',
    descricao: 'Atendimento remoto via TeamViewer ou AnyDesk para resolução de problemas de software, configurações e dúvidas.',
    itens: ['Atendimento via TeamViewer', 'Resolução de erros de software', 'Configurações diversas', 'Instalação de programas', 'Suporte em horário comercial'],
    tempo: 'Agendamento em até 2h'
  }
];

const depoimentos = [
  {
    id: 1,
    nome: 'Carlos Eduardo Mendes',
    cargo: 'Empresário',
    foto: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&auto=format&face',
    texto: 'Excelente atendimento! Comprei meu notebook aqui e recebi toda a orientação necessária. Preço justo e entrega rápida. Com certeza voltarei!',
    nota: 5
  },
  {
    id: 2,
    nome: 'Ana Paula Ferreira',
    cargo: 'Designer Gráfica',
    foto: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop&auto=format&face',
    texto: 'Trouxe minha impressora que estava com problemas e em menos de 2 dias estava como nova. Serviço profissional e preço honesto. Super recomendo!',
    nota: 5
  },
  {
    id: 3,
    nome: 'Roberto Silva',
    cargo: 'Contador',
    foto: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=500&h=500&fit=crop&auto=format',
    texto: 'Precisei recuperar dados de um HD que pifou. A equipe da TechPro conseguiu recuperar tudo! Muito competentes e atenciosos. Nota 10!',
    nota: 5
  }
];

// Routes
app.get('/api/produtos', (req, res) => {
  const { categoria, destaque } = req.query;
  let resultado = [...produtos];
  if (categoria && categoria !== 'todos') {
    resultado = resultado.filter(p => p.categoria === categoria);
  }
  if (destaque === 'true') {
    resultado = resultado.filter(p => p.destaque);
  }
  res.json(resultado);
});

app.get('/api/produtos/:id', (req, res) => {
  const produto = produtos.find(p => p.id === parseInt(req.params.id));
  if (!produto) return res.status(404).json({ erro: 'Produto não encontrado' });
  res.json(produto);
});

app.get('/api/servicos', (req, res) => {
  res.json(servicos);
});

app.get('/api/depoimentos', (req, res) => {
  res.json(depoimentos);
});

app.post('/api/contato', (req, res) => {
  const { nome, email, telefone, servico, mensagem } = req.body;
  if (!nome || !email || !mensagem) {
    return res.status(400).json({ erro: 'Nome, e-mail e mensagem são obrigatórios.' });
  }
  console.log('Novo contato recebido:', { nome, email, telefone, servico, mensagem, data: new Date().toLocaleString('pt-BR') });
  res.json({ sucesso: true, mensagem: `Olá ${nome}! Recebemos sua mensagem e retornaremos em breve.` });
});

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`\n🚀 Multi-Técnica rodando em http://localhost:${PORT}\n`);
});
