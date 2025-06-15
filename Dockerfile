# 1. Imagem base com Node.js
FROM node:18-alpine

# 2. Diretório de trabalho dentro do container
WORKDIR /app

# 3. Copia package.json e package-lock.json (se tiver)
COPY package*.json ./

# 4. Instala as dependências
RUN npm install

# 5. Copia todo o código fonte
COPY . .

# 6. Compila o TypeScript para JavaScript
RUN npm run build

# 7. Expõe a porta que o servidor vai rodar
EXPOSE 3333

# 8. Comando para rodar a aplicação compilada
CMD ["npm", "start"]