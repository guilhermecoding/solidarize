# Solidarize

> *"Por trás de cada entrega, existe uma vida que importa. Gestão que transforma cuidado em impacto social."*

O **Solidarize** é uma plataforma de gestão de doações e assistência social criada para instituições de caridade e projetos solidários. Ele reúne em um só lugar o cadastro das famílias assistidas, o controle de estoque de alimentos e cestas básicas, o registro de entregas, a organização da equipe de voluntários e o acompanhamento de resultados por meio de indicadores e auditoria.

---

## Como o software funciona

O Solidarize acompanha toda a rotina da instituição, desde a chegada das doações até a entrega às famílias:

1. **Acesso controlado pela instituição**  
   Não há cadastro aberto ao público. Um administrador cadastra os integrantes da equipe, define o papel e o nível de permissão de cada pessoa e recebe uma senha inicial gerada automaticamente para repassar ao novo integrante.

2. **Entrada e organização dos alimentos**  
   Os alimentos doados são cadastrados no estoque por categoria, informando quantidade, marca, código do produto e data de validade. Cada entrada recebe automaticamente um código de lote único, facilitando o controle de validade e evitando desperdícios.

3. **Montagem de cestas básicas**  
   A equipe pode criar modelos padrão de cesta e montar cestas prontas com base nesses modelos ou com itens escolhidos no momento. Ao registrar novas cestas, os alimentos utilizados são descontados automaticamente do estoque e cada registro recebe uma identificação própria com a data e a numeração sequencial do dia.

4. **Cadastro completo das famílias**  
   Cada família atendida possui uma ficha com os dados do titular, composição familiar, situação socioeconômica, tipo de auxílio, dia previsto para entrega no mês, situação do cadastro (*Aprovado* ou *Não Aprovado*) e os membros da equipe responsáveis por acompanhá-la.

5. **Retirada e entrega organizada**  
   - Na gestão, administradores podem registrar a retirada de cestas ou de alimentos avulsos para famílias aprovadas — ou, em situações excepcionais, para pessoas não cadastradas mediante justificativa obrigatória.
   - No dia a dia em campo, os voluntários acessam a área **Para Você** para retirar cestas destinadas exclusivamente às famílias sob sua responsabilidade, com controle automático que limita a retirada a **1 cesta por mês por família**.

6. **Acompanhamento de impacto e transparência**  
   Todas as entradas, saídas, entregas e ações administrativas alimentam automaticamente o painel de indicadores, os históricos de movimentação e o registro de auditoria.

---

## Perfis de acesso

A plataforma adapta os menus e ações disponíveis conforme o perfil e a permissão de cada pessoa:

| Perfil | Permissão | O que pode fazer |
| :--- | :--- | :--- |
| **Membro** | Padrão | Acessa a área **Para Você** para consultar suas famílias vinculadas, visualizar o histórico de entregas e registrar a retirada de cestas para elas. |
| **Administrador** | **Leitura** | Além da área **Para Você**, visualiza todos os módulos da área **Gestão** (Indicadores, Beneficiários, Cestas e Alimentos, Membros e Auditoria), sem alterar registros. |
| **Administrador** | **Total** | Possui controle completo da área **Gestão**: cadastra, edita e exclui registros, gerencia a equipe e senhas, monta cestas, controla o estoque e registra retiradas administrativas. |

Além das permissões, cada conta pode estar **Ativa** ou **Inativa**, permitindo à administração suspender ou reativar o acesso de um integrante a qualquer momento.

---

## Funcionalidades

### Tela inicial e experiência de uso
- **Boas-vindas personalizadas**: saudação conforme o horário do dia, mensagens inspiradoras sobre solidariedade e cartões de atalho organizados de acordo com o acesso do usuário.
- **Uso no computador e no celular**: interface adaptada para telas grandes e dispositivos móveis, facilitando o acompanhamento durante as entregas.
- **Acesso rápido no celular**: o Solidarize é um site que pode ser adicionado à tela inicial do celular, abrindo em tela cheia como um aplicativo, sem precisar baixar em lojas de aplicativos.
- **Personalização de tema**: alternância entre os modos **Claro**, **Escuro** ou automático conforme a configuração do aparelho.
- **Aviso de conexão**: caso o aparelho fique sem acesso à internet, a plataforma exibe uma tela amigável orientando a verificação da conexão e oferecendo tentativa rápida de reconexão.

---

### Área "Para Você"
Espaço dedicado à rotina de cada voluntário ou administrador com as famílias que acompanha diretamente:

- **Minhas Famílias**
  - Listagem das famílias vinculadas ao usuário, com busca por nome ou CPF e indicação da quantidade de familiares no cadastro.
  - **Ficha da família**: exibe todas as informações do titular (contatos, endereço, situação, tipo de auxílio, dia previsto para entrega, observações), os membros da família e os demais integrantes da equipe que também assistem aquela família.
  - **Histórico de entregas**: linha do tempo agrupada por mês com todas as cestas entregues àquela família, detalhando quantidade, identificação da cesta, modelo, data e quem fez a retirada.
- **Retirar Cesta**
  - Fluxo guiado em **2 etapas** (escolha de uma cesta disponível em estoque e confirmação) para famílias aprovadas vinculadas ao usuário.
  - **Controle mensal automático**: limita a retirada a 1 cesta por família a cada mês e sinaliza visualmente quem já recebeu no mês atual (*"Já recebeu neste mês"*), prevenindo entregas duplicadas.

---

### Área "Gestão"
Central administrativa voltada à coordenação, ao planejamento e à prestação de contas da instituição:

