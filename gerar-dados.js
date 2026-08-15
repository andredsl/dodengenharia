/* ============================================================
   GERADOR DE DADOS DA GALERIA — DOD Engenharia
   ------------------------------------------------------------
   O que este script faz:
   Ele "olha" para dentro das pastas de imagens do site e monta,
   automaticamente, os arquivos de dados que o index.html usa
   para exibir as fotos. Assim, para colocar um novo projeto no
   site, basta criar uma pasta com as fotos — não é preciso
   editar HTML nem código.

   Como usar:
   1) Instale o Node.js (https://nodejs.org) uma única vez.
   2) Sempre que adicionar/remover uma pasta de fotos, abra o
      terminal nesta pasta do projeto e rode:
          node gerar-dados.js
   3) Pronto — os arquivos em imagens/dados/*.js são atualizados
      e o site já reflete as mudanças (basta atualizar a página).

   Veja o arquivo COMO-USAR.md para as regras de cada pasta.
   ============================================================ */

const fs = require("fs");
const path = require("path");

const RAIZ = __dirname;
const PASTA_ANTES_DEPOIS = path.join(RAIZ, "imagens", "antes-depois");
const PASTA_TRABALHOS = path.join(RAIZ, "imagens", "nossos-trabalhos");
const PASTA_PROJETOS = path.join(RAIZ, "imagens", "projetos-realizados");
const PASTA_DADOS = path.join(RAIZ, "imagens", "dados");

const EXT_IMAGEM = [".jpg", ".jpeg", ".png", ".webp"];

// Categorias fixas do site (mesmas usadas pelos cards de serviço).
// O nome da subpasta dentro de "nossos-trabalhos" deve corresponder
// a uma destas chaves (sem acento e sem espaço) OU ao rótulo exato.
const CATEGORIAS_CONHECIDAS = [
  { key: "pintura", label: "Pintura" },
  { key: "manutencao-predial", label: "Manutenção Predial" },
  { key: "solar", label: "Solar" },
  { key: "linha-vida", label: "Linha de Vida" },
  { key: "servicos-civis", label: "Serviços Civis" },
  { key: "inspecoes", label: "Inspeções" },
  { key: "industrial", label: "Industrial" }
];

function normalizar(txt) {
  return txt
    .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "");
}

function slug(txt) {
  return normalizar(txt);
}

function listarPastas(dir) {
  if (!fs.existsSync(dir)) return [];
  return fs.readdirSync(dir, { withFileTypes: true })
    .filter(d => d.isDirectory() && !d.name.startsWith("."))
    .map(d => d.name)
    .sort((a, b) => a.localeCompare(b, "pt-BR"));
}

function listarImagens(dir) {
  if (!fs.existsSync(dir)) return [];
  return fs.readdirSync(dir, { withFileTypes: true })
    .filter(d => d.isFile() && EXT_IMAGEM.includes(path.extname(d.name).toLowerCase()))
    .map(d => d.name)
    .sort((a, b) => a.localeCompare(b, "pt-BR"));
}

function caminhoWeb(...partes) {
  // sempre com "/" (URL), mesmo se o script rodar no Windows
  return partes.join("/").split(path.sep).join("/");
}

function lerArquivoTexto(dir, nome) {
  const p = path.join(dir, nome);
  if (fs.existsSync(p)) return fs.readFileSync(p, "utf8").trim();
  return "";
}

/* ------------------------------------------------------------
   1) ANTES E DEPOIS
   Cada subpasta de imagens/antes-depois/ = um comparativo.
   Título do card = nome da pasta.
   Dentro da pasta: uma foto com "antes" no nome e outra com
   "depois" no nome. Se não encontrar por nome, usa a 1ª imagem
   (em ordem alfabética) como "antes" e a 2ª como "depois".
   ------------------------------------------------------------ */
function gerarAntesDepois() {
  const pastas = listarPastas(PASTA_ANTES_DEPOIS);
  const itens = [];

  pastas.forEach(nomePasta => {
    const dir = path.join(PASTA_ANTES_DEPOIS, nomePasta);
    const imagens = listarImagens(dir);
    if (imagens.length < 2) {
      console.warn(`[antes-depois] "${nomePasta}" ignorada: precisa de 2 fotos (encontrei ${imagens.length}).`);
      return;
    }
    let antes = imagens.find(f => normalizar(f).includes("antes"));
    let depois = imagens.find(f => normalizar(f).includes("depois"));
    if (!antes || !depois) {
      antes = imagens[0];
      depois = imagens[1];
    }
    itens.push({
      title: nomePasta,
      before: caminhoWeb("imagens", "antes-depois", nomePasta, antes),
      after: caminhoWeb("imagens", "antes-depois", nomePasta, depois)
    });
  });

  return itens;
}

/* ------------------------------------------------------------
   2) NOSSOS TRABALHOS (portfólio com filtros)
   Estrutura: imagens/nossos-trabalhos/<Categoria>/<Nome do Projeto>/
   - <Categoria> deve corresponder a uma das categorias fixas do
     site (ex.: "Pintura", "Manutenção Predial", "Solar"...).
     Categorias com nome diferente entram como categoria extra.
   - Dentro da pasta do projeto: quantas fotos quiser (galeria).
   - Arquivo opcional "descricao.txt": texto de apresentação do
     projeto.
   - Arquivo opcional "servicos.txt": um serviço por linha.
   - Arquivo opcional "local.txt": cidade/bairro do serviço.
   ------------------------------------------------------------ */
