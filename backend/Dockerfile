# Stage 1: Build the application using Maven and Java 17
FROM maven:3.9.4-eclipse-temurin-17 AS build
WORKDIR /app

# Copy the pom.xml and source code
COPY pom.xml .
COPY src ./src

# Compile the code and skip tests to speed up deployment
RUN mvn clean package -DskipTests

# Stage 2: Create a lightweight runtime environment to run the app
FROM eclipse-temurin:17-jre-alpine
WORKDIR /app

# Copy the compiled .jar file from the build stage
COPY --from=build /app/target/*.jar app.jar

# Expose port 8080 (Render expects this by default)
EXPOSE 8080

# Boot up the Spring Boot application
ENTRYPOINT ["java", "-jar", "app.jar"]