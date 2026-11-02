FROM node:24-bookworm-slim
WORKDIR /opt/app
COPY package*.json ./
RUN npm ci --omit=dev --no-audit --no-fund
COPY . .
RUN npm run build
EXPOSE 1337
CMD ["npm", "run", "start"]
