package com.taskflow.backend.controller;

import com.taskflow.backend.model.Task;
import com.taskflow.backend.model.User;
import com.taskflow.backend.repository.UserRepository;
import com.taskflow.backend.service.TaskService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.List;

@RestController
@RequestMapping("/api/tasks")
public class TaskController {
    private final TaskService taskService;
    private final UserRepository userRepository;

    public TaskController(TaskService taskService, UserRepository userRepository) {
        this.taskService = taskService;
        this.userRepository = userRepository;
    }

    @GetMapping
    public List<Task> getTasks(Principal principal) {
        return taskService.getTasksForUser(principal.getName());
    }

    @PostMapping
    public Task createTask(@RequestBody Task task, Principal principal) {

        User loggedInUser = userRepository.findByUsername(principal.getName())
                .orElseThrow(() -> new UsernameNotFoundException("User Not found"));

        task.setUser(loggedInUser);
        return taskService.createTask(task);
    }

    @PutMapping("/{id}")
    public Task updateTask(@PathVariable Long id, @RequestBody Task task) {
        return taskService.updateTask(id,task);
    }

    @DeleteMapping("/{id}")
    public void deleteTask(@PathVariable Long id) {
        taskService.deleteTask(id);
    }
}
