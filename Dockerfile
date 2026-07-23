FROM node:20-bookworm-slim

WORKDIR /app

# Install dependencies dulu (biar layer cache npm install efisien)
COPY package*.json ./
RUN npm install --omit=dev

# Copy semua source code
COPY . .

# Folder upload harus ada saat container start
RUN mkdir -p public/uploads/covers public/uploads/pdf-temp

ENV PORT=3000
EXPOSE 3000

CMD ["npm", "start"]