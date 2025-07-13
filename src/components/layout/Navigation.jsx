export default function Navigation({ tools, activeTab, onTabChange }) {
    return (
        <nav className="flex gap-2 justify-center mt-8 pt-6">
            {tools.map((tool) => (
                <button
                    key={tool.id}
                    onClick={() => onTabChange(tool.id)}
                    className={`border-gray-800 transition-colors ${
                        activeTab === tool.id
                            ? 'text-rebecca-light border-b-2 border-rebecca'
                            : 'hover:text-rebecca-light'
                        } px-6 pb-2`}
                >
                    {tool.name}
                </button>
            ))}
        </nav>
    )
  }