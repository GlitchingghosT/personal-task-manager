import { Link, NavLink } from 'react-router-dom'
import logo from '../assets/logo.png'
import { useAuth } from '../context/auth-context'

export default function Navbar() {
  const { user, logout, ready } = useAuth()
  return (
    <header className="site-header">
      <nav className="nav container" aria-label="Main navigation">
        <Link className="brand" to="/" aria-label="TaskDuty home">
          <img src={logo} alt="" aria-hidden="true" />
          <span>TaskDuty</span>
        </Link>
        <div className="nav-links">
          {!ready ? (
            <span className="user-name" role="status">Checking session…</span>
          ) : user ? (
            <>
              <NavLink to="/tasks">My tasks</NavLink>
              <NavLink to="/tasks/new">New task</NavLink>
              <span className="user-name" title={user.email}>Hi, {user.name}</span>
              <button className="button button-ghost button-small" type="button" onClick={logout}>Log out</button>
            </>
          ) : (
            <>
              <NavLink to="/login">Log in</NavLink>
              <Link className="button button-primary button-small" to="/register">Get started</Link>
            </>
          )}
        </div>
      </nav>
    </header>
  )
}
