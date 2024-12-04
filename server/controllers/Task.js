const models = require('../models');

const { Task } = models;

// CREATE/GET/UPDATE/DELETE TASKS

const homePage = (req, res) => res.render('app');

// get all tasks
const getTasks = async (req, res) => {
  try {
    const query = { owner: req.session.account._id };
    const docs = await Task.find(query).select('title dueDate description').lean().exec();

    return res.json({ tasks: docs });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ error: 'Error retrieving tasks!' });
  }
};

// make a task
const makeTask = async (req, res) => {
  if (!req.body.title) {
    return res.status(400).json({ error: 'Title is required!' });
  }

  const taskData = {
    title: req.body.title,
    description: req.body.description,
    completed: req.body.completed,
    dueDate: req.body.dueDate,
    owner: req.session.account._id,
  };

  try {
    const newTask = new Task(taskData);
    await newTask.save();
    return res.status(201).json({
      title: newTask.title,
      description: newTask.description,
      completed: newTask.completed,
      dueDate: newTask.dueDate,
    });
  } catch (err) {
    console.log(err);
    if (err.code === 11000) {
      return res.status(400).json({ error: 'Task already exists!' });
    }
    return res.status(500).json({ error: 'An error occured making task!' });
  }
};

// DELETE a task
const deleteTask = async (req, res) => {
  const ownerId = req.session.account._id;
  const taskId = req.params.id;

  try {
    const task = await Task.findOneAndDelete({ _id: taskId, owner: ownerId });

    if (!task) {
      return res.status(404).json({ error: 'Task not found' });
    }

    return res.status(200).json({ message: 'Task deleted successfully' });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ error: 'Failed to delete task' });
  }
};

// Get a task by its ID
const getTaskById = async (req, res) => {
  const taskId = req.params.id;
  const ownerId = req.session.account._id;

  try {
    const task = await Task.findOne({ _id: taskId, ownerId });

    if (!task) {
      return res.status(404).json({ error: 'Task not found' });
    }

    return res.status(200).json(task);
  } catch (err) {
    console.log(err);
    return res.status(500).json({ error: 'Failed to fetch task' });
  }
};

// Update an individual task
const updateTask = async (req, res) => {
  const taskId = req.params.id;
  const ownerId = req.session.account._id;

  try {
    const updatedTask = await Task.findOneAndUpdate(
      { _id: taskId, owner: ownerId }, 
      { $set: req.body },             
      { new: true, runValidators: true } 
    );

    if (!updatedTask) {
      return res.status(404).json({ error: 'Task not found' });
    }

    return res.status(200).json(updatedTask);
  }
  catch (err) {
    console.log(err);
    return res.status(500).json({error: 'Failed to update task'});
  }
};

module.exports = {
  homePage,
  makeTask,
  getTasks,
  deleteTask,
  getTaskById,
  updateTask
};
