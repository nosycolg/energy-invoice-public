# Use uma imagem Node.js mais recente
FROM node:20-alpine

# Define o diretório de trabalho
WORKDIR /app

# Copia os arquivos de dependências
COPY package.json pnpm-lock.yaml ./
COPY tsconfig.json ./

# Ativa pnpm via Corepack e instala dependências com lockfile
RUN corepack enable && corepack prepare pnpm@9.15.9 --activate
RUN pnpm install --frozen-lockfile

# Copia o restante dos arquivos do projeto
COPY . .

# Build da aplicação
RUN pnpm run build

# Ambiente de produção e porta
ENV NODE_ENV=production
ENV PORT=4123

# Expõe a porta 4123
EXPOSE 4123

# Comando para iniciar a aplicação Next.js
CMD ["pnpm", "run", "start"]