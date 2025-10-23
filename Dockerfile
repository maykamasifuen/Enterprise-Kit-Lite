# ----------------------------
# Stage 1: Build Angular Frontend
# ----------------------------
FROM node:20-alpine AS frontend
WORKDIR /app
COPY enterprise-starter-kit-frontend/package*.json ./
RUN npm ci --legacy-peer-deps
COPY enterprise-starter-kit-frontend/ ./
RUN npm run build -- --configuration production

# ----------------------------
# Stage 2: Build Spring Boot Backend (Java 25)
# ----------------------------
FROM maven:3.9-eclipse-temurin-25-alpine AS backend
WORKDIR /app

COPY enterprise-starter-kit/pom.xml ./
COPY enterprise-starter-kit/src ./src

# Copy the Angular build output into Spring Boot static resources.
COPY --from=frontend /app/dist/ /tmp/dist/
RUN set -eux; \
    mkdir -p /app/src/main/resources/static; \
    if ls -d /tmp/dist/*/browser >/dev/null 2>&1; then \
      cp -a /tmp/dist/*/browser/. /app/src/main/resources/static/; \
    else \
      cp -a /tmp/dist/*/. /app/src/main/resources/static/; \
    fi

RUN mvn clean package -Dmaven.test.skip=true

# ----------------------------
# Stage 3: Final Runtime Image (Java 25)
# ----------------------------
FROM eclipse-temurin:25-jre-alpine

LABEL maintainer="Mayk Enterprise Kit"
LABEL version="4.0.0"
LABEL description="Mayk Enterprise Starter Kit with RTL Support"

WORKDIR /app

# Add non-root user for security
RUN addgroup -S appgroup && adduser -S appuser -G appgroup

COPY --from=backend /app/target/*.jar app.jar

# Change ownership to non-root user
RUN chown -R appuser:appgroup /app

USER appuser

EXPOSE 8080

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=60s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:8080/actuator/health || exit 1

ENTRYPOINT ["sh", "-c", "java -Dspring.profiles.active=${SPRING_PROFILES_ACTIVE:-prod} -jar app.jar"]
