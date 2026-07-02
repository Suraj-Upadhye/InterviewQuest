# ============================================================
# Stage 1: Build the Spring Boot JAR using official Maven image
# (No mvnw needed — Maven is pre-installed in the base image)
# ============================================================
FROM maven:3.9.9-eclipse-temurin-21-alpine AS build

WORKDIR /app

# Copy pom.xml first for dependency caching
COPY pom.xml ./

# Download dependencies (cached layer — only re-runs if pom.xml changes)
RUN mvn dependency:go-offline -B

# Copy source code and build the JAR (skip tests for faster CI builds)
COPY src ./src
RUN mvn package -DskipTests -B

# ============================================================
# Stage 2: Run with lean JRE image (much smaller final image)
# ============================================================
FROM eclipse-temurin:21-jre-alpine

WORKDIR /app

# Copy the built JAR from the build stage
COPY --from=build /app/target/*.jar app.jar

# Render injects PORT env var — Spring reads it via server.port=${PORT:8080}
EXPOSE 8080

# Run the application
ENTRYPOINT ["java", "-Xms256m", "-Xmx512m", "-jar", "app.jar"]
