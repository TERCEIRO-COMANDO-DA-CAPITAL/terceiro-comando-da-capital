# ScriptKey Manager - Vercel Ready

Este projeto foi configurado para ser implantado no Vercel com suporte completo a Discord OAuth e Upstash Redis.

## Configuração do Vercel

1.  **Importe o projeto no Vercel**: Conecte seu repositório GitHub/GitLab.
2.  **Variáveis de Ambiente**: No painel do Vercel, adicione as seguintes variáveis:
    -   `DISCORD_CLIENT_ID`: Seu ID de cliente do Discord.
    -   `DISCORD_CLIENT_SECRET`: Seu segredo de cliente do Discord.
    -   `UPSTASH_REDIS_REST_URL`: URL do seu banco Upstash.
    -   `UPSTASH_REDIS_REST_TOKEN`: Token do seu banco Upstash.
    -   `SESSION_SECRET`: Uma string aleatória para segurança da sessão.
    -   `APP_URL`: A URL do seu projeto no Vercel (ex: `https://meu-projeto.vercel.app`).

3.  **Discord Developer Portal**:
    -   Vá para [Discord Developer Portal](https://discord.com/developers/applications).
    -   Em **OAuth2 > Redirects**, adicione: `https://sua-url-do-vercel.app/auth/callback`.

## Funcionalidades

-   **Login Discord**: Autenticação segura via OAuth2.
-   **Upstash Redis**: Armazenamento em tempo real de chaves de acesso.
-   **Dashboard**: Monitoramento de chaves ativas, expiradas e usuários únicos.
-   **Gerenciador de Chaves**: Geração de chaves com expiração customizada.

## Estrutura do Projeto

-   `server.ts`: Servidor Express com integração Vite.
-   `src/App.tsx`: Frontend React com Tailwind CSS e Motion.
-   `vercel.json`: Configuração de build e roteamento para Vercel.
