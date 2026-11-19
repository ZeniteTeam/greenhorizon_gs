# Green Horizon

> **O satélite aponta onde está o problema, o celular do produtor confirma o que é, e a comunidade inteira é avisada.**

## Sobre o projeto

O **Green Horizon** é um sistema de alerta precoce para a agricultura familiar. Ele acompanha cada talhão com imagens de satélite, encontra as partes da lavoura que perderam vigor, pede ao produtor uma foto da folha naquele ponto, explica o problema em português simples e avisa os produtores vizinhos quando um foco de doença é confirmado.

O projeto usa imagens do **Sentinel-2**, acessadas pelo **Google Earth Engine**, para calcular índices de vegetação (NDVI e NDMI). Os dados de chuva vêm do **CHIRPS** e a previsão do tempo, da **Open-Meteo**.

Foi pensado para pequenos e médios produtores, com uma interface leve, linguagem simples e foco em decisões práticas: onde olhar, o que fazer e quem chamar.

## Funcionalidades

### 1. Satélite: onde está o problema
* Série de NDVI (vigor) e NDMI (umidade) da safra inteira, a cada passagem do Sentinel-2.
* Comparação com a **curva esperada** da cultura (soja, milho, arroz) para a fase em que ela está.
* **Detecção de zonas sob estresse**: áreas que perderam vigor entre duas passagens, com área em hectares, queda de vigor e um ponto indicado para a vistoria.
* Chuva acumulada comparada com a média histórica de 30 anos.
* Passagens cobertas por nuvens são identificadas e não entram no cálculo.

### 2. Celular: o que é
* O produtor vai até o ponto indicado e tira uma foto da folha.
* A foto é analisada e o sistema devolve a suspeita mais provável, alternativas e o nível de confiança.
* O produtor confirma ou descarta a suspeita; fotos confirmadas viram dado de referência.

### 3. Explicação em linguagem simples
* Resumo do que a foto e o satélite mostram, em frases curtas.
* Passos práticos do que fazer, com leitura em voz alta pelo navegador.
* Uso responsável de IA: o sistema nunca recomenda produto ou dose e sempre orienta confirmar com um técnico da Emater ou da cooperativa.

### 4. Comunidade: quem é avisado
* Mapa regional de focos confirmados.
* Alerta para produtores num raio de 15 km do foco.
* Lista de prioridade de visitas para técnicos e solicitação de visita pelo produtor.
* Central de notificações.

## O que é NDVI?

O **NDVI**, ou **Normalized Difference Vegetation Index**, é um índice utilizado para analisar a presença e a condição da vegetação em uma determinada área.

Ele é calculado a partir da diferença entre a reflectância no infravermelho próximo e no vermelho, duas bandas presentes em imagens de satélite.

De forma simplificada:

* Valores mais próximos de **1** indicam vegetação mais densa e saudável.
* Valores próximos de **0** indicam solo exposto, áreas urbanas ou pouca vegetação.
* Valores negativos geralmente indicam água, sombra ou superfícies sem vegetação.

O **NDMI** usa o infravermelho próximo e o infravermelho de ondas curtas para estimar a umidade da vegetação. Juntos, os dois índices ajudam a diferenciar falta de água de doença ou praga.

## Tecnologias utilizadas

### Frontend
* React + TypeScript (Vite)
* Tailwind CSS
* Leaflet / React Leaflet (mapas)
* TanStack Query (dados do servidor) e Zustand (estado da interface)
* React Hook Form + Zod (formulários)
* Axios
* Lucide (ícones)

### API Java (Horizon)
* Java 21
* Spring Boot
* Spring Events (comunicação entre os módulos `monitoring`, `community` e `notification`)
* H2 (banco em memória)

### Serviço Python (Calculations)
* Python 3.12+
* FastAPI
* Google Earth Engine
* Gemini (diagnóstico da foto da folha, com modo simulado)

