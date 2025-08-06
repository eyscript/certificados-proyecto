import React, { useState, useEffect } from 'react'
import { useAuth } from '../auth/AuthContext'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'

function UploadCertificate() {
  const { token, user } = useAuth()
  const navigate = useNavigate()

  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [file, setFile] = useState(null)

  //  Validación de sesión
  useEffect(() => {
    if (!token || !user) {
      navigate('/login')
    }
  }, [token, user, navigate])

  const handleSubmit = async (e) => {
    e.preventDefault()
    const formData = new FormData()
    formData.append('title', title)
    formData.append('description', description)
    formData.append('file', file)

    try {
      const res = await axios.post('http://127.0.0.1:8000/certificates/upload', formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        }
      })
      alert('Certificado subido exitosamente!')
      navigate('/certificates') 
    } catch (error) {
      console.error(error)
      alert('Error al subir el certificado')
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <input type="text" placeholder="Título" value={title} onChange={e => setTitle(e.target.value)} />
      <input type="text" placeholder="Descripción" value={description} onChange={e => setDescription(e.target.value)} />
      <input type="file" onChange={e => setFile(e.target.files[0])} />
      <button type="submit">Subir</button>
    </form>
  )
}

export default UploadCertificate
