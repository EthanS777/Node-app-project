const helper = require('./helper.js');
const React = require('react');
const { useState, useEffect } = React;
const { createRoot } = require('react-dom/client');

// component to render the left placeholder ads
const LeftPlaceholders = () => (
  <div className="leftPlaceholders">
    <img src="/assets/img/PlaceholderAd.png" />
    <img src="/assets/img/PlaceholderAd.png" />
    <img src="/assets/img/PlaceholderAd.png" />
  </div>
);

// component to render the right placeholder ads
const RightPlaceholders = () => (
  <div className="rightPlaceholders">
    <img src="/assets/img/PlaceholderAd.png" />
    <img src="/assets/img/PlaceholderAd.png" />
    <img src="/assets/img/PlaceholderAd.png" />
  </div>
);

// component to render the TASK FORM (title, description, due date)
// props: pass in new task state, input change/create task functions
const TaskForm = ({newTask, handleInputChange, handleCreateTask}) => (
  <form className="task-form" onSubmit={handleCreateTask}>
    <input
      type="text"
      name="title"
      placeholder="Task Title"
      value={newTask.title}
      onChange={handleInputChange}
      className="task-input task-title-input"
    />
    <textarea
      name="description"
      placeholder="Task Description"
      value={newTask.description}
      onChange={handleInputChange}
      className="task-input task-description-input"
    />
    <input
      type="date"
      name="dueDate"
      value={newTask.dueDate}
      onChange={handleInputChange}
      className="task-input task-date-input"
    />
    <button type="submit" className="task-submit-button">
      Create Task
    </button>
  </form>
);

// component to render the TASK LIST (current tasks)
// props: pass in tasks state, delete, edit task function
const TaskList = ({ tasks, handleDeleteTask, handleEditTask, editTask, handleEditInputChange, handleUpdateTask }) => (
  <ul className="task-list">
    {tasks.length !== 0 ? tasks.map((task) => ( // If there is a task, loop through 
      <li key={task._id} className="task-list-item">
        {editTask && editTask._id === task._id ? (
          // IF task is being edited (& ID exists), change UI
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleUpdateTask(task._id, editTask);
            }}
          >
            <input
              type="text"
              name="title"
              value={editTask.title}
              onChange={handleEditInputChange}
              className="task-input task-title-input"
            />
            <textarea
              name="description"
              value={editTask.description}
              onChange={handleEditInputChange}
              className="task-input task-description-input"
            />
            <input
              type="date"
              name="dueDate"
              value={editTask.dueDate}
              onChange={handleEditInputChange}
              className="task-input task-date-input"
            />
            <button type="submit" className="task-update-button">
              Save
            </button>
            <button
              type="button"
              className="task-cancel-button"
              onClick={() => handleEditTask(null)}
            >
              Cancel
            </button>
          </form>
        ) : (
          // ELSE: NORMAL tasks viewing UI - adding an edit button to allow edits
          <>
           <div className="task-content">
              <div className="task-details">
                <h4 className="task-title">
                  {task.title}
                </h4>
                {task.dueDate && (
                  <p className="task-due-date">
                    {new Date(task.dueDate).toLocaleDateString('en-US', { timeZone: 'UTC' })}
                  </p>
                )}
                {task.description && (
                  <p className="task-description">
                    {task.description}
                  </p>
                )}
              </div>
              <div className="task-actions">
                <button
                  onClick={() => handleEditTask(task)}
                  className="task-edit-button"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDeleteTask(task._id)}
                  className="task-delete-button"
                >
                  Delete
                </button>
              </div>
            </div>
          </>
        )}
      </li>
    )) : <h1 className="noTasks">None Yet!</h1>}
  </ul>
);


// MAIN component to combine above ones and render the whole app page
const TaskManager = () => {
  // states to keep track of overall tasks and new ones
  const [tasks, setTasks] = useState([]);
  const [newTask, setNewTask] = useState({ title: '', description: '', dueDate: '' });
  const [editTask, setEditTask] = useState(null);

  // Fetch tasks on first load
  useEffect(() => {
    fetchTasks();
  }, []);

  // get ALL tasks, fetch the "/getTasks" route
  const fetchTasks = async () => {
    try {
      const response = await fetch('/getTasks');
      const data = await response.json();

      // if there's task, update setTasks state
      if (data.tasks) {
        setTasks(data.tasks);
        setTimeout(() => helper.hideError(), 2000)
      } else {
        helper.handleInfo('Error fetching tasks');
      }
    } catch (err) {
      helper.handleInfo('Error fetching tasks:', err);
    }
  };
 
  // handle updating a task 
  const handleUpdateTask = async (id, updatedTask) => {
    // using PUT to update task information
    try {
      const response = await fetch(`/getTasks/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedTask),
      });

      const data = await response.json();

      if (data.error) {
        helper.handleInfo(data.error);
      } else {
        helper.handleInfo('Task updated!');
        setEditTask(null); 
        fetchTasks(); 
      }
    } catch (err) {
      helper.handleInfo('Error updating task:', err);
    }
  }

  // change the state to update the new task when text/input changed
  const handleInputChange = (e) => {
    setNewTask({ ...newTask, [e.target.name]: e.target.value });
    helper.hideError();
  };
  
   // change the state to update the EDITED task
  const handleUpdateChange = (e) => {
    setEditTask({...editTask, [e.target.name]: e.target.value});
  }

  // ON SUBMIT: create a task
  const handleCreateTask = async (e) => {
    e.preventDefault();

    if (!newTask.title) {
      helper.handleInfo("Title is required!");
      setTimeout(() => helper.hideError(), 2000);
      return;
    }

    // POST to /makeTask, add new task
    try {
      const response = await fetch('/makeTask', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newTask),
      });

      const data = await response.json();

      if (data.error) {
        helper.handleInfo(data.error);
      } else {
        helper.handleInfo('Task created!');
        fetchTasks(); // refresh task list
        setNewTask({ title: '', description: '', dueDate: '' });
      }
    } catch (err) {
      helper.handleInfo('Error creating task:', err);
    }
  };

  // handle deleting a task 
  const handleDeleteTask = async (id) => {
    try {
      const response = await fetch(`/getTasks/${id}`, {
        method: 'DELETE',
      });
      const data = await response.json();

      if (data.error) {
        helper.handleInfo(data.error);
      } else {
        helper.handleInfo('Task deleted!');
        fetchTasks(); // refresh task list
      }
    } catch (err) {
      helper.handleInfo('Error deleting task:', err);
    }
  };



  return (
    // Task manager container is ALL content
    // Inside it: left placeholder ads, main content, and right ads
    <div className="task-manager-container">

      <LeftPlaceholders />

      <div className="mainContent">
        <h2 className="task-manager-title">Add Task</h2>

        <TaskForm newTask={newTask}
          handleInputChange={handleInputChange}
          handleCreateTask={handleCreateTask}
        />

        <h3 className="task-list-title">Your Tasks</h3>

        <TaskList tasks={tasks}
          handleDeleteTask={handleDeleteTask}
          handleEditTask={(task) => setEditTask(task)}
          editTask={editTask}
          handleEditInputChange={handleUpdateChange}
          handleUpdateTask={handleUpdateTask}
        />
      </div>

      <RightPlaceholders />

    </div>
  );
};


const init = () => {
  const root = createRoot(document.querySelector("#app"));
  root.render(<TaskManager />)
};

window.onload = init;