import React, { useState, useEffect, useCallback } from 'react';
import { Copy, Download, Palette, Eye, EyeOff, RefreshCw, Check, AlertTriangle } from 'lucide-react';

const ColorPaletteGenerator = () => {
    const [baseColor, setBaseColor] = useState('#663399');
    const [harmonyType, setHarmonyType] = useState('complementary');
    const [palette, setPalette] = useState([]);
    const [exportFormat, setExportFormat] = useState('css');
    const [colorFormat, setColorFormat] = useState('oklch');
    const [showAccessibility, setShowAccessibility] = useState(true);
    const [copiedColor, setCopiedColor] = useState(null);
    const [copiedPalette, setCopiedPalette] = useState(false);

    // color validation utility (oklch input soonTM)
    const isValidHex = (hex) => {
        return /^#?([a-f\d]{3}|[a-f\d]{6})$/i.test(hex);
    };

    const normalizeHex = (hex) => {
        // remove # if present
        hex = hex.replace('#', '');
        
        // convert 3 digit hex to 6 digit
        if (hex.length === 3) {
            hex = hex.split('').map(char => char + char).join('');
        }
    
        return '#' + hex;
    };

    // color conversion
    const hexToRgb = (hex) => {
        if (!isValidHex(hex)) return null;

        const normalizedHex = normalizeHex(hex);
        const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(normalizedHex);
        
        return result ? {
            r: parseInt(result[1], 16),
            g: parseInt(result[2], 16),
            b: parseInt(result[3], 16)
        } : null;
    };

    const rgbToHex = (r, g, b) => {
        return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
    };

    const rgbToHsl = (r, g, b) => {
        r /= 255;
        g /= 255;
        b /= 255;
        const max = Math.max(r, g, b);
        const min = Math.min(r, g, b);
        let h, s, l = (max + min) / 2;

        if (max === min) {
            h = s = 0;
        } else {
            const d = max - min;
            s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
            switch (max) {
                case r: h = (g - b) / d + (g < b ? 6 : 0); break;
                case g: h = (b - r) / d + 2; break;
                case b: h = (r - g) / d + 4; break;
            }
            h /= 6;
        }

        return {
            h: Math.round(h * 360),
            s: Math.round(s * 100),
            l: Math.round(l * 100)
        };
    };

    const hslToRgb = (h, s, l) => {
        h /= 360;
        s /= 100;
        l /= 100;
        const hue2rgb = (p, q, t) => {
            if (t < 0) t += 1;
            if (t > 1) t -= 1;
            if (t < 1/6) return p + (q - p) * 6 * t;
            if (t < 1/2) return q;
            if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
            return p;
        };

        let r, g, b;

        if (s === 0) {
            r = g = b = l;
        } else {
            const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
            const p = 2 * l - q;
            r = hue2rgb(p, q, h + 1/3);
            g = hue2rgb(p, q, h);
            b = hue2rgb(p, q, h - 1/3);
        }

        return {
            r: Math.round(r * 255),
            g: Math.round(g * 255),
            b: Math.round(b * 255)
        };
    };

    const rgbToOklch = (r, g, b) => {
        // convert RGB to linear RGB
        const linearRgb = [r, g, b].map(c => {
            c = c / 255;
            return c <= 0.04045 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
        });
    
        // to XYZ (i hate this)
        const [rLin, gLin, bLin] = linearRgb;
        const x = 0.4124564 * rLin + 0.3575761 * gLin + 0.1804375 * bLin;
        const y = 0.2126729 * rLin + 0.7151522 * gLin + 0.0721750 * bLin;
        const z = 0.0193339 * rLin + 0.1191920 * gLin + 0.9503041 * bLin;
    
        // to OKLab
        const l_ = Math.cbrt(0.8189330101 * x + 0.3618667424 * y - 0.1288597137 * z);
        const m_ = Math.cbrt(0.0329845436 * x + 0.9293118715 * y + 0.0361456387 * z);
        const s_ = Math.cbrt(0.0482003018 * x + 0.2643662691 * y + 0.6338517070 * z);
    
        const l = 0.2104542553 * l_ + 0.7936177850 * m_ - 0.0040720468 * s_;
        const a = 1.9779984951 * l_ - 2.4285922050 * m_ + 0.4505937099 * s_;
        const b_lab = 0.0259040371 * l_ + 0.7827717662 * m_ - 0.8086757660 * s_;
    
        // to OKLCH
        const L = l;
        const C = Math.sqrt(a * a + b_lab * b_lab);
        let H = Math.atan2(b_lab, a) * 180 / Math.PI;
        
        // hue normalization
        if (H < 0) H += 360;
    
        return {
            l: Math.round(L * 10000) / 10000,
            c: Math.round(C * 10000) / 10000,
            h: Math.round(H * 100) / 100
        };
    };
    
    // color harmony generators
    const generateComplementary = (baseHex) => {
        const rgb = hexToRgb(baseHex);
        if (!rgb) return [{ hex: baseHex, name: 'Base' }];
        
        const { h, s, l } = rgbToHsl(rgb.r, rgb.g, rgb.b);
        
        const complementaryH = (h + 180) % 360;
        const complementaryRgb = hslToRgb(complementaryH, s, l);
        
        return [
            { hex: baseHex, name: 'Base' },
            { hex: rgbToHex(complementaryRgb.r, complementaryRgb.g, complementaryRgb.b), name: 'Complementary' }
        ];
    };

    const generateTriadic = (baseHex) => {
        const rgb = hexToRgb(baseHex);
        if (!rgb) return [{ hex: baseHex, name: 'Base' }];
        
        const { h, s, l } = rgbToHsl(rgb.r, rgb.g, rgb.b);
        
        const triadic1H = (h + 120) % 360;
        const triadic2H = (h + 240) % 360;
        
        const triadic1Rgb = hslToRgb(triadic1H, s, l);
        const triadic2Rgb = hslToRgb(triadic2H, s, l);
        
        return [
            { hex: baseHex, name: 'Base' },
            { hex: rgbToHex(triadic1Rgb.r, triadic1Rgb.g, triadic1Rgb.b), name: 'Triadic 1' },
            { hex: rgbToHex(triadic2Rgb.r, triadic2Rgb.g, triadic2Rgb.b), name: 'Triadic 2' }
        ];
    };

    const generateAnalogous = (baseHex) => {
        const rgb = hexToRgb(baseHex);
        if (!rgb) return [{ hex: baseHex, name: 'Base' }];
        
        const { h, s, l } = rgbToHsl(rgb.r, rgb.g, rgb.b);
        
        const analogous1H = (h + 30) % 360;
        const analogous2H = (h - 30 + 360) % 360;
        
        const analogous1Rgb = hslToRgb(analogous1H, s, l);
        const analogous2Rgb = hslToRgb(analogous2H, s, l);
        
        return [
            { hex: rgbToHex(analogous2Rgb.r, analogous2Rgb.g, analogous2Rgb.b), name: 'Analogous -30°' },
            { hex: baseHex, name: 'Base' },
            { hex: rgbToHex(analogous1Rgb.r, analogous1Rgb.g, analogous1Rgb.b), name: 'Analogous +30°' }
        ];
    };

    const generateTetradic = (baseHex) => {
        const rgb = hexToRgb(baseHex);
        if (!rgb) return [{ hex: baseHex, name: 'Base' }];
        
        const { h, s, l } = rgbToHsl(rgb.r, rgb.g, rgb.b);
        
        const tetradic1H = (h + 90) % 360;
        const tetradic2H = (h + 180) % 360;
        const tetradic3H = (h + 270) % 360;
        
        const tetradic1Rgb = hslToRgb(tetradic1H, s, l);
        const tetradic2Rgb = hslToRgb(tetradic2H, s, l);
        const tetradic3Rgb = hslToRgb(tetradic3H, s, l);
        
        return [
            { hex: baseHex, name: 'Base' },
            { hex: rgbToHex(tetradic1Rgb.r, tetradic1Rgb.g, tetradic1Rgb.b), name: 'Tetradic +90°' },
            { hex: rgbToHex(tetradic2Rgb.r, tetradic2Rgb.g, tetradic2Rgb.b), name: 'Tetradic +180°' },
            { hex: rgbToHex(tetradic3Rgb.r, tetradic3Rgb.g, tetradic3Rgb.b), name: 'Tetradic +270°' }
        ];
    };

    const generateMonochromatic = (baseHex) => {
        const rgb = hexToRgb(baseHex);
        if (!rgb) return [{ hex: baseHex, name: 'Base' }];
        
        const { h, s, l } = rgbToHsl(rgb.r, rgb.g, rgb.b);
        
        const lightnesses = [20, 40, 60, 80];
        
        return [
            { hex: baseHex, name: 'Base' },
            ...lightnesses.map((lightness, index) => {
                const monoRgb = hslToRgb(h, s, lightness);
                return { 
                    hex: rgbToHex(monoRgb.r, monoRgb.g, monoRgb.b), 
                    name: `Mono ${lightness}%` 
                };
            })
        ];
    };

    // accessibility contrast calculation
    const calculateLuminance = (r, g, b) => {
        const [rs, gs, bs] = [r, g, b].map(c => {
            c = c / 255;
            return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
        });
        return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
    };

    const calculateContrastRatio = (color1, color2) => {
        const rgb1 = hexToRgb(color1);
        const rgb2 = hexToRgb(color2);
        
        if (!rgb1 || !rgb2) return 1; // return minimum contrast if invalid colors
        
        const lum1 = calculateLuminance(rgb1.r, rgb1.g, rgb1.b);
        const lum2 = calculateLuminance(rgb2.r, rgb2.g, rgb2.b);
        
        const brighter = Math.max(lum1, lum2);
        const darker = Math.min(lum1, lum2);
        
        return (brighter + 0.05) / (darker + 0.05);
    };

    const getAccessibilityRating = (ratio) => {
        if (ratio >= 7) return { level: 'AAA', text: 'Excellent', color: 'text-green-600' };
        if (ratio >= 4.5) return { level: 'AA', text: 'Good', color: 'text-blue-600' };
        if (ratio >= 3) return { level: 'A', text: 'Fair', color: 'text-yellow-600' };
        return { level: 'Fail', text: 'Poor', color: 'text-red-600' };
    };

    // color format conversion
    const formatColor = (hex, format) => {
        const rgb = hexToRgb(hex);
        if (!rgb) return hex; // return original hex if conversion fails
        
        const { h, s, l } = rgbToHsl(rgb.r, rgb.g, rgb.b);
        const oklch = rgbToOklch(rgb.r, rgb.g, rgb.b);

        switch (format) {
        case 'hex':
            return hex.toUpperCase();
        case 'rgb':
            return `rgb(${rgb.r}, ${rgb.g}, ${rgb.b})`;
        case 'rgba':
            return `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 1)`;
        case 'hsl':
            return `hsl(${h}, ${s}%, ${l}%)`;
        case 'hsla':
            return `hsla(${h}, ${s}%, ${l}%, 1)`;
        case 'oklch':
            return `oklch(${oklch.l} ${oklch.c} ${oklch.h})`;
        default:
            return hex;
        }
    };

    // generate palette based on harmony type
    const generatePalette = useCallback(() => {
        // only generate palette if we have a valid hex color
        if (!isValidHex(baseColor)) {
            return;
        }

        let newPalette = [];
        
        try {
            switch (harmonyType) {
                case 'complementary':
                newPalette = generateComplementary(baseColor);
                break;
                case 'triadic':
                newPalette = generateTriadic(baseColor);
                break;
                case 'analogous':
                newPalette = generateAnalogous(baseColor);
                break;
                case 'tetradic':
                newPalette = generateTetradic(baseColor);
                break;
                case 'monochromatic':
                newPalette = generateMonochromatic(baseColor);
                break;
                default:
                newPalette = [{ hex: baseColor, name: 'Base' }];
            }
            setPalette(newPalette);
        } catch (error) {
            console.error('Error generating palette:', error);
            // fallback to base color only
            setPalette([{ hex: baseColor, name: 'Base' }]);
        }
    }, [baseColor, harmonyType]);

    useEffect(() => {
        generatePalette();
    }, [generatePalette]);

    // copy functions
    const copyToClipboard = async (text, type = 'color') => {
        try {
            await navigator.clipboard.writeText(text);
            if (type === 'color') {
                setCopiedColor(text);
                setTimeout(() => setCopiedColor(null), 2000);
            } else {
                setCopiedPalette(true);
                setTimeout(() => setCopiedPalette(false), 2000);
            }
        } catch (err) {
            console.error('Failed to copy: ', err);
        }
    };

    // export functions
    const exportPalette = () => {
        let exportText = '';
        
        switch (exportFormat) {
        case 'css':
            exportText = ':root {\n';
            palette.forEach((color, index) => {
                const varName = color.name.toLowerCase().replace(/\s+/g, '-');
                exportText += `  --color-${varName}: ${formatColor(color.hex, colorFormat)};\n`;
            });
            exportText += '}';
            break;
            
        case 'scss':
            palette.forEach((color, index) => {
                const varName = color.name.toLowerCase().replace(/\s+/g, '-');
                exportText += `$color-${varName}: ${formatColor(color.hex, colorFormat)};\n`;
            });
            break;
            
        case 'json':
            const jsonObj = {};
            palette.forEach(color => {
                const key = color.name.toLowerCase().replace(/\s+/g, '_');
                jsonObj[key] = {
                    hex: color.hex,
                    rgb: formatColor(color.hex, 'rgb'),
                    hsl: formatColor(color.hex, 'hsl'),
                    oklch: formatColor(color.hex, 'oklch')
                };
            });
            exportText = JSON.stringify(jsonObj, null, 2);
            break;
        }
        
        copyToClipboard(exportText, 'palette');
    };

    const harmonyTypes = [
        { value: 'complementary', label: 'Complementary' },
        { value: 'triadic', label: 'Triadic' },
        { value: 'analogous', label: 'Analogous' },
        { value: 'tetradic', label: 'Tetradic (Square)' },
        { value: 'monochromatic', label: 'Monochromatic' }
    ];

    const colorFormats = [
        { value: 'oklch', label: 'OKLCH' },
        { value: 'hex', label: 'HEX' },
        { value: 'rgb', label: 'RGB' },
        { value: 'rgba', label: 'RGBA' },
        { value: 'hsl', label: 'HSL' },
        { value: 'hsla', label: 'HSLA' }
    ];

    const exportFormats = [
        { value: 'css', label: 'CSS Variables' },
        { value: 'scss', label: 'SCSS Variables' },
        { value: 'json', label: 'JSON' }
    ];

    return (
        <div className="content-wrapper">
            {/* Header */}
            <div className="content-header">
                <div className="flex items-center justify-center gap-2">
                    <Palette className="w-6 h-6 text-rebecca" />
                    <h1 className="tool-name">
                        Color Palette Generator
                    </h1>
                </div>
                <p className="tool-desc">
                    Create and export color palettes based on your primary or brand color
                </p>
            </div>

            {/* Controls */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 my-8">
                <div>
                    <label className="input-label">Base Color</label>
                    <div className="flex gap-2">
                        <input
                            type="color"
                            value={baseColor}
                            onChange={(e) => setBaseColor(e.target.value)}
                            className="w-12 h-10 px-0.5 rounded border border-gray-600 cursor-pointer"
                        />
                        <input
                            type="text"
                            value={baseColor}
                            onChange={(e) => setBaseColor(e.target.value)}
                            className="color-input"
                            placeholder="#3498db"
                        />
                    </div>
                </div>

                <div>
                    <label className="input-label">Harmony Type</label>
                    <select
                        value={harmonyType}
                        onChange={(e) => setHarmonyType(e.target.value)}
                        className="color-input"
                    >
                        {harmonyTypes.map(type => (
                        <option key={type.value} value={type.value}>{type.label}</option>
                        ))}
                    </select>
                </div>

                <div>
                    <label className="input-label">Color Format</label>
                    <select
                        value={colorFormat}
                        onChange={(e) => setColorFormat(e.target.value)}
                        className="color-input"
                    >
                        {colorFormats.map(format => (
                            <option key={format.value} value={format.value}>{format.label}</option>
                        ))}
                    </select>
                </div>

                <div>
                    <label className="input-label">Export Format</label>
                    <select
                        value={exportFormat}
                        onChange={(e) => setExportFormat(e.target.value)}
                        className="color-input"
                    >
                        {exportFormats.map(format => (
                        <option key={format.value} value={format.value}>{format.label}</option>
                        ))}
                    </select>
                </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap gap-4 mb-8">
                <button
                    onClick={exportPalette}
                    className="btn-rebecca"
                >
                    {copiedPalette ? <Check className="w-4 h-4" /> : <Download className="w-4 h-4" />}
                    {copiedPalette ? 'Copied!' : 'Export Palette'}
                </button>

                <button
                    onClick={generatePalette}
                    className="btn-regular"
                >
                    <RefreshCw className="w-4 h-4" />
                    Regenerate
                </button>

                <button
                    onClick={() => setShowAccessibility(!showAccessibility)}
                    className="btn-regular"
                >
                    {showAccessibility ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    {showAccessibility ? 'Hide' : 'Show'} Accessibility
                </button>
            </div>

            {/* Palette Display */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {palette.map((color, index) => {
                    const whiteContrast = calculateContrastRatio(color.hex, '#FFFFFF');
                    const blackContrast = calculateContrastRatio(color.hex, '#000000');
                    const whiteRating = getAccessibilityRating(whiteContrast);
                    const blackRating = getAccessibilityRating(blackContrast);
                    const formattedColor = formatColor(color.hex, colorFormat);

                    return (
                        <div key={index} className="color-card">
                            <div 
                                className="w-full h-32 rounded-lg mb-4 border border-gray-600 relative overflow-hidden"
                                style={{ backgroundColor: color.hex }}
                            >
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <div className="bg-black bg-opacity-50 text-white px-2 py-1 rounded text-sm font-medium">
                                        {color.name}
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-3">
                                <div className="flex items-center justify-between">
                                    <code className="text-sm font-mono py-1 rounded">
                                        {formattedColor}
                                    </code>
                                    <button
                                        onClick={() => copyToClipboard(formattedColor)}
                                        className="p-2 text-gray-300 bg-gray-800 hover:text-rebecca hover:bg-gray-950 rounded transition-colors"
                                    >
                                        {copiedColor === formattedColor ? (
                                            <Check className="w-4 h-4 text-green-600" />
                                        ) : (
                                            <Copy className="w-4 h-4" />
                                        )}
                                    </button>
                                </div>

                                {showAccessibility && (
                                <div className="space-y-2">
                                    <div className="text-xs font-medium text-gray-300 mb-2">Accessibility</div>
                                    <div className="flex justify-between items-center text-xs">
                                        <span className="text-gray-300">vs White:</span>
                                        <div className="flex items-center gap-1">
                                            <span className={whiteRating.color}>{whiteRating.level}</span>
                                            <span className="text-gray-300">({whiteContrast.toFixed(1)}:1)</span>
                                        </div>
                                    </div>
                                    <div className="flex justify-between items-center text-xs">
                                        <span className="text-gray-300">vs Black:</span>
                                        <div className="flex items-center gap-1">
                                            <span className={blackRating.color}>{blackRating.level}</span>
                                            <span className="text-gray-300">({blackContrast.toFixed(1)}:1)</span>
                                        </div>
                                    </div>
                                </div>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>

            <div className="mt-8 tooltip">
                <h3 className="text-sm font-medium text-gray-300 mb-2 flex items-center gap-2">
                    Useful Links
                </h3>
                <ul>
                    <li><a className='underline text-rebecca hover:text-rebecca-light' href="https://evilmartians.com/chronicles/oklch-in-css-why-quit-rgb-hsl">Why OKLCH is better than RGB and HSL</a></li>
                    <li><a className='underline text-rebecca hover:text-rebecca-light' href="https://oklch.com">OKLCH color picker and visualizer</a></li>
                </ul>
            </div>

            {/* Accessibility Legend */}
            {showAccessibility && (
                <div className="mt-8">
                    <h3 className="text-sm font-medium text-gray-300 mb-2 flex items-center gap-2">
                        <AlertTriangle className="w-4 h-4" />
                        Accessibility Guide
                    </h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs">
                        <div>
                            <span className="text-green-600 font-medium">AAA</span>
                            <span className="text-gray-300"> - 7:1+ (Excellent)</span>
                        </div>
                        <div>
                            <span className="text-blue-600 font-medium">AA</span>
                            <span className="text-gray-300"> - 4.5:1+ (Good)</span>
                        </div>
                        <div>
                            <span className="text-yellow-600 font-medium">A</span>
                            <span className="text-gray-300"> - 3:1+ (Fair)</span>
                        </div>
                        <div>
                            <span className="text-red-600 font-medium">Fail</span>
                            <span className="text-gray-300"> - Below 3:1 (Poor)</span>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ColorPaletteGenerator;