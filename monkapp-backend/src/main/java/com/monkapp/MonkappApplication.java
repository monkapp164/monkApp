package com.monkapp;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableAsync;

@SpringBootApplication
@EnableAsync
public class MonkappApplication {
    public static void main(String[] args) {
        SpringApplication.run(MonkappApplication.class, args);
    }
}
