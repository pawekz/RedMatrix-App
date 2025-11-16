# Build stage
FROM maven:3.9-eclipse-temurin-21 AS build
WORKDIR /app
COPY . .
RUN mvn clean package -DskipTests


# Run stage
FROM eclipse-temurin:21-jre-alpine
WORKDIR /app

# Create non-root user/group with fixed UID/GID
RUN addgroup -S app && adduser -S app -G app -u 10001

# Copy JAR from build stage
COPY --from=build /app/target/*.jar app.jar

# Copy SSL Certificate (azure)
#COPY DigiCertGlobalRootCA.crt.pem /app/DigiCertGlobalRootCA.crt.pem

# Copy SSL Certificate (DigitalOcean) and trust it system-wide
COPY ca-certificate.crt /tmp/ca-certificate.crt
RUN keytool -importcert -noprompt \
	-alias digitalocean-ca \
	-file /tmp/ca-certificate.crt \
	-keystore $JAVA_HOME/lib/security/cacerts \
	-storepass changeit \
 && rm /tmp/ca-certificate.crt

# Set environment variables (if you want to use a specific profile, e.g., prod)
#ENV SPRING_PROFILES_ACTIVE=prod
#ENV SPRING_PROFILES_ACTIVE=azure
ENV JAVA_TOOL_OPTIONS="-XX:+ExitOnOutOfMemoryError -XX:MaxRAMPercentage=75.0 -XX:ActiveProcessorCount=2 -Dfile.encoding=UTF-8 -Djava.security.egd=file:/dev/urandom"

RUN chown -R app:app /app
USER app:app

# Expose port
EXPOSE 8080
ENV WEBSITES_PORT=8080

# Run the application
ENTRYPOINT ["java", "-Dserver.port=8080", "-jar", "app.jar"]