### Dados
* Sentinel-2 Surface Reflectance Harmonized
* CHIRPS Daily (chuva)
* Open-Meteo (previsão do tempo)

## Estrutura geral do projeto

```
greenhorizon_gs/
├── frontend/frontend/          # Aplicação web (React)
└── backend/
    ├── Horizon/Horizon/        # API Java (Spring Boot) - porta 8080
    └── Calculations/           # Serviço Python (FastAPI) - porta 8000
```

### Frontend
Interface do produtor: lista de talhões, mapa com zonas sob estresse, gráficos da safra, envio de foto, diagnóstico, comunidade e notificações. Conversa somente com a API Java.

### API Java
Camada central da aplicação. Guarda talhões, zonas, focos e notificações, aplica as regras de negócio (detecção de zonas, risco de doença, alerta aos vizinhos) e chama o serviço Python.

### Serviço Python
Serviço interno, chamado apenas pela API Java. Acessa o Google Earth Engine para calcular as séries de NDVI/NDMI, detectar zonas e gerar as camadas do mapa, e faz o diagnóstico da foto da folha.

| Endpoint | Função |
|---|---|
| `POST /fields/analyze` | Análise da safra de um talhão (passagens, chuva e zonas) |
| `POST /fields/tiles` | Camada do mapa (NDVI, NDMI ou mudança) de uma passagem |
| `POST /leaf/diagnose` | Diagnóstico da foto da folha |
| `POST /calculate` | Análise pontual de NDVI de uma área desenhada |

## Configuração do Google Earth Engine

Para que os cálculos de satélite funcionem, é necessário configurar o acesso ao **Google Earth Engine**.

### 1. Criar uma conta e um projeto no Google Cloud

Crie uma conta no **Google Cloud**, caso ainda não tenha, e depois crie um projeto. Esse projeto será usado para conectar o serviço Python ao Earth Engine.

### 2. Ativar o Google Earth Engine

Cadastre e habilite o uso do **Google Earth Engine** para essa conta/projeto. O Earth Engine exige uma conta cadastrada e autorizada para acessar os dados.

### 3. Autenticar a máquina

Com o ambiente virtual do serviço Python ativo (veja abaixo), rode uma vez:

```bash
earthengine authenticate
```

### 4. Informar o projeto

Copie `backend/Calculations/.env.example` para `backend/Calculations/.env` e preencha o ID do projeto:

```bash
EE_PROJECT=SEU_ID_DO_PROJETO
```

### Observação importante sobre a licença

Este projeto utiliza uma configuração não comercial do Google Cloud/Google Earth Engine.

Por isso, o acesso pode estar sujeito a limitações de uso e tempo. No ambiente utilizado durante o desenvolvimento, a licença possui um limite aproximado de **150 horas** e pode expirar.

Caso o projeto deixe de autenticar ou apresente erro ao acessar o Earth Engine, pode ser necessário criar ou reativar um projeto no Google Cloud, habilitar novamente o Google Earth Engine, refazer a autenticação e atualizar o `EE_PROJECT` no `.env`.

## Diagnóstico da foto (Gemini)

O diagnóstico da folha pode funcionar de dois jeitos, definidos no `backend/Calculations/.env`:

| Configuração | Comportamento |
|---|---|
| `GEMINI_MOCK=true` (padrão) | Diagnóstico **simulado**: resposta pronta por cultura (ex.: soja → ferrugem asiática). Não precisa de chave e não chama o Gemini. |
| `GEMINI_MOCK=false` | Usa o **Gemini** de verdade. Precisa de `GEMINI_API_KEY` (Google AI Studio). |

No modo real, cada foto é analisada uma única vez (o resultado fica em cache) e o número de chamadas por dia é limitado por `GEMINI_DAILY_LIMIT`, para ficar dentro da cota gratuita.

## Como rodar o projeto

São três serviços, cada um no seu terminal. Suba na ordem: **Python → Java → Frontend**.

### 1. Serviço Python (porta 8000)

Requisitos: Python 3.12 ou superior.

