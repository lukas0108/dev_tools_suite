import React, { useState, useEffect, useCallback } from 'react';
import { Copy, Download, Palette, Eye, EyeOff, RefreshCw, Check, AlertTriangle } from 'lucide-react';

const ColorPaletteGenerator = () => {
  const [baseColor, setBaseColor] = useState('#3498db');
  const [harmonyType, setHarmonyType] = useState('complementary');
  const [palette, setPalette] = useState([]);
  const [exportFormat, setExportFormat] = useState('css');
  const [colorFormat, setColorFormat] = useState('hex');
  const [showAccessibility, setShowAccessibility] = useState(true);
  const [copiedColor, setCopiedColor] = useState(null);
  const [copiedPalette, setCopiedPalette] = useState(false);

  // Color validation utility
  const isValidHex = (hex) => {
    return /^#?([a-f\d]{3}|[a-f\d]{6})$/i.test(hex);
  };

  const normalizeHex = (hex) => {
    // Remove # if present
    hex = hex.replace('#', '');
    
    // Convert 3-digit hex to 6-digit
    if (hex.length === 3) {
      hex = hex.split('').map(char => char + char).join('');
    }
    
    return '#' + hex;
  };

  // Color conversion utilities
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
    // Simplified OKLCH conversion (approximation)
    const { h, s, l } = rgbToHsl(r, g, b);
    return {
      l: Math.round(l * 100) / 100,
      c: Math.round(s * 0.4) / 100,
      h: h
    };
  };

  // Color harmony generators
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

  // Accessibility contrast calculation
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
    
    if (!rgb1 || !rgb2) return 1; // Return minimum contrast if invalid colors
    
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

  // Color format conversion
  const formatColor = (hex, format) => {
    const rgb = hexToRgb(hex);
    if (!rgb) return hex; // Return original hex if conversion fails
    
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

  // Generate palette based on harmony type
  const generatePalette = useCallback(() => {
    // Only generate palette if we have a valid hex color
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
      // Fallback to base color only
      setPalette([{ hex: baseColor, name: 'Base' }]);
    }
  }, [baseColor, harmonyType]);

  useEffect(() => {
    generatePalette();
  }, [generatePalette]);

  // Copy functions
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

  // Export functions
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
    { value: 'hex', label: 'HEX' },
    { value: 'rgb', label: 'RGB' },
    { value: 'rgba', label: 'RGBA' },
    { value: 'hsl', label: 'HSL' },
    { value: 'hsla', label: 'HSLA' },
    { value: 'oklch', label: 'OKLCH' }
  ];

  const exportFormats = [
    { value: 'css', label: 'CSS Variables' },
    { value: 'scss', label: 'SCSS Variables' },
    { value: 'json', label: 'JSON' }
  ];

  return (
    <div className="max-w-6xl mx-auto p-6 bg-gray-800 rounded-xl shadow-lg">
      <div className="flex items-center gap-3 mb-8">
        <Palette className="w-8 h-8 text-rebecca" />
        <h1 className="text-3xl font-bold text-gray-100">Color Palette Generator</h1>
      </div>

      {/* Controls */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div>
          <label className="block text-sm font-medium text-gray-100 mb-2">Base Color</label>
          <div className="flex gap-2">
            <input
              type="color"
              value={baseColor}
              onChange={(e) => setBaseColor(e.target.value)}
              className="w-12 h-10 rounded border border-gray-300 cursor-pointer"
            />
            <input
              type="text"
              value={baseColor}
              onChange={(e) => setBaseColor(e.target.value)}
              className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-rebecca focus:border-transparent focus:bg-gray-900"
              placeholder="#3498db"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-100 mb-2">Harmony Type</label>
          <select
            value={harmonyType}
            onChange={(e) => setHarmonyType(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-rebecca focus:border-transparent focus:bg-gray-900"
          >
            {harmonyTypes.map(type => (
              <option key={type.value} value={type.value}>{type.label}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-100 mb-2">Color Format</label>
          <select
            value={colorFormat}
            onChange={(e) => setColorFormat(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-rebecca focus:border-transparent focus:bg-gray-900"
          >
            {colorFormats.map(format => (
              <option key={format.value} value={format.value}>{format.label}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-100 mb-2">Export Format</label>
          <select
            value={exportFormat}
            onChange={(e) => setExportFormat(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-rebecca focus:border-transparent focus:bg-gray-900"
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
          onClick={generatePalette}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <RefreshCw className="w-4 h-4" />
          Regenerate
        </button>

        <button
          onClick={exportPalette}
          className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
        >
          {copiedPalette ? <Check className="w-4 h-4" /> : <Download className="w-4 h-4" />}
          {copiedPalette ? 'Copied!' : 'Export Palette'}
        </button>

        <button
          onClick={() => setShowAccessibility(!showAccessibility)}
          className="flex items-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
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
            <div key={index} className="bg-gray-800 rounded-lg p-4 border border-gray-200">
              <div 
                className="w-full h-32 rounded-lg mb-4 border border-gray-300 relative overflow-hidden"
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
                  <code className="text-sm font-mono px-2 py-1 rounded">
                    {formattedColor}
                  </code>
                  <button
                    onClick={() => copyToClipboard(formattedColor)}
                    className="p-2 text-gray-100 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
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
                    <div className="text-xs font-medium text-gray-100 mb-1">Accessibility</div>
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-gray-100">vs White:</span>
                      <div className="flex items-center gap-1">
                        <span className={whiteRating.color}>{whiteRating.level}</span>
                        <span className="text-gray-100">({whiteContrast.toFixed(1)}:1)</span>
                      </div>
                    </div>
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-gray-100">vs Black:</span>
                      <div className="flex items-center gap-1">
                        <span className={blackRating.color}>{blackRating.level}</span>
                        <span className="text-gray-100">({blackContrast.toFixed(1)}:1)</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Accessibility Legend */}
      {showAccessibility && (
        <div className="mt-8 p-4 bg-gray-800 rounded-lg">
          <h3 className="text-sm font-medium text-gray-100 mb-2 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4" />
            Accessibility Guide
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs">
            <div>
              <span className="text-green-600 font-medium">AAA</span>
              <span className="text-gray-100"> - 7:1+ (Excellent)</span>
            </div>
            <div>
              <span className="text-blue-600 font-medium">AA</span>
              <span className="text-gray-100"> - 4.5:1+ (Good)</span>
            </div>
            <div>
              <span className="text-yellow-600 font-medium">A</span>
              <span className="text-gray-100"> - 3:1+ (Fair)</span>
            </div>
            <div>
              <span className="text-red-600 font-medium">Fail</span>
              <span className="text-gray-100"> - Below 3:1 (Poor)</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ColorPaletteGenerator;