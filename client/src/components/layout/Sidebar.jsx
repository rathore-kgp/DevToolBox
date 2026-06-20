import { NavLink } from 'react-router-dom';
import { TOOLS, TOOL_CATEGORIES } from '../../config/toolsRegistry';

const Sidebar = () => {
  return (
    <aside className="w-64 h-screen bg-white dark:bg-dark-surface border-r border-gray-200 dark:border-dark-border flex flex-col">
      
      {/* Logo */}
      <div className="px-6 py-5 border-b border-gray-200 dark:border-dark-border">
        <h1 className="text-xl font-bold text-brand-500 font-mono">
          DevToolBox
        </h1>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto px-3 py-4">
        {TOOL_CATEGORIES.map((category) => (
          <div key={category} className="mb-6">
            
            {/* Category Label */}
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider px-3 mb-2">
              {category}
            </p>

            {/* Tools in this category */}
            {TOOLS.filter((tool) => tool.category === category).map((tool) => (
              <NavLink
                key={tool.id}
                to={tool.path}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors mb-1 ${
                    isActive
                      ? 'bg-brand-50 dark:bg-brand-900/20 text-brand-600 dark:text-brand-400'
                      : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-dark-bg hover:text-gray-900 dark:hover:text-gray-100'
                  }`
                }
              >
                {/* Icon */}
                <span className="font-mono text-xs w-6 h-6 flex items-center justify-center bg-gray-100 dark:bg-dark-bg rounded">
                  {tool.icon}
                </span>
                {tool.label}
              </NavLink>
            ))}

          </div>
        ))}
      </nav>

      {/* Bottom User Section */}
      <div className="px-4 py-4 border-t border-gray-200 dark:border-dark-border">
        <p className="text-xs text-gray-400 text-center">
          All tools run in your browser
        </p>
      </div>

    </aside>
  );
};

export default Sidebar;