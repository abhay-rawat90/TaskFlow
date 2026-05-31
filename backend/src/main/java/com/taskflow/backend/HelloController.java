package com.taskflow.backend;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class HelloController {

    @GetMapping("/api/status")
    public String checkStatus() {
        return "TaskFlow SpringBoot Backend is running!";
    }
}
