import { useState } from 'react'
import { loginUser } from '../api/auth'
import { useNavigate } from 'react-router-dom'

export default function Login() {
  const [form, setForm] = useState({ email: '', password: '' })
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      const res = await loginUser(form)
      localStorage.setItem('token', res.data.access_token)
      alert('Bienvenido')
      navigate('/dashboard')
    } catch (err) {
      alert('Credenciales incorrectas')
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <h2>Login</h2>
      <input placeholder="Email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} />
      <input type="password" placeholder="Password" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} />
      <button type="submit">Entrar</button>
    </form>
  )
}
