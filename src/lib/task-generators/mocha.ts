import {Gulp} from "gulp";
import gulpMocha = require("gulp-mocha");
import {Minimatch} from "minimatch";
import {TaskFunction} from "../utils/gulp-task-function";
import * as matcher from "../utils/matcher";

export interface Options {
  testDir: string;
}

export interface Sources {
  baseDir: string;
  specs: string[];
}

export function getSources(options: Options): Sources {
  const baseDir: string = options.testDir;
  const specs: string = matcher.asString(matcher.join(baseDir, new Minimatch("**/*.spec.js")));

  return {
    baseDir: baseDir,
    specs: [specs],
  };
}

export function generateTask(gulp: Gulp, options: Options): TaskFunction {
  const sources: Sources = getSources(options);

  const task: TaskFunction = function () {
    return gulp
      .src(sources.specs, {base: sources.baseDir})
      .pipe(gulpMocha({
        reporter: "spec",
      }));
  };
  task.displayName = getTaskName();

  return task;
}

export function getTaskName(): string {
  return "_mocha:run";
}

export default generateTask;