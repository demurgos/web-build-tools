import {FSWatcher} from "fs";
import {Gulp} from "gulp";
import * as gulpSourceMaps from "gulp-sourcemaps";
import * as gulpTypescript from "gulp-typescript";
import * as merge from "merge2";
import {CompilerOptionsJson} from "../options/tsc";
import {TaskFunction} from "../utils/gulp-task-function";
import {deleteUndefinedProperties} from "../utils/utils";
import {ResolvedTsLocations, resolveTsLocations, TypescriptConfig} from "./_typescript";

export function getBuildTypescriptTask(gulp: Gulp, options: TypescriptConfig): TaskFunction {
  const resolved: ResolvedTsLocations = resolveTsLocations(options);
  const tscOptions: CompilerOptionsJson = {
    ...options.tscOptions,
    rootDir: resolved.rootDir,
    outDir: resolved.outDir,
    typeRoots: resolved.typeRoots,
  };
  deleteUndefinedProperties(tscOptions);

  const task: TaskFunction = function () {
    // tslint:disable-next-line:typedef
    const tsResult = gulp
      .src(resolved.absScripts, {base: options.srcDir})
      .pipe(gulpSourceMaps.init())
      .pipe(gulpTypescript(tscOptions));

    return merge([
      tsResult.dts
        .pipe(gulp.dest(options.buildDir)),
      tsResult.js
        .pipe(gulpSourceMaps.write())
        .pipe(gulp.dest(options.buildDir)),
    ]);
  };
  task.displayName = `_build:scripts`;
  return task;
}

export function getBuildTypescriptWatcher(gulp: Gulp, options: TypescriptConfig): FSWatcher {
  const buildTask: TaskFunction = getBuildTypescriptTask(gulp, options);
  const resolved: ResolvedTsLocations = resolveTsLocations(options);
  return gulp.watch(resolved.absScripts, {cwd: options.srcDir}, buildTask) as FSWatcher;
}
