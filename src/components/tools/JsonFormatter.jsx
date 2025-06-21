import { useState, useCallback } from 'react';
import { Copy, Check, AlertCircle, FileText } from 'lucide-react';

export default function JsonFormatter() {
    const [input, setInput] = useState('');
    const [output, setOutput] = useState('');
    const [error, setError] = useState('');
    const [copied, setCopied] = useState(false);
    const [isValid, setIsValid] = useState(null);

    const formatJson = useCallback((jsonString) => {
        if (!jsonString.trim()) {
            setOutput('');
            setError('');
            setIsValid(null);
            return;
        }

        try {
            const parsed = JSON.parse(jsonString);
            const formatted = JSON.stringify(parsed, null, 2);
            setOutput(formatted);
            setError('');
            setIsValid(true);
        } catch (err) {
            setError(`Invalid JSON: ${err.message}`);
            setOutput('');
            setIsValid(false);
        }
    }, []);

    const handleInputChange = (e) => {
        const value = e.target.value;
        setInput(value);
        formatJson(value);
    };

    const handleCopy = async () => {
        if (!output) return;
        
        try {
            await navigator.clipboard.writeText(output);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch (err) {
            console.error('Failed to copy:', err);
        }
    };

    const handleClear = () => {
        setInput('');
        setOutput('');
        setError('');
        setIsValid(null);
    };

    const minifyJson = () => {
        if (!input.trim()) return;
        
        try {
            const parsed = JSON.parse(input);
            const minified = JSON.stringify(parsed);
            setOutput(minified);
            setError('');
            setIsValid(true);
        } catch (err) {
            setError(`Invalid JSON: ${err.message}`);
            setOutput('');
            setIsValid(false);
        }
    };

    return (
        <div className="content-wrapper">
            {/* Header */}
            <div className="content-header">
                <div className="flex items-center justify-center gap-2">
                    <FileText className="w-6 h-6 text-rebecca" />
                    <h1 className="tool-name">
                        JSON Formatter & Validator
                    </h1>
                </div>
                <p className="tool-desc">
                    Format, validate, and minify JSON with real-time feedback
                </p>
            </div>

            {/* Controls */}
            <div className="flex flex-wrap gap-3 justify-center my-8">
                <button
                    onClick={handleClear}
                    className="btn-regular"
                >
                    Clear
                </button>
                <button
                    onClick={minifyJson}
                    disabled={!input.trim()}
                    className="btn-regular disabled:bg-gray-400 disabled:cursor-not-allowed"
                >
                    Minify
                </button>
            </div>

            {/* Status Indicator */}
            {isValid !== null && (
                <div className={`flex items-center justify-center gap-2 p-3 rounded-lg ${
                    isValid 
                        ? 'bg-green-900/20 text-green-400' 
                        : 'bg-red-900/20 text-red-400'
                    }`}>
                    {isValid ? (
                        <>
                            <Check className="w-4 h-4" />
                            <span className="font-medium">Valid JSON</span>
                        </>
                    ) : (
                        <>
                            <AlertCircle className="w-4 h-4" />
                            <span className="font-medium">Invalid JSON</span>
                        </>
                    )}
                </div>
            )}

            {/* Main Content */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Input Section */}
                <div className="space-y-3">
                    <label className="input-label">
                        Input JSON
                    </label>
                    <textarea
                        value={input}
                        onChange={handleInputChange}
                        placeholder="Paste your JSON here..."
                        className="w-full h-80 p-4 border border-gray-600 rounded-lg bg-gray-900 text-gray-100 
                                focus:ring-2 focus:ring-rebecca focus:border-transparent font-mono text-sm resize-none"
                    />
                </div>

                {/* Output Section */}
                <div className="space-y-3">
                    <div className="flex items-center justify-between">
                        <label className="input-label mb-0">
                            Formatted Output
                        </label>
                        {output && (
                            <button
                                onClick={handleCopy}
                                className="flex items-center gap-2 px-3 py-1 text-sm bg-gray-700 hover:bg-gray-600 text-gray-300 rounded-md transition-colors"
                            >
                                {copied ? (
                                    <>
                                        <Check className="w-4 h-4" />
                                        Copied!
                                    </>
                                    ) : (
                                    <>
                                        <Copy className="w-4 h-4" />
                                        Copy
                                    </>
                                )}
                            </button>
                        )}
                    </div>
                    <div className="relative">
                        <textarea
                            value={output}
                            readOnly
                            placeholder="Formatted JSON will appear here..."
                            className="w-full h-80 p-4 border border-gray-600 rounded-lg bg-gray-900 text-gray-100 font-mono text-sm resize-none"
                        />
                    </div>
                </div>
            </div>

            {/* Error Display */}
            {error && (
                <div className="p-4 bg-red-900/20 border border-red-800 rounded-lg">
                    <div className="flex items-start gap-2">
                        <AlertCircle className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" />
                        <div>
                            <h3 className="font-medium text-red-400">JSON Validation Error</h3>
                            <p className="text-sm text-red-300 mt-1 font-mono">{error}</p>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}