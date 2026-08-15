# Como alimentar o site pelas pastas

O site agora se atualiza sozinho a partir de 3 pastas de fotos. Você não
precisa mexer em HTML nem em código — só organizar fotos em pastas e rodar
um comando.

```
imagens/
├── antes-depois/            → seção "Antes e Depois"
├── nossos-trabalhos/        → seção "Nossos Trabalhos" (portfólio com filtros)
├── projetos-realizados/     → seção "Projetos Realizados" (linha do tempo)
└── dados/                   → gerado automaticamente, não mexer
```

## 1) Instalar o Node.js (uma única vez)

Baixe em https://nodejs.org (versão "LTS") e instale normalmente.
Depois disso, o comando `node` passa a funcionar no terminal.

## 2) Sempre que adicionar ou tirar fotos, rode:

Abra o terminal dentro da pasta do projeto (onde está o `index.html`) e digite:

```
node gerar-dados.js
```

Ele lê as pastas, gera os arquivos dentro de `imagens/dados/` e mostra um
resumo no terminal. Depois é só atualizar a página no navegador (ou publicar
o site normalmente) para ver as novidades.

---

## Seção "Antes e Depois"

Crie uma pasta para cada comparativo dentro de `imagens/antes-depois/`.
**O nome da pasta vira o título exibido no site.** Dentro dela, coloque
2 fotos:

```
imagens/antes-depois/Pintura de Fachada/
├── antes.jpg
└── depois.jpg
```

- Os arquivos podem ter qualquer nome, mas o ideal é que um contenha
  "antes" e o outro "depois" (maiúsculo/minúsculo não importa).
- Formatos aceitos: `.jpg`, `.jpeg`, `.png`, `.webp`.
- Se não houver "antes"/"depois" no nome, o sistema usa a 1ª foto (em
  ordem alfabética) como antes e a 2ª como depois.

## Seção "Nossos Trabalhos" (portfólio com filtros)

Aqui tem dois níveis: **categoria** e **projeto**.

```
imagens/nossos-trabalhos/
└── Pintura/                              ← categoria (usada no filtro)
    └── Pintura Predial Condomínio Sol/   ← um projeto = uma pasta
        ├── foto1.jpg
        ├── foto2.jpg
        ├── descricao.txt   (opcional)
        ├── servicos.txt    (opcional)
        └── local.txt       (opcional)
```

- O nome da pasta de **categoria** deve ser um destes (o site já tem os
  filtros prontos para elas): `Pintura`, `Manutenção Predial`, `Solar`,
  `Linha de Vida`, `Serviços Civis`, `Inspeções`, `Industrial`.
  Se usar um nome diferente, o site cria um filtro novo automaticamente.
- O nome da pasta do **projeto** vira o título do card.
- Coloque quantas fotos quiser dentro da pasta do projeto — todas entram
  na galeria do projeto (a primeira, em ordem alfabética, é a foto de capa).
- `descricao.txt`: um texto curto sobre o projeto (opcional — se não
  existir, o site usa um texto padrão).
- `servicos.txt`: um serviço por linha (opcional).
- `local.txt`: cidade/bairro (opcional).

## Seção "Projetos Realizados"

```
imagens/projetos-realizados/
└── Manutenção Predial em Condomínio/
    ├── foto1.jpg
    └── descricao.txt   (opcional)
```

- O nome da pasta vira o título do item.
- A primeira foto (ordem alfabética) é a foto usada no item.
- `descricao.txt` é opcional (texto padrão é usado se não existir).

---

## Resumo do fluxo do dia a dia

1. Tire as fotos do serviço.
2. Crie a pasta com o nome do projeto na seção certa.
3. Arraste as fotos para dentro da pasta.
4. Rode `node gerar-dados.js` no terminal.
5. Publique/atualize o site.

As pastas de exemplo (`Pintura de Fachada`, `Reforma Estrutural Edifício
Central`, etc.) têm fotos de demonstração — pode apagar essas pastas e
os arquivos de exemplo quando tiver fotos reais para colocar no lugar.
