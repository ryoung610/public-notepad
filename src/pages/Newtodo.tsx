import { useEffect, useState } from "react";
import { generateClient } from "aws-amplify/data";
import type { Schema } from "../../amplify/data/resource";
import "../design/Todo.css"


const client = generateClient<Schema>();

//const { data: todos } = await client.models.Todo.list();


function Newtodo() {
  const [todos, setTodos] = useState<Array<Schema["Todo"]["type"]>>([]);

  console.log("hello your todos = "+todos);

  useEffect(() => {
    client.models.Todo.observeQuery().subscribe({
      next: (data) => setTodos([...data.items]),
    });
  }, []);

  function createTodo() {
    const content = window.prompt("Todo content");
    if (content) {
      client.models.Todo.create({ content, likes: 0, dislikes: 0 })
        .then(() => console.log("New todo created successfully"))
        .catch((error) => console.error("Error creating todo:", error));
    }
  }

  function deleteTodo(id: string, likes: number, dislikes: number) {
    if (dislikes > likes) {
      client.models.Todo.delete({ id });
    } else {
      alert("Todo cannot be deleted because dislikes are less than or equal to likes.");
    }
  }

  function likeTodo(id: string, likes: number) {
    console.log("Liking todo:", id);
    console.log("Current Likes:", likes);
  
    client.models.Todo.update({ id, likes: likes + 1 })
      .then(() => {
        console.log("Like updated, fetching latest data...");
        return client.models.Todo.list();
      })
      .then((data) => {
        console.log("Updated Todos:", data.data); // ✅ Fix: access data.data
        setTodos(data.data ?? []); // ✅ Correct structure
      })
      .catch((error) => {
        console.error("Error updating likes:", error);
        alert(`Failed to update likes.\nFull error: ${JSON.stringify(error)}`);
      });
  }
  

  function dislikeTodo(id: string, dislikes: number) {
    client.models.Todo.update({ id, dislikes: dislikes + 1 })
      .then(() => client.models.Todo.list()) // Fetch updated list
      .then((data) => {
        console.log("Updated Todos:", data);
        setTodos(data.data ?? []); // ✅ Fix structure
      })
      .catch((error) => {
        console.error("Error updating dislikes:", error);
        alert("Failed to update dislikes.");
      });
  }
  
  

  function toggleDone(id: string, isDone: boolean) {
    client.models.Todo.update({ id, isDone: !isDone }).then(() => {
      // After updating, fetch the todos again to reflect the changes
      client.models.Todo.observeQuery().subscribe({
        next: (data) => setTodos([...data.items]),
      });
    });
  }


  return (
    <main>
      <h1>My todos</h1>
      <button onClick={createTodo}>+ new</button>
      <ul>
        {todos.map((todo) => (
          <li 
         // onClick={() => deleteTodo(todo.id)}
          key={todo.id} style={{ textDecoration: todo.isDone ? "line-through" : "none" }}>
            {todo.content} — Likes: {todo.likes || 0} | Dislikes: {todo.dislikes || 0}
            <button className="todo-button" onClick={() => likeTodo(todo.id, todo.likes || 0)}>👍</button>
            <button className="todo-button" onClick={() => dislikeTodo(todo.id, todo.dislikes || 0)}>👎</button>
            <button className="todo-button" onClick={() => toggleDone(todo.id, todo.isDone ?? false)}>✅</button>
            {/**<button onClick={() => deleteTodo(todo.id)}>❌</button>*/}
            <button className="todo-button"
            onClick={(e) => {
              e.stopPropagation(); // Prevent the click from propagating to the <li>
              deleteTodo(todo.id, todo.likes || 0, todo.dislikes || 0);
            }}
          >
            ❌
          </button>
            </li>
        ))}
      </ul>
      <div>
        🥳 App successfully hosted. Try creating a new todo.
        <br />
        <a href="https://docs.amplify.aws/react/start/quickstart/#make-frontend-updates">
          Review next step of this tutorial.
        </a>
      </div>
    </main>
  );
}

export default Newtodo;
