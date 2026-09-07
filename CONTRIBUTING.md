# Contribuindo com o CampanhaCerta

Este documento descreve o fluxo de trabalho esperado para qualquer alteração
no repositório.

## Regra principal

A branch `main` é protegida. Ninguém — incluindo administradores — pode dar
push direto nela ou fazer merge sem passar pelo fluxo abaixo.

## Fluxo de trabalho

1. **Nunca commite direto na `main`.** Toda mudança nasce em uma branch nova
   a partir da `main` atualizada:

   ```bash
   git checkout main
   git pull
   git checkout -b feature/nome-da-feature
   # ou fix/nome-do-bug, chore/o-que-for
   ```

2. **Faça commits pequenos e com mensagens claras**, descrevendo o *porquê*
   da mudança, não só o *o quê*.

3. **Rode as verificações locais antes de abrir o PR** (dentro de `frontend/`):

   ```bash
   npm install
   npm run lint
   npm test
   npm run format
   ```

4. **Abra um Pull Request para `main`** descrevendo o que mudou e por quê.
   Preencha o template de PR, se houver, e vincule a issue relacionada
   (quando existir).

5. **Aguarde as aprovações.** Para o merge ser permitido, o PR precisa de:
   - **2 aprovações** de revisores;
   - aprovação do **code owner** responsável pela área alterada (ver
     [`.github/CODEOWNERS`](.github/CODEOWNERS));
   - todos os checks de CI passando (lint, testes, build);
   - todas as conversas do PR resolvidas.

6. **Não faça push forçado (`--force`) em branches compartilhadas.** Se
   precisar atualizar sua branch com a `main`, prefira `git merge main` ou
   `git rebase` apenas na sua própria branch, antes de o PR ser revisado.

7. **Após o merge**, a branch de origem é apagada automaticamente. Delete a
   cópia local:

   ```bash
   git checkout main
   git pull
   git branch -d feature/nome-da-feature
   ```

## Convenção de nomes de branch

| Prefixo     | Uso                                   |
|-------------|----------------------------------------|
| `feature/`  | Nova funcionalidade                    |
| `fix/`      | Correção de bug                        |
| `chore/`    | Manutenção, dependências, configuração |
| `docs/`     | Alterações apenas de documentação      |

## Padrão de commits

Recomenda-se seguir o padrão [Conventional Commits](https://www.conventionalcommits.org/):

```
feat: adiciona filtro por período no calendário de campanhas
fix: corrige cálculo de orçamento restante
docs: atualiza instruções de instalação no README
```

## Dúvidas

Em caso de dúvida sobre o fluxo, abra uma issue ou fale com o mantenedor
responsável listado em [`.github/CODEOWNERS`](.github/CODEOWNERS).
