import * as path from "path";

import * as buildBrowser from "./build.browser"
import Locations from "../config/locations";

export const taskName = "build:electron:browser";

export function registerTask (gulp: any, locations: Locations, options?: any) {
  buildBrowser.registerTask(gulp, locations, options|| {});

  gulp.task(taskName, [buildBrowser.taskName], function(){
    let browserInput = locations.getBuildDirectory("browser");
    let browserOutput = path.resolve(locations.getBuildDirectory("electron"), "browser");
    return gulp.src([path.resolve(browserInput, "**/*")], {base: browserInput})
      .pipe(gulp.dest(browserOutput));
  });
}

export default registerTask;
