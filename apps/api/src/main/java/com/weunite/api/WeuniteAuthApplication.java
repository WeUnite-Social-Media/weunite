package com.weunite.api;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableAsync;

@SpringBootApplication
@EnableAsync
public class WeuniteAuthApplication {

  public static void main(String[] args) {
    SpringApplication.run(WeuniteAuthApplication.class, args);
  }
}
