import { Code, Github } from 'lucide-react'

export default function Header() {
    return (
        <header className="fixed top-0 left-0 w-full bg-rebecca/6 shadow-sm border-b border-rebecca/50 backdrop-filter backdrop-blur-xs z-50">
            <div className="container mx-auto px-4 py-4">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <Code className="w-8 h-8 text-rebecca" />
                        <div>
                            <h1 className="text-xl font-bold text-white">
                                DevTools Suite
                            </h1>
                            <p className="text-sm text-gray-400">
                                Clean, fast developer utilities
                            </p>
                        </div>
                    </div>
                    
                    <div className="flex items-center gap-4">
                        <a
                            href="https://github.com/lukas0108/dev_tools_suite"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-2 text-gray-400 hover:text-rebecca-light transition-colors"
                        >
                            <Github className="w-5 h-5" />
                            <span className="hidden sm:inline">View on GitHub</span>
                        </a>
                    </div>
                </div>
            </div>
        </header>
    )
}