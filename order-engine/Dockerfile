# Use lightweight Node image
FROM node:20-alpine

# Set working directory
WORKDIR /app

# Copy dependency files and install
COPY package*.json ./
RUN npm install

# Copy source code
COPY . .

# Explicitly ensure tsc is executable (prevents permission denied)
RUN chmod +x ./node_modules/.bin/tsc

# Compile TypeScript -> JavaScript
RUN npx tsc

# Expose your app port
EXPOSE 3000

# Run compiled server
CMD ["node", "dist/index.js"]
