# ============================================================
# Stage 1: Build the Spring Boot JAR
# ============================================================
FROM eclipse-temurin:21-jdk-alpine AS build

WORKDIR /app

# Copy Maven wrapper and pom first (for dependency caching)
COPY .mvn/ .mvn/
COPY mvnw pom.xml ./

# Make mvnw executable and download dependencies (cached layer)
RUN chmod +x mvnw && ./mvnw dependency:go-offline -B

# Copy source code and build the JAR (skip tests for faster CI builds)
COPY src ./src
RUN ./mvnw package -DskipTests -B

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
