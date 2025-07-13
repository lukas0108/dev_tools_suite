import { useState } from 'react'
import Header from './components/layout/Header'
import Navigation from './components/layout/Navigation'
import JsonFormatter from './components/tools/JsonFormatter'
import ColorPaletteGenerator from './components/tools/ColorPalette'
import Footer from './components/layout/Footer'

const tools = [
    { id: 'json', name: 'JSON Formatter', component: JsonFormatter },
    { id: 'colors', name: 'Color Palette Generator', component: ColorPaletteGenerator },
]

export default function App() {
    const [activeTab, setActiveTab] = useState('json')
  
    const ActiveComponent = tools.find(tool => tool.id === activeTab)?.component

    return (
        <div className="min-h-screen max-h-max bg-gray-950 flex flex-col items-center">
            <div className="fixed top-0 bg-gray-950 h-4 w-full z-40 "></div>
            <Header />
            <main className="container mx-auto px-4 pt-27">
                <Navigation 
                    tools={tools}
                    activeTab={activeTab}
                    onTabChange={setActiveTab}
                />
                <div className="my-8">
                    {ActiveComponent && <ActiveComponent />}
                </div>
            </main>
            <Footer />
        </div>
    )
}