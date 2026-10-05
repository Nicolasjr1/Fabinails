# Fabi Nails

Agendamento online simples em HTML, CSS e JavaScript, servido por Node.js e conectado ao PostgreSQL.

## Requisitos

- Node.js 20 ou superior
- PostgreSQL acessível pela `DATABASE_URL`

## Rodar localmente

1. Copie `.env.example` para `.env`.
2. Preencha `DATABASE_URL` com a conexão do PostgreSQL.
3. Instale e inicie:

```bash
npm install
npm run dev
```

Abra `http://localhost:3000`. O servidor cria as tabelas ausentes e os três serviços padrão sem apagar dados existentes. Cada horário escolhido fica reservado por 10 minutos; ao confirmar, o agendamento é salvo no banco e é gerado um link de WhatsApp.

