#! /usr/bin/env node
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const packInfo = require("../package.json");
const _1 = require("./");
const argv = process.argv;
const options = [
    { name: 'help', alias: 'h', desc: 'usage' },
    { name: 'version', alias: 'v', desc: 'show version' },
    { name: 'watch', alias: 'w', desc: 'watch file change' },
    {
        name: 'cwd',
        alias: 'c',
        desc: 'egg application base dir (default: process.cwd)',
        value: true,
        valueName: 'path',
        default: _1.defaultConfig.cwd,
    },
    {
        name: 'framework',
        alias: 'f',
        desc: 'egg framework(default: egg)',
        value: true,
        valueName: 'name',
    },
    { name: 'silent', alias: 's', desc: 'disabled log' },
    {
        name: 'ignore',
        alias: 'i',
        desc: 'ignore dir, your can ignore multiple dirs with comma like: -i proxy,controller',
        value: true,
        valueName: 'dir',
    },
];
let maxLen = 0;
const helpTxtList = [];
const argOption = {};
options.forEach(item => {
    argOption[item.name] =
        findInArgv(!!item.value, `-${item.alias}`, `--${item.name}`) ||
            item.default ||
            '';
    // collect help info
    const txt = `-${item.alias}, --${item.name}${item.value ? ` [${item.valueName || 'value'}]` : ''}`;
    helpTxtList.push(txt);
    maxLen = txt.length > maxLen ? txt.length : maxLen;
});
// show help info
if (argOption.help) {
    const optionInfo = helpTxtList.map((item, index) => `   ${item}${repeat(' ', maxLen - item.length)}   ${options[index].desc}`).join('\n');
    console.info(`
Usage: ets [options]
Options:
${optionInfo}
`);
    process.exit(0);
}
else if (argOption.version) {
    console.info(packInfo.version);
    process.exit(0);
}
const watchFiles = argOption.watch;
const watchDirs = {};
argOption.ignore.split(',').forEach(key => (watchDirs[key] = false));
const tsHelper = new _1.default({
    cwd: argOption.cwd,
    framework: argOption.framework,
    watch: watchFiles,
    watchDirs,
});
if (watchFiles && !argOption.silent) {
    tsHelper.on('update', p => {
        console.info(`[${packInfo.name}] ${p} generated`);
    });
    tsHelper.on('change', p => {
        console.info(`[${packInfo.name}] ${p} changed, trigger regenerating`);
    });
}
function repeat(str, times) {
    return Array(times + 1).join(str);
}
function findInArgv(hasValue, ...args) {
    for (const arg of args) {
        const index = argv.indexOf(arg);
        if (index > 0) {
            if (hasValue) {
                const val = argv[index + 1];
                return !val || val.startsWith('-') ? '' : val;
            }
            else {
                return 'true';
            }
        }
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYmluLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vc3JjL2Jpbi50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7QUFFQSw0Q0FBNEM7QUFDNUMseUJBQXdEO0FBQ3hELE1BQU0sSUFBSSxHQUFHLE9BQU8sQ0FBQyxJQUFJLENBQUM7QUFDMUIsTUFBTSxPQUFPLEdBQUc7SUFDZCxFQUFFLElBQUksRUFBRSxNQUFNLEVBQUUsS0FBSyxFQUFFLEdBQUcsRUFBRSxJQUFJLEVBQUUsT0FBTyxFQUFFO0lBQzNDLEVBQUUsSUFBSSxFQUFFLFNBQVMsRUFBRSxLQUFLLEVBQUUsR0FBRyxFQUFFLElBQUksRUFBRSxjQUFjLEVBQUU7SUFDckQsRUFBRSxJQUFJLEVBQUUsT0FBTyxFQUFFLEtBQUssRUFBRSxHQUFHLEVBQUUsSUFBSSxFQUFFLG1CQUFtQixFQUFFO0lBQ3hEO1FBQ0UsSUFBSSxFQUFFLEtBQUs7UUFDWCxLQUFLLEVBQUUsR0FBRztRQUNWLElBQUksRUFBRSxpREFBaUQ7UUFDdkQsS0FBSyxFQUFFLElBQUk7UUFDWCxTQUFTLEVBQUUsTUFBTTtRQUNqQixPQUFPLEVBQUUsZ0JBQWEsQ0FBQyxHQUFHO0tBQzNCO0lBQ0Q7UUFDRSxJQUFJLEVBQUUsV0FBVztRQUNqQixLQUFLLEVBQUUsR0FBRztRQUNWLElBQUksRUFBRSw2QkFBNkI7UUFDbkMsS0FBSyxFQUFFLElBQUk7UUFDWCxTQUFTLEVBQUUsTUFBTTtLQUNsQjtJQUNELEVBQUUsSUFBSSxFQUFFLFFBQVEsRUFBRSxLQUFLLEVBQUUsR0FBRyxFQUFFLElBQUksRUFBRSxjQUFjLEVBQUU7SUFDcEQ7UUFDRSxJQUFJLEVBQUUsUUFBUTtRQUNkLEtBQUssRUFBRSxHQUFHO1FBQ1YsSUFBSSxFQUNGLGdGQUFnRjtRQUNsRixLQUFLLEVBQUUsSUFBSTtRQUNYLFNBQVMsRUFBRSxLQUFLO0tBQ2pCO0NBQ0YsQ0FBQztBQUVGLElBQUksTUFBTSxHQUFHLENBQUMsQ0FBQztBQUNmLE1BQU0sV0FB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