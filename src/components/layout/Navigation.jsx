export default function Navigation({ tools, activeTab, onTabChange }) {
    return (
        <nav className="flex flex-wrap gap-2 justify-center">
            {tools.map((tool) => (
                <button
                    key={tool.id}
                    onClick={() => onTabChange(tool.id)}
                    className={`border-gray-800 ${
                        activeTab === tool.id
                            ? 'btn-rebecca'
                            : 'btn-regular'
                        } px-6 py-4`}
                >
                    {tool.name}
                </button>
            ))}
        </nav>
    )
  }