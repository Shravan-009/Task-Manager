const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
// Serve static frontend files from the same directory
app.use(express.static(path.join(__dirname, '/')));

const fs = require('fs');

// Initialize local JSON storage
const dataFile = path.join(__dirname, 'tasks.json');
if (!fs.existsSync(dataFile)) {
    fs.writeFileSync(dataFile, '[]');
}

const getTasks = () => JSON.parse(fs.readFileSync(dataFile));
const saveTasks = (tasks) => fs.writeFileSync(dataFile, JSON.stringify(tasks, null, 2));

console.log("Using local JSON storage instead of MongoDB");

// API Endpoints
// Get all tasks
app.get('/api/todos', (req, res) => {
    try {
        res.json(getTasks());
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Add a task
app.post('/api/todos', (req, res) => {
    try {
        const tasks = getTasks();
        const newTask = {
            _id: Date.now().toString(),
            task: req.body.task,
            complete: req.body.complete || false
        };
        tasks.push(newTask);
        saveTasks(tasks);
        res.status(201).json(newTask);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// Toggle completion status
app.put('/api/todos/:id', (req, res) => {
    try {
        const tasks = getTasks();
        const taskIndex = tasks.findIndex(t => t._id === req.params.id);
        if (taskIndex === -1) return res.status(404).json({ message: "Task not found" });

        tasks[taskIndex].complete = !tasks[taskIndex].complete;
        saveTasks(tasks);
        res.json(tasks[taskIndex]);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// Delete a single task
app.delete('/api/todos/:id', (req, res) => {
    try {
        let tasks = getTasks();
        const taskIndex = tasks.findIndex(t => t._id === req.params.id);
        if (taskIndex === -1) return res.status(404).json({ message: "Task not found" });

        tasks.splice(taskIndex, 1);
        saveTasks(tasks);
        res.json({ message: "Task deleted successfully" });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Delete all tasks
app.delete('/api/todos', (req, res) => {
    try {
        saveTasks([]);
        res.json({ message: "All tasks deleted successfully" });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Delete completed tasks
app.post('/api/todos/delete-completed', (req, res) => {
    try {
        let tasks = getTasks();
        tasks = tasks.filter(t => !t.complete);
        saveTasks(tasks);
        res.json({ message: "Completed tasks deleted successfully" });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

const PORT = process.env.PORT || 80;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
