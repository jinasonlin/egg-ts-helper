"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const chokidar = require("chokidar");
const events_1 = require("events");
const fs = require("fs");
const mkdirp = require("mkdirp");
const path = require("path");
const class_1 = require("./generators/class");
const extend_1 = require("./generators/extend");
exports.defaultConfig = {
    cwd: process.cwd(),
    framework: 'egg',
    typings: './typings',
    caseStyle: 'lower',
    autoRemoveJs: true,
    throttle: 500,
    watch: true,
    watchDirs: {
        extend: {
            path: 'app/extend',
            generator: 'extend',
            trigger: ['add', 'change', 'unlink'],
        },
        controller: {
            path: 'app/controller',
            interface: 'IController',
            generator: 'class',
            trigger: ['add', 'unlink'],
        },
        proxy: {
            path: 'app/proxy',
            interface: 'IProxy',
            generator: 'class',
            trigger: ['add', 'unlink'],
        },
        service: {
            path: 'app/service',
            interface: 'IService',
            generator: 'class',
            trigger: ['add', 'unlink'],
        },
    },
};
class TsHelper extends events_1.EventEmitter {
    constructor(options = {}) {
        super();
        this.tickerMap = {};
        this.generators = {};
        const config = Object.assign({}, exports.defaultConfig, options);
        // merge watchDirs
        config.watchDirs = Object.assign({}, exports.defaultConfig.watchDirs, options.watchDirs);
        // resolve config.typings to absolute url
        config.typings = getAbsoluteUrlByCwd(config.typings, config.cwd);
        // get framework name from option or package.json
        const pkgInfoPath = path.resolve(config.cwd, './package.json');
        if (fs.existsSync(pkgInfoPath)) {
            const pkgInfo = require(pkgInfoPath);
            config.framework =
                options.framework ||
                    (pkgInfo.egg ? pkgInfo.egg.framework : null) ||
                    exports.defaultConfig.framework;
        }
        this.config = config;
        // filter
        this.watchNameList = Object.keys(this.config.watchDirs).filter(key => !!this.config.watchDirs[key]);
        this.watchDirs = this.watchNameList.map(key => {
            const item = this.config.watchDirs[key];
            const p = item.path.replace(/\/|\\/, path.sep);
            return getAbsoluteUrlByCwd(p, config.cwd);
        });
        // add built-in ts generator
        class_1.default(this);
        extend_1.default(this);
        // generate d.ts on start
        process.nextTick(() => {
            this.watchDirs.forEach((_, i) => this.generateTs(i));
        });
        // start watching dirs
        if (config.watch) {
            this.initWatcher();
        }
    }
    // register d.ts generator
    register(name, tsGen) {
        this.generators[name] = tsGen;
    }
    // init watcher
    initWatcher() {
        const config = this.config;
        const watcher = (this.watcher = chokidar.watch(this.watchDirs));
        // listen watcher event
        watcher.on('ready', () => {
            watcher.on('add', p => this.onChange(p, 'add'));
            watcher.on('change', p => this.onChange(p, 'change'));
            watcher.on('unlink', (p) => {
                if (config.autoRemoveJs && p.endsWith('.ts')) {
                    // auto remove js while ts was deleted
                    const jsPath = p.substring(0, p.lastIndexOf('.')) + '.js';
                    if (fs.existsSync(jsPath)) {
                        fs.unlinkSync(jsPath);
                    }
                }
                this.onChange(p, 'unlink');
            });
        });
    }
    // find file path in watchDirs
    findInWatchDirs(p) {
        for (let i = 0; i < this.watchDirs.length; i++) {
            if (p.indexOf(this.watchDirs[i]) < 0) {
                continue;
            }
            return i;
        }
        return -1;
    }
    generateTs(index, type, changedFile) {
        const config = this.config;
        const dir = this.watchDirs[index];
        const generatorConfig = config.watchDirs[this.watchNameList[index]];
        if (type && !generatorConfig.trigger.includes(type)) {
            // check whether need to regenerate ts
            return;
        }
        const generator = this.generators[generatorConfig.generator];
        if (!generator) {
            throw new Error(`ts generator: ${generatorConfig.generator} not exist!!`);
        }
        const result = generator(Object.assign({}, generatorConfig, { dir, changedFile }), config);
        if (result) {
            const resultList = Array.isArray(result) ? result : [result];
            resultList.forEach(item => {
                if (item.content) {
                    mkdirp.sync(path.dirname(item.dist));
                    fs.writeFileSync(item.dist, '// This file was auto generated by ts-helper\n' +
                        '// Do not modify this file!!!!!!!!!\n\n' +
                        item.content);
                    this.emit('update', item.dist);
                }
                else if (fs.existsSync(item.dist)) {
                    fs.unlinkSync(item.dist);
                    this.emit('remove', item.dist);
                }
            });
        }
    }
    // trigger while file changed
    onChange(p, type) {
        // istanbul ignore next
        if (p.endsWith('d.ts')) {
            return;
        }
        const k = p.substring(0, p.lastIndexOf('.'));
        if (this.tickerMap[k]) {
            return;
        }
        // throttle 500ms
        this.tickerMap[k] = setTimeout(() => {
            const index = this.findInWatchDirs(p);
            // istanbul ignore next
            if (index < 0) {
                return;
            }
            this.emit('change', p);
            this.generateTs(index, type, p);
            this.tickerMap[k] = null;
        }, this.config.throttle);
    }
}
exports.default = TsHelper;
function getAbsoluteUrlByCwd(p, cwd) {
    return path.isAbsolute(p) ? p : path.resolve(cwd, p);
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi9zcmMvaW5kZXgudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFBQSxxQ0FBcUM7QUFDckMsbUNBQXNDO0FBQ3RDLHlCQUF5QjtBQUN6QixpQ0FBaUM7QUFDakMsNkJBQTZCO0FBQzdCLDhDQUFnRDtBQUNoRCxnREFBa0Q7QUF1Q3JDLFFBQUEsYUFBYSxHQUFHO0lBQzNCLEdBQUcsRUFBRSxPQUFPLENBQUMsR0FBRyxFQUFFO0lBQ2xCLFNBQVMsRUFBRSxLQUFLO0lBQ2hCLE9BQU8sRUFBRSxXQUFXO0lBQ3BCLFNBQVMsRUFBRSxPQUFPO0lBQ2xCLFlBQVksRUFBRSxJQUFJO0lBQ2xCLFFBQVEsRUFBRSxHQUFHO0lBQ2IsS0FBSyxFQUFFLElBQUk7SUFDWCxTQUFTLEVBQUU7UUFDVCxNQUFNLEVBQUU7WUFDTixJQUFJLEVBQUUsWUFBWTtZQUNsQixTQUFTLEVBQUUsUUFBUTtZQUNuQixPQUFPLEVBQUUsQ0FBQyxLQUFLLEVBQUUsUUFBUSxFQUFFLFFBQVEsQ0FBQztTQUNyQztRQUVELFVBQVUsRUFBRTtZQUNWLElBQUksRUFBRSxnQkFBZ0I7WUFDdEIsU0FBUyxFQUFFLGFBQWE7WUFDeEIsU0FBUyxFQUFFLE9BQU87WUFDbEIsT0FBTyxFQUFFLENBQUMsS0FBSyxFQUFFLFFBQVEsQ0FBQztTQUMzQjtRQUVELEtBQUssRUFBRTtZQUNMLElBQUksRUFBRSxXQUFXO1lBQ2pCLFNBQVMsRUFBRSxRQUFRO1lBQ25CLFNBQVMsRUFBRSxPQUFPO1lBQ2xCLE9BQU8sRUFBRSxDQUFDLEtBQUssRUFBRSxRQUFRLENBQUM7U0FDM0I7UUFFRCxPQUFPLEVBQUU7WUFDUCxJQUFJLEVBQUUsYUFBYTtZQUNuQixTQUFTLEVBQUUsVUFBVTtZQUNyQixTQUFTLEVBQUUsT0FBTztZQUNsQixPQUFPLEVBQUUsQ0FBQyxLQUFLLEVBQUUsUUFBUSxDQUFDO1NBQzNCO0tBQ0Y7Q0FDRixDQUFDO0FBRUYsY0FB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