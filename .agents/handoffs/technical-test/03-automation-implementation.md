# Automation Implementation - technical-test

Status: READY FOR REVIEW
Owner: test-automation-writer
Consumes: 01-test-spec.md, 02-test-architecture.md
Date: 2026-07-13

## Arquivos alterados

- `demo/booking.smoke.test.ts` (novo) - smoke de API tipado, 3 testes.
- `demo/booking.smoke.test.mjs` (novo) - mesma logica em JS puro, para
  maquinas em Node 18-21 sem strip-types.

## Cobertura implementada

| ID    | Cenario                              | Assercao-chave                         |
|-------|--------------------------------------|----------------------------------------|
| SC-01 | POST /booking cria reserva           | 200 + `bookingid` inteiro + echo campos |
| SC-02 | GET /booking/{id} le persistido      | 200 + lastname/depositpaid batem        |
| SC-03 | GET /booking/{id_invalido} negativo  | 404 (nao 200)                           |

Validacao alem do status: contrato tipado (`interface Booking`,
`CreateBookingResponse`) + assercao de campos ecoados, cumprindo a regra
do AGENTS.md de "validar schema/shape e campos, nao so status".

## Validacao executada

Comando:

```
node --experimental-strip-types --test demo/booking.smoke.test.ts
```

Resultado: `# pass 3 / # fail 0`. Duracao ~1.8s.

Evidencia arquivada:
`evidence/command-output/20260713-105357-booking-smoke-ts.txt`

Variante JS validada em separado com `node --test demo/booking.smoke.test.mjs`
(mesmo 3/3 verde).

## Nao executado / limites (honesto)

- Sem teardown (`DELETE /booking/{id}`) - exige token de `POST /auth`; fica
  para a proxima iteracao conforme arquitetura.
- Sem UI/GraphQL/performance nesta iteracao.
- Alvo publico (restful-booker): latencia variavel; nenhum retry/backoff
  ainda. Se instavel em CI, adicionar timeout explicito por teste.

## Como rodar

```bash
cd ~/Documents/techInterviewSNDB
node --experimental-strip-types --test demo/booking.smoke.test.ts   # Node 22+
# ou, sem strip-types:
node --test demo/booking.smoke.test.mjs                             # Node 18+
```
