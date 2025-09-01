import { useAuth } from '../contexts/AuthContext'

const SimpleIndex = () => {
  const { user, signOut } = useAuth()

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow-lg max-w-md w-full">
          <h1 className="text-2xl font-bold text-center mb-6">All Access Artist</h1>
          <p className="text-center text-gray-600">Please log in to continue</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-3xl font-bold text-gray-800">Welcome, {user.email}</h1>
            <button 
              onClick={signOut}
              className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded"
            >
              Sign Out
            </button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="bg-blue-50 p-6 rounded-lg">
              <h2 className="text-xl font-semibold mb-4">Dashboard</h2>
              <p className="text-gray-600">Your artist dashboard and analytics</p>
            </div>
            
            <div className="bg-green-50 p-6 rounded-lg">
              <h2 className="text-xl font-semibold mb-4">Releases</h2>
              <p className="text-gray-600">Manage your music releases</p>
            </div>
            
            <div className="bg-purple-50 p-6 rounded-lg">
              <h2 className="text-xl font-semibold mb-4">Settings</h2>
              <p className="text-gray-600">Account and subscription settings</p>
            </div>
          </div>
          
          <div className="mt-8 p-4 bg-yellow-50 rounded-lg">
            <h3 className="font-semibold text-yellow-800">JWT Token Access</h3>
            <p className="text-sm text-yellow-700 mt-2">
              Open browser console (F12) and run: <br/>
              <code className="bg-yellow-100 px-2 py-1 rounded">
                Object.keys(localStorage).filter(key =&gt; key.includes('sb-'))
              </code>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default SimpleIndex
