![Python](https://img.shields.io/badge/Python-3.13.2-blue)

# Casa dos Dados API Client

Este projeto é um cliente Python para interagir com a API da Casa dos Dados. Ele fornece métodos para realizar consultas de CNPJ, exportar dados e verificar saldo, utilizando as rotas disponíveis nas versões 4 e 5 da API.

## 🚀 Funcionalidades

- Consultar informações detalhadas de CNPJs.
- Obter dashboards de empresas abertas.
- Exportar dados de empresas em formato CSV.
- Verificar saldo disponível para consultas.

## 🛠️ Tecnologias Utilizadas

- **Python**: Linguagem principal do projeto.
- **Requests**: Para realizar chamadas HTTP.
- **Pydantic**: Para validação e modelagem de dados.
- **Python-dotenv**: Para gerenciar variáveis de ambiente.

## 📦 Instalação

1. Clone o repositório:
   ```bash
   git clone https://github.com/pedrohcleal/casadosdados-doc.git
   cd casadosdados
   ```

2. Crie um ambiente virtual e ative-o:
   ```bash
   python -m venv venv
   source venv/bin/activate  # Linux/Mac
   venv\Scripts\activate     # Windows
   ```

3. Instale as dependências:
   ```bash
   pip install -r requirements.txt
   ```

4. Configure o arquivo `.env` com sua chave de API:
   ```env
   API_KEY=sua_chave_api
   ```

## 🏃‍♂️ Como Usar

Execute o arquivo `main.py` para realizar uma consulta de exemplo:
```bash
python main.py
```

## 📋 Estrutura do Projeto

```
.
├── main.py               # Ponto de entrada do projeto
├── models/               # Modelos de dados
├── routes/               # Rotas para interagir com a API
├── .env                  # Variáveis de ambiente
├── requirements.txt      # Dependências do projeto
└── readme.md             # Documentação do projeto
```

