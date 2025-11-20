import { App as KonstaApp } from 'konsta/react';
import BirthForm from './components/BirthForm'
import './App.css'

function App() {
  return (
    <KonstaApp theme="ios" safeAreas>
      <BirthForm />
    </KonstaApp>
  )
}

export default App
