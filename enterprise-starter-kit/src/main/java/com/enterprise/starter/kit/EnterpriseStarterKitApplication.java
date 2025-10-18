package com.enterprise.starter.kit;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cache.annotation.EnableCaching;
import org.springframework.scheduling.annotation.EnableScheduling;

/// Main entry point for the Mayk Enterprise Kit (Lite) application.
@SpringBootApplication
@EnableScheduling
@EnableCaching
public class EnterpriseStarterKitApplication {

    public static void main(String[] args) {
        System.setProperty("spring.main.lazy-initialization", "true");
        SpringApplication.run(EnterpriseStarterKitApplication.class, args);
    }

}
