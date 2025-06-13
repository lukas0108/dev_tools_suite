export default function Navigation({ tools, activeTab, onTabChange }) {
    return (
        <nav className="flex flex-wrap gap-2 justify-center">
            {tools.map((tool) => (
                <button
                    key={tool.id}
                    onClick={() => onTabChange(tool.id)}
                    className={`px-6 py-3 rounded-lg font-medium transition-all ${
                    activeTab === tool.id
                        ? 'bg-rebecca text-white shadow-lg'
                        : 'bg-gray-800 text-gray-300 hover:bg-gray-700 border border-gray-600'
                    }`}
                >
                    {tool.name}
                </button>
            ))}
        </nav>
    )
  }