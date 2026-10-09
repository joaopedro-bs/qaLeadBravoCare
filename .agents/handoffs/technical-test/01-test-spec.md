# Test Specification - technical-test

Status: READY FOR IMPLEMENTATION
Owner: test-specifier
Work item: technical-test
Date: 2026-07-13

## Scope

Smoke de API para o fluxo de reserva (dominio booking, adjacente a cruzeiro),
usando a API publica restful-booker como stand-in do sistema sob teste.
Objetivo: exercitar criacao, leitura e caminho negativo com validacao de
contrato (nao apenas status code).

Fora de escopo nesta iteracao: UI E2E, GraphQL, performance, auth/token de
update/delete. Marcados como proximos passos na arquitetura.

## Sistema sob teste

- Base URL: https://restful-booker.herokuapp.com
- Recurso: `/booking` (REST/JSON)

## Cenarios

### SC-01 - Criar reserva (happy path + contrato)
- Dado um payload de reserva valido (nome, preco, deposito, datas, needs)
- Quando `POST /booking`
- Entao status 200
- E o corpo retorna `bookingid` inteiro (contrato)
- E os campos enviados sao ecoados corretamente (firstname, totalprice, checkin)

### SC-02 - Ler reserva persistida
- Dado o `bookingid` criado em SC-01
- Quando `GET /booking/{id}`
- Entao status 200
- E os campos persistidos batem (lastname, depositpaid)

### SC-03 - Caminho negativo (id inexistente)
- Dado um id inexistente
- Quando `GET /booking/{id_invalido}`
- Entao status 404 (nao 200)

## Riscos / assuncoes

- ASSUNCAO: restful-booker e um alvo publico de treino; sem dados reais,
  sem credenciais, sem PII. Alinha com GUARDRAILS (nada de dado sensivel).
- RISCO: ambiente publico compartilhado pode ter latencia/instabilidade;
  smoke curto e tolerante, sem depender de estado pre-existente.
- ASSUNCAO: no teste real do cliente, trocar BASE e o contrato pelo sistema
  deles; a estrutura (happy + contrato + negativo) se mantem.

## Dados

- Reserva criada em runtime no SC-01; id propagado para SC-02.
- Sem setup/teardown externo nesta iteracao (POST cria; sem delete por nao
  exigir token). Teardown via DELETE fica como proximo passo na arquitetura.
