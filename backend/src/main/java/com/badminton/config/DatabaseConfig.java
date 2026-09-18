package com.badminton.config;

import com.zaxxer.hikari.HikariDataSource;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Primary;

import javax.sql.DataSource;
import java.net.URI;

@Configuration
public class DatabaseConfig {

    @Value("${spring.datasource.url}")
    private String rawUrl;

    @Value("${spring.datasource.username:}")
    private String username;

    @Value("${spring.datasource.password:}")
    private String password;

    @Bean
    @Primary
    public DataSource dataSource() {
        HikariDataSource ds = new HikariDataSource();

        if (rawUrl != null && rawUrl.startsWith("mysql://")) {
            try {
                URI uri = new URI(rawUrl);
                String host = uri.getHost();
                int port = uri.getPort() == -1 ? 3306 : uri.getPort();
                String path = uri.getPath() != null ? uri.getPath() : "/defaultdb";
                String query = uri.getQuery();

                String jdbcUrl = "jdbc:mysql://" + host + ":" + port + path;
                if (query != null && !query.isBlank()) {
                    jdbcUrl += "?" + query;
                }
                ds.setJdbcUrl(jdbcUrl);

                String userInfo = uri.getUserInfo();
                if (userInfo != null && userInfo.contains(":")) {
                    String[] parts = userInfo.split(":", 2);
                    ds.setUsername(parts[0]);
                    ds.setPassword(parts[1]);
                } else {
                    ds.setUsername(username);
                    ds.setPassword(password);
                }
            } catch (Exception e) {
                ds.setJdbcUrl("jdbc:" + rawUrl);
                ds.setUsername(username);
                ds.setPassword(password);
            }
        } else {
            ds.setJdbcUrl(rawUrl);
            ds.setUsername(username);
            ds.setPassword(password);
        }

        ds.setDriverClassName("com.mysql.cj.jdbc.Driver");
        return ds;
    }
}