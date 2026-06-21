package com.surajupadhye.interviewquestbackend.config;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Component;

@Component
public class DatabaseMigrationRunner implements CommandLineRunner {

    @Autowired
    private JdbcTemplate jdbcTemplate;

    @Override
    public void run(String... args) throws Exception {
        System.out.println("Executing custom database schema migrations...");
        try {
            // Drop not null constraint on assessment_attempts.topic
            jdbcTemplate.execute("ALTER TABLE assessment_attempts ALTER COLUMN topic DROP NOT NULL");
            System.out.println("Migration success: assessment_attempts.topic is now nullable.");
        } catch (Exception e) {
            System.out.println("Migration warning on assessment_attempts: " + e.getMessage());
        }

        try {
            // Drop not null constraint on questions.topic
            jdbcTemplate.execute("ALTER TABLE questions ALTER COLUMN topic DROP NOT NULL");
            System.out.println("Migration success: questions.topic is now nullable.");
        } catch (Exception e) {
            System.out.println("Migration warning on questions topic nullable: " + e.getMessage());
        }
    }
}
