import { Routes, Route, Navigate } from 'react-router-dom'
import { useState, useEffect } from 'react'
import LoginPage from './pages/LoginPage'
import SubscribePage from './pages/SubscribePage'
import Dashboard from './pages/Dashboard'
import GenerateContent from './pages/GenerateContent'
import CampaignWizard from './pages/CampaignWizard'
import ApprovalQueue from './pages/ApprovalQueue'
import Platforms from './pages/Platforms'
import Billing from './pages/Billing'
import Layout from './components/Layout'
import './App.css'

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [user, setUser] = useState(null)
  const [hasAccess, setHasAccess] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Check for existing authentication
    const token = localStorage.getItem('authToken')
    const userId = localStorage.getItem('userId')
    
    if (token && userId) {
      checkUserAccess(userId)
    } else {
      setLoading(false)
    }
  }, [])

  const checkUserAccess = async (userId) => {
    try {
      const response = await fetch(`/api/auth/check-access?user_id=${userId}`)
      const data = await response.json()
      
      if (data.success) {
        setHasAccess(data.has_access)
        setUser(data)
        setIsAuthenticated(true)
      } else {
        // Clear invalid auth
        localStorage.removeItem('authToken')
        localStorage.removeItem('userId')
      }
    } catch (error) {
      console.error('Access check failed:', error)
      localStorage.removeItem('authToken')
      localStorage.removeItem('userId')
    } finally {
      setLoading(false)
    }
  }

  const handleLogin = async (userData) => {
    setIsAuthenticated(true)
    setUser(userData)
    
    // Check access after login
    await checkUserAccess(userData.id)
  }

  const handleSubscribe = async (subscriptionData) => {
    try {
      const response = await fetch('/api/subscription/user/subscription/upgrade', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(subscriptionData)
      })
      
      const data = await response.json()
      
      if (data.success) {
        setHasAccess(true)
        setUser(prev => ({ ...prev, ...data.subscription }))
      }
    } catch (error) {
      console.error('Subscription failed:', error)
    }
  }

  const handleLogout = () => {
    setIsAuthenticated(false)
    setUser(null)
    setHasAccess(false)
    localStorage.removeItem('authToken')
    localStorage.removeItem('userId')
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center">
        <div className="text-white text-xl">Loading...</div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return <LoginPage onLogin={handleLogin} />
  }

  if (!hasAccess) {
    return <SubscribePage onSubscribe={handleSubscribe} userInfo={user} />
  }

  return (
    <Layout user={user} onLogout={handleLogout}>
      <Routes>
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="/dashboard" element={<Dashboard user={user} />} />
        <Route path="/generate-content" element={<GenerateContent user={user} />} />
        <Route path="/campaign-wizard" element={<CampaignWizard user={user} />} />
        <Route path="/approval-queue" element={<ApprovalQueue user={user} />} />
        <Route path="/platforms" element={<Platforms user={user} />} />
        <Route path="/billing" element={<Billing user={user} />} />
        <Route path="/subscribe" element={<SubscribePage onSubscribe={handleSubscribe} userInfo={user} />} />
      </Routes>
    </Layout>
  )
}

export default App

