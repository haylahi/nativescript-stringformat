// The MIT License (MIT)
// 
// Copyright (c) Marcel Joachim Kloubert <marcel.kloubert@gmx.net>
// 
// Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:
// 
// The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.
// 
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

var _formatProviders = [];


/**
 * Describes a format provider context.
 */
export interface IFormatProviderContext {
    /**
     * The format expression.
     */
    expression: string;
    
    /**
     * Gets if the expression has been handled or not.
     */
    handled: boolean;
    
    /**
     * Gets the underlying value.
     */
    value: any;
}

class FormatProviderContext implements IFormatProviderContext {
    _expression: string;
    _value: any;
    
    constructor(expr: string, val: any) {
        this._expression = expr;
        this._value = val;
    }
    
    handled: boolean;
    
    public get expression(): string {
        return this._expression;
    }
    
    public get value(): any {
        return this._value;
    }
}


/**
 * Adds a format provider.
 * 
 * @function addFormatProvider
 * 
 * @param 
 */
export function addFormatProvider(providerCallback: (ctx: IFormatProviderContext) => any) {
    _formatProviders.push(providerCallback);
}

/**
 * Formats a string.
 * 
 * @function formatArray
 * 
 * @param {String} [formatStr] The format string.
 * @param {Array} [args] The list of arguments for the format string.
 * 
 * @return {String} The formatted string.
 */
export function formatArray(formatStr?: string, args?: any[]) : string {
    if (!formatStr) {
        return formatStr;
    }

    if (!args) {
        args = [];
    }
    
    return formatStr.replace(/{(\d+)(\:)?([^}]*)}/g, function(match, index, formatSeparator, formatExpr) {
        var resultValue = args[index];

        if (resultValue === undefined) {
            return match;
        }
        
        var funcDepth = 0;
        while (typeof resultValue === "function") {
            resultValue = resultValue(index, args, match, formatExpr, funcDepth++);
        }
        
        if (formatSeparator === ':') {
            // use format providers
            
            for (var i = 0; i < _formatProviders.length; i++) {
                var fp = _formatProviders[i];
                
                var fpCtx = new FormatProviderContext(formatExpr, resultValue);
                fpCtx.handled = false;
                
                var fpResult;
                try {
                    fpResult = fp(fpCtx);
                }
                catch (e) {
                    continue;
                }
                
                if (fpCtx.handled) {
                    // handled: first wins
                    
                    resultValue = fpResult;
                    break;
                }
            }
        }
        
        if (resultValue !== undefined) {
            return resultValue;
        }

        // not defined => return whole match string
        return resultValue;
    });
}

/**
 * Formats a string.
 * 
 * @function format
 * 
 * @param {String} [formatStr] The format string.
 * @param ...any [args] One or more argument for the format string.
 * 
 * @return {String} The formatted string.
 */
export function format(formatStr?: string, ...args: any[]) : string {
    return formatArray(formatStr, args);
}