package com.surajupadhye.interviewquestbackend;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableAsync;

@SpringBootApplication
@EnableAsync
public class InterviewquestbackendApplication {

	public static void main(String[] args) {
		SpringApplication.run(InterviewquestbackendApplication.class, args);
	}

}
