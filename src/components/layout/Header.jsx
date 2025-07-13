import { Code, Github } from 'lucide-react'

export default function Header() {
    return (
        <div className="flex justify-center">
            <header className="fixed top-4 mx-auto w-5/20 bg-rebecca/13 shadow-sm border-2 rounded-full border-rebecca/50 backdrop-blur-xs z-50">
                <div className="container mx-auto px-7 py-5">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <Code className="w-6 h-6 text-rebecca" />
                            <div>
                                <h1 className="font-bold text-white">
                                    DevTools Suite
                                </h1>
                            </div>
                        </div>
            
                        <div className="flex items-center gap-4 h-8">
                            <a
                                href="https://github.com/lukas0108/dev_tools_suite"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-2 text-gray-400 hover:text-rebecca-light transition-colors"
                            >
                                <span className="hidden sm:inline">View on GitHub</span>
                                <Github className="w-6 h-6" />
                            </a>
                        </div>
                    </div>
                </div>
            </header>
        </div>
    )
}