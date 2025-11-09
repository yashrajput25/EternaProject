# Dockerfile
FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

# Compile TypeScript → JavaScript
RUN npm run build

EXPOSE 3000

# Run the compiled code, not .ts
CMD ["node", "dist/index.js"]
