# FROM node:23.8-slim

# USER node
# COPY . .
# WORKDIR /home/node/app

# CMD ["tail", "-f", "/dev/null"]

FROM node:20.5.1-slim

WORKDIR /home/node/app

# Definir ambiente
ENV NODE_ENV=development

# Copiar apenas os arquivos de dependências primeiro
COPY package.json yarn.lock ./

# Instalar as dependências no container (garantindo arquitetura correta)
RUN yarn install --frozen-lockfile

# Copiar o código fonte (node_modules será ignorado pelo .dockerignore)
COPY . .

# Ajustar permissões
RUN chown -R node:node /home/node/app

# Mudar para usuário node
USER node

CMD ["yarn", "start"]
