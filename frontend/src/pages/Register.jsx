import { useState } from 'react'
import { registerUser } from '../api/auth'
import { useNavigate } from 'react-router-dom'

export default function Register() {
  const [form, setForm] = useState({ email: '', password: '', role: 'USER' })
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      await registerUser(form)
      alert('Usuario creado')
      navigate('/')
    } catch (err) {
      alert('Error: ' + err.response?.data?.detail || 'Error en el registro')
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <h2>Registro</h2>
      <input placeholder="Email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} />
      <input type="password" placeholder="Password" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} />
      <select value={form.role} onChange={e => setForm({ ...form, role: e.target.value })}>
        <option value="USER">Usuario</option>
        <option value="ADMIN">Admin</option>
      </select>
      <button type="submit">Registrarme</button>
    </form>
  )
}
