# ============================================
# Offline Backend Dockerfile
# Node.js Alpine + espeak-ng for local TTS
# ============================================

FROM node:18-alpine

# Install espeak-ng for offline text-to-speech
RUN apk add --no-cache espeak-ng

WORKDIR /app

# Cache dependencies
COPY package.json ./
RUN npm install --production

# Copy source
COPY . .

# Non-root user
RUN addgroup -S appgroup && adduser -S appuser -G appgroup && chown -R appuser:appgroup /app
USER appuser

EXPOSE 8080

CMD ["node", "server.js"]
