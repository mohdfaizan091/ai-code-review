import { useEffect } from 'react'
import { testConnection } from './services/reviewService'

function App() {
  useEffect(() => {
    testConnection();
  }, [])

  return (
    <div className="bg-blue-500 text-white p-4">
      Tailwind is working!
    </div>
  )
}
export default App;