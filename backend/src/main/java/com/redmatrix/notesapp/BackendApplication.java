package com.redmatrix.notesapp;

import java.util.TimeZone;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.ConfigurableApplicationContext;
import org.springframework.scheduling.annotation.EnableScheduling;

/**
 * RedMatrix Notes Application
 * A simple full-stack notes management system built with Spring Boot and React
 * 
 * @author RedMatrix Team
 * @version 1.0
 */
@SpringBootApplication
@EnableScheduling
public class BackendApplication {

    private static final Logger logger = LoggerFactory.getLogger(BackendApplication.class);

    public static void main(String[] args) {
        // Force JVM to use UTC timezone to ensure consistent timestamp handling
        TimeZone.setDefault(TimeZone.getTimeZone("UTC"));
        logger.info("JVM timezone set to UTC");
        
        logger.info("Starting RedMatrix Notes Application...");
        
        ConfigurableApplicationContext context = SpringApplication.run(BackendApplication.class, args);
        
        String port = context.getEnvironment().getProperty("server.port", "8080");
        logger.info("RedMatrix Notes Application started successfully on port {}", port);
        logger.info("Access the API at: http://localhost:{}/api/notes", port);
    }

}