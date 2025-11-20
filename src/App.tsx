import BirthForm from './components/BirthForm'
import './App.css'

function App() {
  return (
    <div className="min-h-screen relative overflow-hidden py-8 px-4">
      {/* Animated gradient background */}
      <div className="fixed inset-0 bg-gradient-to-br from-purple-400 via-pink-500 to-red-500"></div>

      {/* Floating animated orbs for depth */}
      <div className="fixed top-20 left-10 w-72 h-72 bg-purple-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob"></div>
      <div className="fixed top-40 right-10 w-72 h-72 bg-yellow-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000"></div>
      <div className="fixed bottom-20 left-20 w-72 h-72 bg-pink-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-4000"></div>

      <div className="relative z-10">
        <BirthForm />
      </div>
    </div>
  )
}

export default App
