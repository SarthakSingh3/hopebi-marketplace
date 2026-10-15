package com.hopebi.marketplace;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.data.jpa.repository.config.EnableJpaAuditing;

import java.net.URI;

@SpringBootApplication
@EnableJpaAuditing
public class MarketplaceApplication {

    public static void main(String[] args) {
        normalizeCloudDatabaseUrl();
        SpringApplication.run(MarketplaceApplication.class, args);
    }

    private static void normalizeCloudDatabaseUrl() {
        String dbUrl = System.getenv("SPRING_DATASOURCE_URL");
        if (dbUrl == null || dbUrl.isBlank()) {
            dbUrl = System.getenv("DATABASE_URL");
        }
        if (dbUrl != null && !dbUrl.isBlank() && !dbUrl.startsWith("jdbc:")) {
            try {
                String clean = dbUrl;
                if (clean.startsWith("postgres://")) {
                    clean = "http://" + clean.substring("postgres://".length());
                } else if (clean.startsWith("postgresql://")) {
                    clean = "http://" + clean.substring("postgresql://".length());
                }
                URI uri = new URI(clean);
                if (uri.getUserInfo() != null) {
                    String[] creds = uri.getUserInfo().split(":", 2);
                    if (creds.length > 0 && !creds[0].isBlank()) {
                        System.setProperty("spring.datasource.username", creds[0]);
                    }
                    if (creds.length > 1 && !creds[1].isBlank()) {
                        System.setProperty("spring.datasource.password", creds[1]);
                    }
                }
                int port = uri.getPort() > 0 ? uri.getPort() : 5432;
                String host = uri.getHost();
                String path = uri.getPath();
                if (host != null && path != null) {
                    System.setProperty("spring.datasource.url", "jdbc:postgresql://" + host + ":" + port + path);
                }
            } catch (Exception e) {
                System.setProperty("spring.datasource.url", "jdbc:" + dbUrl);
            }
        }
    }
}
