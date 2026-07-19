import { Link } from 'react-router-dom'
import homeImage from '../assets/HomeImg.png'
import { useAuth } from '../context/auth-context'

export default function HomePage() {
  const { user } = useAuth()
  return (
    <main className="hero container">
      <div className="hero-copy">
        <span className="eyebrow">Your tasks, in one place</span>
        <h1>Keep track of what you need to do.</h1>
        <p>Add a task, choose its priority, and come back when you are ready to work on it.</p>
        <div className="hero-actions">
          <Link className="button button-primary" to={user ? '/tasks' : '/register'}>{user ? 'Go to my tasks' : 'Create free account'}</Link>
          {!user && <Link className="button button-secondary" to="/login">Log in</Link>}
        </div>
      </div>
      <img className="hero-image" src={homeImage} alt="Illustration of a person organizing a task list" />
    </main>
  )
}
