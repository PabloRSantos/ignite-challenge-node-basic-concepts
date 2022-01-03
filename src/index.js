const express = require("express");
const cors = require("cors");
const { v4: uuidv4 } = require("uuid");

const app = express();

app.use(cors());
app.use(express.json());

const users = [];

function checksExistsUserAccount(request, response, next) {
  const { username } = request.headers;
  const userExist = users.find((findUser) => findUser.username === username);

  if (!userExist) {
    return response.status(404).json({
      error: "User not exist",
    });
  }

  request.user = userExist;
  next();
}

app.post("/users", (request, response) => {
  const { name, username } = request.body;

  const userAlreadyExist = users.find(
    (findUser) => findUser.username === username
  );

  if (userAlreadyExist) {
    return response.status(400).json({
      error: "User already exist",
    });
  }

  const newUser = {
    id: uuidv4(),
    name,
    username,
    todos: [],
  };

  users.push(newUser);
  response.json(newUser).status(201);
});

app.get("/todos", checksExistsUserAccount, (request, response) => {
  const { user } = request;
  response.json(user.todos);
});

app.post("/todos", checksExistsUserAccount, (request, response) => {
  const { title, deadline } = request.body;
  const { user } = request;

  const newTodo = {
    id: uuidv4(),
    title,
    done: false,
    deadline: new Date(deadline),
    created_at: new Date(),
  };

  user.todos.push(newTodo);
  response.status(201).json(newTodo);
});

app.put("/todos/:id", checksExistsUserAccount, (request, response) => {
  const { user } = request;
  const { title, deadline } = request.body;
  const { id } = request.params;

  const userTodo = user.todos.find((todo) => todo.id === id);
  if (!userTodo) {
    return response.status(404).json({
      error: "Todo not exist",
    });
  }

  userTodo.title = title
  userTodo.deadline = new Date(deadline)

  response.json(userTodo).status(204);
});

app.patch("/todos/:id/done", checksExistsUserAccount, (request, response) => {
  const { user } = request;
  const { id } = request.params;

  const userTodo = user.todos.find((todo) => todo.id === id);
  if (!userTodo) {
    return response.status(404).json({
      error: "Todo not exist",
    });
  }

  userTodo.done = true

  response.json(userTodo).status(204);
});

app.delete("/todos/:id", checksExistsUserAccount, (request, response) => {
  const { user } = request;
  const { id } = request.params;

  const userTodo = user.todos.find((todo) => todo.id === id);

  if (!userTodo) {
    return response.status(404).json({
      error: "Todo not exist",
    });
  }

  user.todos = user.todos.filter((todo) => todo.id !== id);
  response.status(204).send();
});

module.exports = app;
