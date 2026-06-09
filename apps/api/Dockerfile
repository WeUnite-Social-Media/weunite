FROM maven:3.9.5-eclipse-temurin-17 AS dev

WORKDIR /workspace

EXPOSE 8080

CMD ["mvn", "spring-boot:run", "-Dspring-boot.run.fork=true"]

FROM maven:3.9.5-eclipse-temurin-17 AS builder

WORKDIR /workspace

COPY pom.xml .
RUN mvn -B dependency:go-offline

COPY src ./src
RUN mvn -B clean package -DskipTests

FROM eclipse-temurin:17-jre

WORKDIR /app

RUN groupadd --system spring && useradd --system --gid spring spring

COPY --from=builder /workspace/target/*.jar app.jar

USER spring:spring

EXPOSE 8080

ENTRYPOINT ["java", "-jar", "/app/app.jar"]
