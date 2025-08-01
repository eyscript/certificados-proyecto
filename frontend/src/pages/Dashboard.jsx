export default function Dashboard() {
  const token = localStorage.getItem('token')
  return (
    <div>
      <h2>Dashboard</h2>
      {token ? <p>Estás autenticado ✅</p> : <p>Debes iniciar sesión</p>}
    </div>
  )
}
