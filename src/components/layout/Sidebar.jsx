import { NavLink } from 'react-router-dom';
import {
  FiGrid, FiInbox, FiFileText, FiSettings,
  FiLogOut, FiX, FiEdit3
} from 'react-icons/fi';

const navigation = [
  { name: 'Dashboard',    icon: FiGrid,     path: '/dashboard' },
  { name: 'Submissions',  icon: FiInbox,    path: '/submissions' },
  { name: 'Settings',     icon: FiSettings, path: '/settings' },
];

const Sidebar = ({ currentUser, handleLogout, isOpen, onClose }) => {
  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/30 backdrop-blur-sm lg:hidden dark:bg-black/60"
          onClick={onClose}
        />
      )}

      {/* Sidebar panel */}
      <aside
        className={`
          fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-gray-200 flex flex-col
          transform transition-transform duration-200 ease-in-out
          lg:relative lg:translate-x-0 lg:z-auto
          dark:bg-slate-900 dark:border-slate-800
          ${isOpen ? 'translate-x-0' : '-translate-x-full'}
        `}
      >
        {/* Header */}
        <div className="flex items-center justify-between h-16 px-5 border-b border-gray-200 shrink-0 dark:border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">A</span>
            </div>
            <span className="text-base font-semibold text-gray-900 dark:text-white">Admin Panel</span>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-gray-400 rounded-lg hover:bg-gray-100 hover:text-gray-600 lg:hidden dark:hover:bg-slate-800 dark:text-gray-500"
          >
            <FiX className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation links */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {navigation.map((item) => (
            <NavLink
              key={item.name}
              to={item.path}
              onClick={onClose}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-slate-800 dark:hover:text-white'
                }`
              }
            >
              <item.icon className="w-[18px] h-[18px] shrink-0" />
              <span>{item.name}</span>
            </NavLink>
          ))}
        </nav>

        {/* User footer */}
        {currentUser && (
          <div className="p-4 border-t border-gray-200 shrink-0 dark:border-slate-800">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-9 h-9 rounded-full bg-blue-600 flex items-center justify-center text-white text-sm font-semibold shrink-0">
                {currentUser.name?.charAt(0).toUpperCase()}
              </div>
              <div className="min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate dark:text-white">{currentUser.name}</p>
                <p className="text-xs text-gray-500 truncate dark:text-gray-400">{currentUser.email}</p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 w-full px-3 py-2 text-sm text-gray-600 font-medium rounded-lg hover:bg-red-50 hover:text-red-600 transition-colors dark:text-gray-400 dark:hover:bg-red-900/20 dark:hover:text-red-400"
            >
              <FiLogOut className="w-4 h-4" />
              <span>Sign out</span>
            </button>
          </div>
        )}
      </aside>
    </>
  );
};

export default Sidebar;
