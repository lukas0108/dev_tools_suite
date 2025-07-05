export default function Footer() {
    return (
        <footer className="bg-rebecca/6 border-t border-rebecca/50 mt-16">
            <div className="container flex flex-col max-w-fit mx-auto px-4 py-6 text-center text-gray-400">
                <p>
                    Building a tool shed for all your web needs. More coming soon.
                </p>
                <a href="https://your-portfolio-url.com" className="text-rebecca hover:text-rebecca-light underline transition-colors">
                    My Portfolio
                </a>
                <p className="text-sm mt-2">
                    Open source • MIT License
                </p>
                <p className="text-sm">
                    Lukáš Bínek
                </p>
            </div>
        </footer>
    )
}