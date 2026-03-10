
FROM maven:3.9.5-eclipse-temurin-17 AS builder

LABEL MAINTAINER="suporte.weunite@gmail.com"

WORKDIR /app

COPY . .

RUN mvn clean package -DskipTests

FROM eclipse-temurin:17-jdk

WORKDIR /app

COPY --from=builder /app/target/*.jar weunite-backend.jar

EXPOSE 8080

CMD ["java", "-jar", "weunite-backend.jar"]