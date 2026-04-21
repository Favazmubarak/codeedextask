import { useState, useEffect } from 'react'
import axios from 'axios'

const api = axios.create({
  baseURL: '/api',
  withCredentials: true
})

function App() {
  const [user, setUser] = useState(null)
  const [tasks, setTasks] = useState([])
  const [page, setPage] = useState('login')
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [msg, setMsg] = useState('')
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [editTask, setEditTask] = useState(null)
  const [editTitle, setEditTitle] = useState('')
  const [editDesc, setEditDesc] = useState('')

  useEffect(() => {
    api.get('/auth/me')
      .then(res => { setUser(res.data); fetchTasks() })
      .catch(() => setUser(null))
  }, [])

  const fetchTasks = () => {
    api.get('/tasks').then(res => setTasks(res.data))
  }

  const register = async () => {
    try {
      const res = await api.post('/auth/register', { username, password })
      setMsg(res.data.message)
      setPage('login')
    } catch (err) {
      setMsg(err.response.data.message)
    }
  }

  const login = async () => {
    try {
      const res = await api.post('/auth/login', { username, password })
      setUser(res.data.user)
      fetchTasks()
    } catch (err) {
      setMsg(err.response.data.message)
    }
  }

  const logout = async () => {
    await api.post('/auth/logout')
    setUser(null)
    setTasks([])
  }

  const createTask = async () => {
    if (!title) return alert('Title is required')
    await api.post('/tasks', { title, description })
    setTitle('')
    setDescription('')
    fetchTasks()
  }

  const deleteTask = async (id) => {
    await api.delete(`/tasks/${id}`)
    fetchTasks()
  }

  const moveTask = async (id, status) => {
    await api.put(`/tasks/${id}`, { status })
    fetchTasks()
  }

  const saveEdit = async () => {
    await api.put(`/tasks/${editTask.id}`, { title: editTitle, description: editDesc })
    setEditTask(null)
    fetchTasks()
  }

  const columns = [
    { key: 'todo', label: 'Todo' },
    { key: 'inprogress', label: 'In Progress' },
    { key: 'done', label: 'Done' }
  ]

  if (!user) {
    return (
      <div>
        <h2>{page === 'login' ? 'Login' : 'Register'}</h2>
        <input placeholder="Username" value={username}
          onChange={e => setUsername(e.target.value)} /><br /><br />
        <input placeholder="Password" type="password" value={password}
          onChange={e => setPassword(e.target.value)} /><br /><br />
        {page === 'login'
          ? <button onClick={login}>Login</button>
          : <button onClick={register}>Register</button>
        }
        <p>{msg}</p>
        {page === 'login'
          ? <p>No account? <button onClick={() => { setPage('register'); setMsg('') }}>Register</button></p>
          : <p>Have account? <button onClick={() => { setPage('login'); setMsg('') }}>Login</button></p>
        }
      </div>
    )
  }

  return (
    <div>
      <h2>Kanban Board — {user.username} <button onClick={logout}>Logout</button></h2>

      <div>
        <input placeholder="Title (required)" value={title}
          onChange={e => setTitle(e.target.value)} />
        <input placeholder="Description (optional)" value={description}
          onChange={e => setDescription(e.target.value)} />
        <button onClick={createTask}>Add Task</button>
      </div>

      <br />

      <div style={{ display: 'flex', gap: 20 }}>
        {columns.map(col => (
          <div key={col.key} style={{ flex: 1, border: '1px solid #ccc', padding: 10 }}>
            <h3>{col.label}</h3>
            {tasks.filter(t => t.status === col.key).map(task => (
              <div key={task.id} style={{ borderBottom: '1px solid #eee', marginBottom: 8, paddingBottom: 8 }}>
                <strong>{task.title}</strong>
                {task.description && <p>{task.description}</p>}
                <select value={task.status} onChange={e => moveTask(task.id, e.target.value)}>
                  <option value="todo">Todo</option>
                  <option value="inprogress">In Progress</option>
                  <option value="done">Done</option>
                </select>
                <button onClick={() => { setEditTask(task); setEditTitle(task.title); setEditDesc(task.description) }}>Edit</button>
                <button onClick={() => deleteTask(task.id)}>Delete</button>
              </div>
            ))}
          </div>
        ))}
      </div>

      {editTask && (
        <div>
          <h3>Edit Task</h3>
          <input value={editTitle} onChange={e => setEditTitle(e.target.value)} /><br />
          <input value={editDesc} onChange={e => setEditDesc(e.target.value)} /><br />
          <button onClick={saveEdit}>Save</button>
          <button onClick={() => setEditTask(null)}>Cancel</button>
        </div>
      )}
    </div>
  )
}

export default App