```bash
cd backend/Calculations
python -m venv .venv
```

Ative o ambiente virtual.

No Windows:

```bash
.venv\Scripts\activate
```

No Linux ou Mac:

```bash
source .venv/bin/activate
```

Instale as dependências e configure o `.env`:

```bash
pip install -r requirements.txt
cp .env.example .env    # no Windows: copy .env.example .env
```

Inicie o serviço:

```bash
uvicorn main:app --port 8000
```

A documentação interativa fica em `http://localhost:8000/docs`.

### 2. API Java (porta 8080)

Requisitos: **Java 21** (não precisa instalar o Maven; o projeto usa o Maven Wrapper).

```bash
cd backend/Horizon/Horizon
./mvnw spring-boot:run      # no Windows: mvnw.cmd spring-boot:run
```

Também é possível rodar pela IDE (IntelliJ), executando a classe `HorizonApplication` com o JDK 21.

> Se o terminal acusar uma versão antiga do Java, aponte o `JAVA_HOME` para o JDK 21 antes de rodar.

A API Java procura o serviço Python em `http://localhost:8000`. Para mudar, defina a variável `CALCULATION_API_URL`.

### 3. Frontend (porta 5173)

Requisitos: Node.js e NPM.

```bash
cd frontend/frontend
npm i
npm run dev
```

Acesse `http://localhost:5173`.

O frontend lê as variáveis de `frontend/frontend/.env.local` (veja `.env.example`):

| Variável | Uso |
|---|---|
| `VITE_API_URL` | Endereço da API Java (padrão `http://localhost:8080`) |
| `VITE_USE_DEMO` | `true` = usa um cenário de demonstração embutido, sem precisar do backend |

## Dados de demonstração

A API Java usa um banco **H2 em memória** e carrega `data.sql` toda vez que inicia. Os talhões ficam em coordenadas reais de Sorriso (MT), e os dados de satélite são buscados ao vivo no Earth Engine.

**Conta de teste:**

| E-mail | Senha |
|---|---|
| `conta@gmail.com` | `123455` |

* O **Talhão 1** já vem com uma **zona sob estresse** aguardando foto, para demonstrar o fluxo completo.
* Para voltar ao estado inicial (por exemplo, depois de confirmar ou descartar a zona), basta **reiniciar a API Java**.

## Fluxo de funcionamento

1. O produtor entra no aplicativo e vê seus talhões e a saúde de cada um.
2. A API Java pede ao serviço Python a análise da safra de cada talhão.
3. O serviço Python busca as passagens do Sentinel-2 no Earth Engine, descarta as nuvens e calcula NDVI e NDMI.
4. Comparando a passagem mais recente com uma de cerca de 10 dias antes, ele encontra as **zonas que perderam vigor**.
5. A API Java registra a zona, cria a notificação e mostra no mapa o ponto que deve ser visitado.
6. O produtor vai até o ponto e envia uma **foto da folha**.
7. O serviço Python devolve o **diagnóstico** com explicação em linguagem simples.
8. O produtor **confirma** a suspeita.
9. O foco entra no **mapa da comunidade** e os produtores num raio de 15 km são **avisados**.

## Considerações finais

O Green Horizon foi desenvolvido como uma solução acadêmica para a Global Solution da FIAP, voltada ao uso de dados espaciais para resolver desafios reais da sociedade.

A aplicação mostra como imagens de satélite, a câmera do celular e a força da comunidade podem ser combinadas para encontrar problemas na lavoura mais cedo, quando ainda dá tempo de agir.

Próximos passos possíveis:

* Autenticação real com JWT (hoje o usuário é identificado por um cabeçalho simples).
* Banco PostgreSQL com PostGIS no lugar do H2.
* Envio de alertas por WhatsApp.
* Tela para o produtor cadastrar um novo talhão.
* Publicação na nuvem (Cloud Run, Pub/Sub, Cloud Scheduler, Cloud SQL).
