package com.taskflow.backend.service;

import com.taskflow.backend.model.Task;
import com.taskflow.backend.repository.TaskRepository;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

@Service
public class TaskService {

    private final TaskRepository taskRepository;

    public TaskService(TaskRepository taskRepository) {
        this.taskRepository = taskRepository;
    }

    public List<Task> getTasksForUser(String username) {
        return taskRepository.findByUser_Username(username);
    }

    public Task createTask(Task task)
    {
        return taskRepository.save(task);
    }

    public Task updateTask(Long id, Task updatedTask) {
        return taskRepository.findById(id).map(task -> {
            task.setTitle(updatedTask.getTitle());
            task.setCompleted(updatedTask.isCompleted());
            return taskRepository.save(task);
                }).orElseThrow(() -> new RuntimeException("Task Not Found"));
    }

    public void deleteTask(Long id) {
        taskRepository.deleteById(id);
    }
}
