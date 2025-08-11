import { NavLink } from 'react-router-dom'

const Sidebar = ({ currentUser, handleLogout }) => {
  const menuItems = [
    { name: 'dashboard', icon: '📊', path: '/dashboard' },
    { name: 'submissions', icon: '📝', path: '/submissions' },
    { name: 'settings', icon: '⚙️', path: '/settings' },
  ]

  return (
    <div className="w-64 bg-gray-800 text-white flex flex-col">
      <div className="p-4 text-xl font-bold">Admin Panel</div>
      <nav className="mt-6 flex-1">
        <ul>
          {menuItems.map((item) => (
            <li key={item.name} className="px-2 py-1">
              <NavLink
                to={item.path}
                className={({ isActive }) =>
                  `flex items-center w-full px-4 py-2 rounded-lg transition-colors ${
                    isActive
                      ? 'bg-gray-700 text-white'
                      : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                  }`
                }
              >
                <span className="mr-3">{item.icon}</span>
                <span>{item.name.charAt(0).toUpperCase() + item.name.slice(1)}</span>
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>
      
      {/* User Profile Section */}
      {currentUser && (
        <div className="p-4 border-t border-gray-700">
          <div className="flex items-center mb-3">
            <div className="bg-gray-600 rounded-full w-10 h-10 flex items-center justify-center">
              <span className="text-lg">
                {currentUser.name.charAt(0).toUpperCase()}
              </span>
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium">{currentUser.name}</p>
              <p className="text-xs text-gray-400">{currentUser.email}</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="w-full mt-2 bg-red-600 text-white py-1 px-3 rounded text-sm hover:bg-red-700"
          >
            Logout
          </button>
        </div>
      )}
    </div>
  )
}

export default Sidebar