#### Indicadores
Painel visual interativo que transforma os registros do dia a dia em informações claras para tomada de decisão:
- **Cartões de resumo**: famílias ativas e total de pessoas assistidas; cestas entregues no mês com variação em relação ao mês anterior; cestas prontas em estoque (com alerta quando a quantidade está abaixo da demanda das famílias pendentes); e alertas de validade.
- **Pontos de atenção**: atalhos diretos para lotes vencidos ou próximos do vencimento, entregas atrasadas no mês e famílias aprovadas ainda sem assistente vinculado.
- **Visão Geral**: evolução mensal de entregas (cestas e alimentos avulsos) nos últimos 6 meses, progresso das entregas no mês atual (*Já receberam*, *No prazo*, *Em atraso* e *Sem dia definido*), características das famílias ativas e distribuição por bairro.
- **Beneficiários**: distribuição geográfica por bairro, perfil de vulnerabilidade (famílias com crianças, idosos, pessoas com deficiência, pagamento de aluguel e desemprego), tipos de auxílio, faixa etária dos assistidos e proporção entre cadastros aprovados e não aprovados.
- **Entregas e Equipe**: previsão de entregas ao longo do mês (visualização por semana ou por dia, de 1 a 31), comparativo entre cestas montadas e entregues, proporção entre beneficiários cadastrados e retiradas avulsas, carga de famílias por assistente e classificação dos membros com mais entregas no mês.
- **Estoque**: quantidade disponível por categoria de alimento (apontando categorias sem estoque), saúde de validade dos lotes, fluxo mensal de entradas e saídas de alimentos, cestas disponíveis por modelo e lista prioritária de lotes vencidos ou que vencem em até 7 dias.

#### Beneficiários
- Busca rápida por nome ou CPF, cadastro, consulta completa e edição das famílias atendidas.
- **Dados do titular**: nome completo, CPF (opcional, validado para evitar duplicidades), e-mail, múltiplos telefones de contato, endereço completo, data de nascimento com cálculo automático de idade, gênero, estado civil, situação de trabalho e profissão, pagamento de aluguel, presença de deficiência, tipo de auxílio (*Cesta Básica*, *Auxílio Financeiro*, *Auxílio Medicamento* ou *Outra Ajuda*), dia previsto de entrega no mês, situação (*Aprovado* ou *Não Aprovado*) e observações.
- **Composição familiar**: registro de dependentes e familiares vinculados ao titular com grau de parentesco e dados complementares.
- **Assistentes vinculados**: definição de quais membros da equipe acompanham cada família.

#### Cestas e Alimentos
Módulo dividido entre **Cestas de Alimentação** e **Alimentos** para controle completo do inventário solidário:
- **Modelos de Cesta**: criação, edição e exclusão de composições padrão de cesta para agilizar montagens recorrentes.
- **Montagem e listagem de Cestas**: criação de novas cestas com base em modelos prontos ou itens avulsos, com identificação sequencial diária automática e desconto imediato dos alimentos usados no estoque; listagem com os itens de cada cesta e saldo disponível.
- **Cadastro e inventário de Alimentos**: organização em **15 categorias** (*Arroz, Feijão, Massas, Farinhas, Frutas, Verduras e Legumes, Carnes e Ovos, Leites e Derivados, Açúcar, Óleo, Sal, Café, Biscoitos, Temperos e Bebidas*), com marca, código do produto, validade, quantidade e código de lote gerado automaticamente. A listagem separa a visão **Geral** da aba **Vencendo**, destacando itens vencidos ou com vencimento nos próximos 7 dias.
- **Retirada administrativa (Cestas e Alimentos)**: fluxo guiado em **3 etapas** (seleção dos itens e quantidades, escolha do destinatário e revisão final), atendendo tanto beneficiários cadastrados e aprovados quanto retiradas avulsas (beneficiário não listado) mediante justificativa obrigatória.
- **Históricos completos**: registro diário separado para cestas e para alimentos, detalhando entradas, saídas, retiradas, ajustes manuais, justificativas, exclusões e o responsável por cada movimentação.

#### Membros
- Busca por nome ou CPF, listagem e edição de toda a equipe da instituição, com dados pessoais, contato, endereço, papel, permissão e situação do acesso (*Ativo* ou *Inativo*).
- **Credenciais iniciais**: ao cadastrar um novo integrante, a plataforma gera automaticamente uma senha inicial e exibe os dados de acesso para o administrador compartilhar.
- **Controle de senhas e proteções**: redefinição de senha com encerramento imediato dos acessos anteriores do usuário; travas de segurança impedem que um administrador exclua a própria conta, retire os próprios privilégios por engano ou deixe a instituição sem ao menos um administrador.

#### Auditoria e Segurança
- **Trilha de auditoria**: histórico agrupado por dia e filtrável por categoria (*Todos*, *Membros*, *Beneficiários* e *Autenticação*), registrando cadastros, edições, exclusões, redefinições de senha, ativações ou desativações de acesso e eventos de entrada na plataforma — indicando o que aconteceu, quando e quem realizou a ação.
- **Confirmação para ações sensíveis**: exclusões (de beneficiários, membros, alimentos, cestas ou modelos) e redefinições de senha exigem a confirmação da senha do administrador.
- **Proteção no acesso**: bloqueio temporário automático diante de múltiplas tentativas incorretas de entrada.

---

## Sobre o projeto

- **Autor**: João Guilherme Araújo Viana — [LinkedIn](https://www.linkedin.com/in/jo%C3%A3o-guilherme-ara%C3%BAjo-viana/) · [GitHub](https://github.com/guilhermecoding) · [E-mail](mailto:joaoguilhermearaujo1617@gmail.com)
- **Licença**: Distribuído sob a licença MIT.
