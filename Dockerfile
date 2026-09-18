# Stage 1: Build JAR
FROM maven:3.9.6-eclipse-temurin-17-alpine AS build
WORKDIR /app

# Copy files
COPY . .

# Handle both root build context and backend build context
RUN if [ -d "backend" ]; then \
      cp backend/pom.xml ./pom.xml && \
      cp -r backend/src ./src; \
    fi && \
    mvn clean package -DskipTests

# Stage 2: Run application
FROM eclipse-temurin:17-jre-alpine
WORKDIR /app
COPY --from=build /app/target/*.jar app.jar
EXPOSE 8080
ENV JAVA_OPTS="-Xms128m -Xmx384m"
ENTRYPOINT ["sh", "-c", "java $JAVA_OPTS -jar app.jar"]