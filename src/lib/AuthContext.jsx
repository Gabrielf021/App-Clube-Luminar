import { createContext, useContext, useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const saved = localStorage.getItem('luminar_user')
    if (saved) setUser(JSON.parse(saved))
    setLoading(false)
  }, [])

  const login = async (nome, dataNascimento) => {
    // Busca perfil pelo nome (case-insensitive) e data de nascimento
    const { data, error } = await supabase
      .from('perfis')
      .select('*')
      .ilike('nome', nome.trim())
      .eq('data_nascimento', dataNascimento)
      .single()

    if (error || !data) {
      throw new Error('Nome ou data de nascimento incorretos.')
    }

    localStorage.setItem('luminar_user', JSON.stringify(data))
    setUser(data)
    return data
  }

  const logout = () => {
    localStorage.removeItem('luminar_user')
    setUser(null)
  }

  const refreshUser = async () => {
    if (!user) return
    const { data } = await supabase
      .from('perfis')
      .select('*')
      .eq('id', user.id)
      .single()
    if (data) {
      localStorage.setItem('luminar_user', JSON.stringify(data))
      setUser(data)
    }
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
