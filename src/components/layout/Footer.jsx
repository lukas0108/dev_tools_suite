import { Github, ExternalLink } from "lucide-react"

export default function Footer() {
    return (
        <footer className="mt-auto mb-4 bg-rebecca/13 backdrop-blur-2xl shadow-sm border-2 rounded-full border-rebecca-light/50 w-fit">
            <div className="container flex flex-col w-full mx-auto px-8 py-4 text-center text-gray-400">
                <div className="flex justify-center items-center">
                    <a
                        href="https://www.binek.dev/"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center justify-center gap-2 text-gray-400 hover:text-rebecca-light transition-colors"
                    >
                        <h3>My Portfolio</h3>
                        <ExternalLink className="w-6 h-6" />
                    </a>
                    <a
                        href="https://www.binek.dev/"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center justify-center pl-2 text-gray-400 hover:text-rebecca-light transition-colors"
                    >
                        <Github className="w-6 h-6" />
                    </a>
                </div>
            </div>
        </footer>
    )
}