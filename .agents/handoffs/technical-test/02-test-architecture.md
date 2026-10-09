# Test Architecture - technical-test

Status: READY FOR IMPLEMENTATION
Owner: test-architect
Consumes: 01-test-spec.md
Date: 2026-07-13

## Decisao central

Iteracao 1 = camada de API only, para ter um smoke deterministico verde em
minutos e servir de espinha dorsal do ensaio ao vivo. UI/GraphQL/performance
sao camadas adicionais planejadas, nao implementadas ainda.

## Stack e justificativa

- Linguagem: TypeScript (stack da vaga).
- Runner: `node:test` nativo + `assert/strict`, execucao via
  `node --experimental-strip-types` (Node 22+). Escolha deliberada para
  ZERO `npm install` no cenario time-boxed: roda em qualquer maquina com Node
  recente, sem cadeia de dependencias para dar errado no dia do teste.
- HTTP: `fetch` global (nativo). Sem axios/supertest nesta iteracao.

Tradeoff assumido: em um repo de projeto real, migrar para o runner do time
(Newman/Postman para colecoes, ou WebdriverIO/Mocha se unificar com o E2E).
Aqui priorizei tempo-ate-verde e portabilidade sobre padronizacao de tooling.

## Camadas

```
demo/booking.smoke.test.ts   <- specs (given/when/then em node:test)
  BASE + headers             <- config inline (extrair p/ env em escala)
  interfaces Booking/...      <- contrato tipado (validacao alem do status)
```

Em escala: separar `api/clients/booking.client.ts`, `config/env.ts`,
`schemas/` (zod/ajv para contrato), e `data/` para fixtures.

## Estrategia de dados

- Criacao em runtime (POST); id propagado em memoria entre passos.
- Sem PII, sem credenciais, sem dado de producao (GUARDRAILS).
- Teardown: nao aplicado (POST em alvo de treino). Proximo passo:
  `DELETE /booking/{id}` com token de `POST /auth` para limpeza.

## Validacao / quality gate

- Contrato: `bookingid` inteiro + echo de campos-chave, nao so status 200.
- Caminho negativo obrigatorio (404) para evitar falso-positivo de "verde".
- Gate local: `node --test` deve sair 0; saida arquivada em `evidence/`.

## CI (planejado)

- Passo unico: `node --experimental-strip-types --test demo/**/*.test.ts`.
- Encaixa em Jenkins/Bitbucket como stage `api-smoke` com publish do TAP.
- Tags/selecao e paralelismo entram quando houver E2E (WDIO) na suite.

## Proximos passos (nao feitos nesta iteracao)

- UI E2E: WebdriverIO + Cucumber (feature -> steps -> page object).
- GraphQL: operacao + variaveis + validacao de `errors`.
- Auth + DELETE para setup/teardown completo.
- Contract test com schema (zod/ajv). Performance com JMeter/k6.
