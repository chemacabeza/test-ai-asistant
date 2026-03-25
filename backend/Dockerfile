# ============================================
# Backend Dockerfile — Multi-stage build
# Stage 1: Maven build with JDK
# Stage 2: Lightweight JRE runtime
# ============================================

# --- Build stage ---
FROM maven:3.9-eclipse-temurin-17 AS build
WORKDIR /app

# Cache dependencies first — increase retries for unstable connections
COPY pom.xml .
RUN mvn dependency:go-offline -B -Dhttp.keepAlive=false -Dmaven.wagon.http.retryHandler.count=3

# Copy source and build
COPY src ./src
RUN mvn clean package -DskipTests -B

# --- Runtime stage ---
FROM eclipse-temurin:17-jre-alpine
WORKDIR /app

# Add non-root user
RUN addgroup -S appgroup && adduser -S appuser -G appgroup

COPY --from=build /app/target/*.jar app.jar

# Set ownership
RUN chown appuser:appgroup app.jar
USER appuser

EXPOSE 8080

ENTRYPOINT ["java", "-jar", "app.jar"]
