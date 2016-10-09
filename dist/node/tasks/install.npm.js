"use strict";
var install = require("gulp-install");
exports.taskName = "install:npm";
function registerTask(gulp, locations, userOptions) {
    gulp.task(exports.taskName, function () {
        return gulp.src([locations.config.project.package])
            .pipe(install());
    });
}
exports.registerTask = registerTask;
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = registerTask;
