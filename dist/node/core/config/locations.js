var path = require("path");
var _ = require("lodash");
function getDefaultConfig() {
    return {
        project: {
            root: process.cwd(),
            "package": "package.json",
            "systemjsConfig": "sytemjs.config.js",
            build: "build",
            dist: "dist",
            coverage: "coverage",
            sources: "src"
        },
        core: {
            base: "src/core",
            typescript: ["**/*.ts"],
            definitions: []
        },
        targets: {
            node: {
                base: "src/node",
                typescript: ["**/*.ts"],
                main: "main",
                definitions: ["../../typings/main.d.ts", "../../typings/main/**/*.d.ts"]
            },
            browser: {
                base: "src/browser",
                typescript: ["**/*.ts"],
                main: "main",
                definitions: ["../../typings/browser.d.ts", "../../typings/browser/**/*.d.ts"]
            }
        }
    };
}
exports.getDefaultConfig = getDefaultConfig;
var Locations = (function () {
    function Locations(config) {
        this.config = _.merge({}, getDefaultConfig(), config);
    }
    Locations.prototype.getTypescriptSources = function (targetName, excludeSpec) {
        var _this = this;
        if (excludeSpec === void 0) { excludeSpec = false; }
        var core = this.config.core;
        var target = this.config.targets[targetName];
        var sources = [].concat(core.definitions
            .map(function (definitionPath) { return path.join(core.base, definitionPath); }), target.definitions
            .map(function (sourcePath) { return path.join(target.base, sourcePath); }), core.typescript
            .map(function (definitionPath) { return path.join(core.base, definitionPath); }), target.typescript
            .map(function (sourcePath) { return path.join(target.base, sourcePath); })).map(function (item) { return path.join(_this.config.project.root, item); });
        if (excludeSpec) {
            sources.push("!**/*.spec.ts");
        }
        return sources;
    };
    Locations.prototype.getBuildDirectory = function (targetName) {
        return path.join(this.config.project.root, this.config.project.build, targetName);
    };
    Locations.prototype.getDistDirectory = function (targetName) {
        return path.join(this.config.project.root, this.config.project.dist, targetName);
    };
    Locations.prototype.getCoverageDirectory = function (targetName) {
        return path.join(this.config.project.root, this.config.project.coverage, targetName);
    };
    return Locations;
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = Locations;