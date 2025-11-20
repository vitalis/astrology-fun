import BirthForm from './components/BirthForm'
import './App.css'

function App() {
  return (
    <div className="min-h-screen relative overflow-hidden py-4 sm:py-6 md:py-8 lg:py-12 px-3 sm:px-4 md:px-6">
      {/* Animated gradient background */}
      <div className="fixed inset-0 bg-gradient-to-br from-purple-400 via-pink-500 to-red-500 -z-10"></div>

      {/* Floating animated orbs for depth */}
      <div className="fixed top-10 sm:top-20 left-5 sm:left-10 w-48 h-48 sm:w-64 sm:h-64 md:w-72 md:h-72 bg-purple-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob -z-10"></div>
      <div className="fixed top-20 sm:top-40 right-5 sm:right-10 w-48 h-48 sm:w-64 sm:h-64 md:w-72 md:h-72 bg-yellow-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000 -z-10"></div>
      <div className="fixed bottom-10 sm:bottom-20 left-10 sm:left-20 w-48 h-48 sm:w-64 sm:h-64 md:w-72 md:h-72 bg-pink-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-4000 -z-10"></div>

      <div className="relative z-10">
        <BirthForm />
      </div>
    </div>
  )
}

export default App
