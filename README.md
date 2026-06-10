# Green Horizon

## Sobre o projeto

O **Green Horizon** é uma aplicação desenvolvida para auxiliar no monitoramento de áreas agrícolas, por meio de imagens de satélite e cálculo de NDVI.

A proposta do projeto é permitir que o usuário selecione uma área no mapa, envie os pontos dessa área para o sistema e receba uma análise da cobertura vegetal com base em dados de satélite. O projeto utiliza imagens do **Sentinel-2**, acessadas por meio do **Google Earth Engine**, para calcular o índice NDVI e apoiar a interpretação da saúde da vegetação.

O Green Horizon foi pensado principalmente para pequenos e médios produtores e contextos agrícolas, oferecendo uma forma mais simples e acessível de visualizar dados ambientais e apoiar decisões relacionadas ao plantio, manejo e acompanhamento da lavoura.

## Objetivo

O objetivo principal do Green Horizon é conectar dados espaciais a problemas reais da sociedade, utilizando imagens de satélite para gerar informações úteis sobre áreas agrícolas.

Com a aplicação, o usuário pode:

* Selecionar uma área de interesse no mapa.
* Enviar as coordenadas para análise.
* Calcular o NDVI da área selecionada.
* Visualizar uma estimativa da cobertura vegetal.
* Apoiar decisões relacionadas ao monitoramento agrícola.

## O que é NDVI?

O **NDVI**, ou **Normalized Difference Vegetation Index**, é um índice utilizado para analisar a presença e a condição da vegetação em uma determinada área.

Ele é calculado a partir da diferença entre a reflectância no infravermelho próximo e no vermelho, duas bandas presentes em imagens de satélite.

De forma simplificada:

* Valores mais próximos de **1** indicam vegetação mais densa e saudável.
* Valores próximos de **0** indicam solo exposto, áreas urbanas ou pouca vegetação.
* Valores negativos geralmente indicam água, sombra ou superfícies sem vegetação.

No projeto, o NDVI é utilizado para analisar a cobertura vegetal da área selecionada pelo usuário.

## Tecnologias utilizadas

### Frontend

* React
* JavaScript
* Node.js
* NPM

### Backend

* Java
* Spring Boot
* Python
* Google Earth Engine
* Geemap

### Dados de satélite

* Sentinel-2 Surface Reflectance Harmonized
* Google Earth Engine

## Estrutura geral do projeto

A aplicação é composta por três partes principais:

### Frontend

Responsável pela interface visual do usuário, onde é possível interagir com o mapa, selecionar pontos e enviar a área escolhida para análise.

### Microsserviço Java

Responsável por atuar como camada intermediária da aplicação, utilizando **Java** com **Spring Boot** para estruturar parte da comunicação entre o frontend e os serviços responsáveis pela análise.

### Serviço Python

Responsável por receber os pontos enviados, construir o polígono da área selecionada, acessar as imagens de satélite pelo Google Earth Engine e calcular o NDVI e outras métricas.

## Configuração do Google Earth Engine

Para que o cálculo do NDVI funcione corretamente, é necessário configurar o acesso ao **Google Earth Engine**.

### 1. Criar uma conta no Google Cloud

Antes de utilizar o Google Earth Engine, é necessário ter uma conta no **Google Cloud**.

Acesse o Google Cloud e crie uma conta, caso ainda não tenha uma.

### 2. Criar um projeto no Google Cloud

Depois de criar a conta, crie um projeto no Google Cloud.

Esse projeto será utilizado para conectar o ambiente Python ao Google Earth Engine.

### 3. Ativar o Google Earth Engine

Após criar o projeto, é necessário cadastrar e habilitar o uso do **Google Earth Engine** para essa conta/projeto.

O Google Earth Engine exige que o usuário tenha uma conta cadastrada e autorizada para acessar os dados e executar análises.

### 4. Conectar o projeto ao código

No serviço Python, o projeto do Google Cloud precisa ser informado no momento da inicialização do Earth Engine.

Exemplo:

```python
import ee

ee.Authenticate()
ee.Initialize(project="SEU_ID_DO_PROJETO")
```

