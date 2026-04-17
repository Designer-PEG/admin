import { FiMenu, FiBell, FiSearch } from 'react-icons/fi';

const Navbar = ({ onToggleSidebar, currentUser }) => {
  return (
    <header className="sticky top-0 z-30 bg-white border-b border-gray-200 dark:bg-slate-900 dark:border-slate-800 transition-colors duration-200">
      <div className="flex items-center justify-between h-16 px-4 lg:px-6">
        {/* Left: Hamburger + Search */}
        <div className="flex items-center gap-4">
          <button
            onClick={onToggleSidebar}
            className="p-2 text-gray-500 rounded-lg hover:bg-gray-100 hover:text-gray-700 lg:hidden dark:text-gray-400 dark:hover:bg-slate-800"
            aria-label="Toggle sidebar"
          >
            <FiMenu className="w-5 h-5" />
          </button>

          <div className="hidden sm:flex items-center relative">
            <FiSearch className="absolute left-3 w-4 h-4 text-gray-400 pointer-events-none dark:text-gray-500" />
            <input
              type="text"
              placeholder="Search..."
              className="w-64 pl-10 pr-4 py-2 text-sm bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder-gray-400 dark:bg-slate-800 dark:border-slate-700 dark:text-white dark:placeholder-gray-500"
            />
          </div>
        </div>

        {/* Right: Notifications + User */}
        <div className="flex items-center gap-3">
          <button className="p-2 text-gray-500 rounded-lg hover:bg-gray-100 hover:text-gray-700 relative dark:text-gray-400 dark:hover:bg-slate-800">
            <FiBell className="w-5 h-5" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white dark:border-slate-900"></span>
          </button>

          {currentUser && (
            <div className="flex items-center gap-3 ml-2 pl-3 border-l border-gray-200 dark:border-slate-800">
              <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white text-sm font-semibold shadow-sm">
                {currentUser.name?.charAt(0).toUpperCase()}
              </div>
              <div className="hidden md:block text-right">
                <p className="text-sm font-medium text-gray-900 leading-tight dark:text-white">{currentUser.name}</p>
                <p className="text-xs text-gray-500 leading-tight dark:text-gray-400">Administrator</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Navbar;
