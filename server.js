const http = require("http");
const PORT = process.env.PORT || 5000;
let todos = require("./data.json");
const fs = require("fs");

fs.readFile("data.json", "utf8", (err, data) => {
  if (err) throw err;

  const json = data;
  const parsedData = JSON.parse(json);
  todos = parsedData;
});

const app = http.createServer((req, res) => {
  const items = req.url.split("/");
  const reqTodo = parseInt(items[2]);

  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Credentials", "true");
  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET, PATCH, DELETE, OPTIONS, POST, PUT"
  );
  res.setHeader(
    "Access-Control-Allow-Headers",
    "Access-Control-Allow-Headers, Origin,Accept, X-Requested-With, Content-Type, Access-Control-Request-Method, Access-Control-Request-Headers"
  );
  if (req.method === "OPTIONS") {
    res.statusCode = 200;
    res.end();
  }


  // GET ALL TODOS
  if (req.method === "GET" && req.url === "/todos") {
    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(JSON.stringify(todos));
  }

  // GET ONE TODO
  else if (req.method === "GET") {
    const task = todos.find((t) => t.id === reqTodo);
    if (task) {
      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(JSON.stringify(task));
    } else {
      res.statusCode = 404;
      res.end();
    }
  }

  // DELETE TODO
  else if (req.method === "DELETE") {
    todos = todos.filter((t) => t.id !== reqTodo);
    const updated = JSON.stringify(todos, null, "\t");
    res.statusCode = 204;
    res.end();
    fs.writeFile("data.json", updated, (err) => {
      if (err) throw err;
    });
  }

  // POST TODO
  else if (req.method === "POST") {
    req.on("data", (chunk) => {
      const data = JSON.parse(chunk);
      todos.push({
        id: Math.floor(Math.random() * 5000) + 1,
        ...data,
        completed: false,
      });
      const updated = JSON.stringify(todos, null, "\t");
      res.statusCode = 200;
      res.end();
      fs.writeFile("data.json", updated, (err) => {
        if (err) throw err;
      });
    });
  }

  // PUT TODO
  else if (req.method === "PUT") {
    const task = todos.findIndex((t) => t.id === reqTodo);
    req.on("data", (chunk) => {
      todos[task] = JSON.parse(chunk);
    });
    const updated = JSON.stringify(todos, null, "\t");
    res.statusCode = 200;
    res.end();
    fs.writeFile("data.json", updated, (err) => {
      if (err) throw err;
    });
  }

  // PATCH TODO
  else if (req.method === "PATCH") {
    const todoIndex = todos.findIndex((t) => t.id === reqTodo);

    req.on("data", (chunk) => {
      const data = JSON.parse(chunk);
      let todo = todos[todoIndex];

      if (data.task) {
        todo.task = data.task;
      } if (typeof data.completed === "boolean") {
        todo.completed = data.completed;
      }
    });
  }

  const updated = JSON.stringify(todos, null, "\t");
  res.statusCode = 200;
  res.end();
  fs.writeFile("data.json", updated, (err) => {
    if (err) throw err;
  });
});

app.listen(PORT, () => console.log(`Server started on port : ${PORT}`));