Substitua `"SEU_ID_DO_PROJETO"` pelo ID do projeto criado no Google Cloud.

Exemplo usado no desenvolvimento:

```python
ee.Initialize(project="powerful-balm-394623")
```

### Observação importante sobre a licença

Este projeto utiliza uma configuração não comercial do Google Cloud/Google Earth Engine.

Por isso, o acesso pode estar sujeito a limitações de uso e tempo. No ambiente utilizado durante o desenvolvimento, a licença possui um limite aproximado de **150 horas** e pode expirar.

Caso o projeto deixe de autenticar ou apresente erro ao acessar o Earth Engine, pode ser necessário criar ou reativar um projeto no Google Cloud, habilitar novamente o Google Earth Engine, refazer a autenticação com `ee.Authenticate()` e atualizar o ID do projeto no código.

## Como rodar o frontend

Para rodar o frontend, é necessário ter instalado:

* Node.js
* NPM

Depois de clonar o repositório, acesse a pasta do frontend:

```bash
cd frontend
```

Instale as dependências do projeto:

```bash
npm i
```

Depois, rode o projeto em ambiente de desenvolvimento:

```bash
npm run dev
```

Após executar o comando, o terminal irá mostrar o endereço local para acessar a aplicação no navegador.

Normalmente, o endereço será algo parecido com:

```bash
http://localhost:5173
```

## Como rodar o backend

O backend do projeto é dividido entre um microsserviço em **Java com Spring Boot** e um serviço em **Python** responsável pela integração com o Google Earth Engine.

### Microsserviço Java

Para rodar o microsserviço Java, é necessário ter instalado:

* Java
* Maven
* Spring Boot configurado no projeto

Acesse a pasta do microsserviço Java e execute o projeto pela IDE ou pelo terminal, conforme a configuração do repositório.

Exemplo com Maven:

```bash
mvn spring-boot:run
```

### Serviço Python

Para rodar o serviço Python, é necessário ter o Python instalado.

Acesse a pasta do serviço Python:

```bash
cd Calculations
```

Crie um ambiente virtual:

```bash
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

Instale o FastAPI com as dependências padrão:

```bash
pip install fastapi[standard]
```

Depois, execute o serviço Python pelo terminal:

```bash
fastapi dev
```

Esse comando iniciará o serviço em ambiente de desenvolvimento, permitindo que ele receba as requisições necessárias para realizar a análise com o Google Earth Engine.

## Fluxo de funcionamento

O funcionamento geral do projeto segue este fluxo:

1. O usuário acessa o frontend.
2. O usuário seleciona pontos no mapa.
3. O frontend envia as coordenadas para o microsserviço Java.
4. O microsserviço Java encaminha ou organiza a comunicação com o serviço Python.
5. O serviço Python transforma os pontos em um polígono.
6. O Google Earth Engine busca imagens Sentinel-2 da área selecionada.
7. O sistema filtra imagens com baixa presença de nuvens.
8. O serviço Python calcula o NDVI da área.
9. O resultado é retornado para a aplicação.
10. O usuário visualiza a análise da cobertura vegetal.

## Requisitos para testar o projeto

Para testar o projeto localmente, é necessário ter:

* Node.js instalado.
* NPM instalado.
* Java instalado.
* Maven
* Python instalado.
* Conta no Google Cloud.
* Projeto configurado no Google Cloud.
* Google Earth Engine habilitado.
* ID do projeto configurado no código.
* Dependências do frontend instaladas com `npm i`.
* Dependências do serviço Python instaladas com `pip install -r requirements.txt`.

## Considerações finais

O Green Horizon foi desenvolvido como uma solução acadêmica voltada ao uso de dados espaciais para resolver desafios reais da sociedade.

A aplicação demonstra como tecnologias de satélite, mapas interativos, microsserviços e análise de dados podem ser combinados para apoiar o monitoramento agrícola e facilitar o acesso a informações sobre a saúde da vegetação.

O projeto ainda pode evoluir com novas funcionalidades, como histórico de análises mais complexo, comparação entre períodos, integração com dados climáticos e dashboards mais completos para acompanhamento das áreas analisadas.