function gerarNossosTrabalhos() {
  const categoriasPastas = listarPastas(PASTA_TRABALHOS);
  const projetos = [];
  const categoriasExtras = [];

  categoriasPastas.forEach(nomeCategoria => {
    const conhecida = CATEGORIAS_CONHECIDAS.find(c =>
      normalizar(c.label) === normalizar(nomeCategoria) || c.key === normalizar(nomeCategoria)
    );
    const categoryKey = conhecida ? conhecida.key : slug(nomeCategoria);
    const categoryLabel = conhecida ? conhecida.label : nomeCategoria;
    if (!conhecida && !categoriasExtras.find(c => c.key === categoryKey)) {
      categoriasExtras.push({ key: categoryKey, label: categoryLabel });
    }

    const dirCategoria = path.join(PASTA_TRABALHOS, nomeCategoria);
    const pastasProjeto = listarPastas(dirCategoria);

    pastasProjeto.forEach(nomeProjeto => {
      const dirProjeto = path.join(dirCategoria, nomeProjeto);
      const imagens = listarImagens(dirProjeto);
      if (imagens.length === 0) {
        console.warn(`[nossos-trabalhos] "${nomeCategoria}/${nomeProjeto}" ignorado: sem fotos.`);
        return;
      }
      const descricao = lerArquivoTexto(dirProjeto, "descricao.txt") ||
        `Serviço de ${categoryLabel.toLowerCase()} executado com foco em qualidade e segurança.`;
      const local = lerArquivoTexto(dirProjeto, "local.txt") || null;
      const servicosTxt = lerArquivoTexto(dirProjeto, "servicos.txt");
      const services = servicosTxt
        ? servicosTxt.split("\n").map(s => s.trim()).filter(Boolean)
        : ["Execução do serviço conforme escopo definido"];

      projetos.push({
        id: slug(nomeCategoria) + "-" + slug(nomeProjeto),
        title: nomeProjeto,
        category: categoryKey,
        categoryLabel: categoryLabel,
        desc: descricao,
        location: local,
        services: services,
        images: imagens.map(img => caminhoWeb("imagens", "nossos-trabalhos", nomeCategoria, nomeProjeto, img))
      });
    });
  });

  const filters = [{ key: "todos", label: "Todos" }]
    .concat(CATEGORIAS_CONHECIDAS)
    .concat(categoriasExtras);

  return { projects: projetos, filters };
}

/* ------------------------------------------------------------
   3) PROJETOS REALIZADOS (seção "Experiência")
   Cada subpasta de imagens/projetos-realizados/ = um item da
   lista. Título = nome da pasta. 1ª foto (ordem alfabética) é
   usada como imagem do item. Arquivo opcional "descricao.txt".
   ------------------------------------------------------------ */
function gerarProjetosRealizados() {
  const pastas = listarPastas(PASTA_PROJETOS);
  const itens = [];

  pastas.forEach(nomePasta => {
    const dir = path.join(PASTA_PROJETOS, nomePasta);
    const imagens = listarImagens(dir);
    if (imagens.length === 0) {
      console.warn(`[projetos-realizados] "${nomePasta}" ignorado: sem fotos.`);
      return;
    }
    const descricao = lerArquivoTexto(dir, "descricao.txt") ||
      "Serviço realizado com foco em qualidade, segurança e conservação.";
    itens.push({
      tag: "Projeto",
      title: nomePasta,
      desc: descricao,
      image: caminhoWeb("imagens", "projetos-realizados", nomePasta, imagens[0])
    });
  });

  return itens;
}

/* ------------------------------------------------------------
   Gravação dos arquivos de dados usados pelo index.html
   ------------------------------------------------------------ */
function escreverJS(nomeArquivo, variavel, valor) {
  if (!fs.existsSync(PASTA_DADOS)) fs.mkdirSync(PASTA_DADOS, { recursive: true });
  const conteudo =
`/* Gerado automaticamente por gerar-dados.js — não edite à mão.
   Para atualizar, edite as pastas de fotos e rode: node gerar-dados.js */
window.${variavel} = ${JSON.stringify(valor, null, 2)};
`;
  fs.writeFileSync(path.join(PASTA_DADOS, nomeArquivo), conteudo, "utf8");
}

const antesDepois = gerarAntesDepois();
const trabalhos = gerarNossosTrabalhos();
const projetosRealizados = gerarProjetosRealizados();

escreverJS("antes-depois.js", "BEFORE_AFTER_DATA", antesDepois);
escreverJS("nossos-trabalhos.js", "PROJECTS_DATA", trabalhos.projects);
escreverJS("filtros.js", "FILTERS_DATA", trabalhos.filters);
escreverJS("projetos-realizados.js", "EXPERIENCE_DATA", projetosRealizados);

console.log("------------------------------------------------------------");
console.log(`Antes e depois:      ${antesDepois.length} comparativo(s)`);
console.log(`Nossos trabalhos:    ${trabalhos.projects.length} projeto(s) em ${trabalhos.filters.length - 1} categoria(s)`);
console.log(`Projetos realizados: ${projetosRealizados.length} item(ns)`);
console.log("Arquivos gerados em imagens/dados/. Atualize a página para ver o resultado.");
console.log("------------------------------------------------------------");
