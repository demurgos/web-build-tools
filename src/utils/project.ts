import * as fs from "fs";

import * as Promise from "bluebird";
import * as semver from "semver";

import * as git from "./git";
import Locations from "../config/locations";

let readFile: (filename: string)=>Promise<Buffer> = Promise.promisify(fs.readFile);
let writeFile: (filename: string, data: any)=>Promise<any> = Promise.promisify(fs.writeFile);

export function ensureUnusedTag(tag: string){
  return git.checkTag(tag)
    .then((exists: boolean) => {
      if (exists) {
        throw new Error("Tag "+tag+" already exists");
      }
    });
}

export function getVersionTag(version: string): string{
  return "v"+version;
}

export function getVersionMessage(version: string): string{
  return "Release v"+version;
}

export function commitVersion(version: string, projectRoot?: string){
  let tag = getVersionTag(version);
  let message = getVersionMessage(version);
  return git.exec("add", ["."])
    .then(() => {
      return git.exec("commit", ["-m", message]);
    })
    .then(() => {
      return git.exec("tag", ["-a", tag, "-m", message]);
    });
}

export function release(version: string, locations: Locations){
  return Promise.all([
      ensureUnusedTag(getVersionTag(version)),
      git.ensureCleanMaster()
    ])
    .then(() => {
      return setPackageVersion(version, locations);
    })
    .then(() => {
      return commitVersion(version, locations.config.project.root);
    });
}

export interface IPackageJson{
  version: string;
}

export function readPackage(locations: Locations): Promise<IPackageJson> {
  return readFile(locations.config.project.package)
    .then((content: Buffer) => {
      return JSON.parse(content.toString("utf8"));
    });
}

export function writePackage(pkg: IPackageJson, locations: Locations){
  return writeFile(locations.config.project.package, JSON.stringify(pkg, null, 2));
}

export function setPackageVersion(version: string, locations: Locations): Promise<any> {
  return readPackage(locations)
    .then((pkg: IPackageJson) => {
      pkg.version = version;
      return writePackage(pkg, locations);
    });
}

// type: major/minor/patch
export function getNextVersion(type: string, locations: Locations): Promise<string> {
  return readPackage(locations)
    .then((pkg: IPackageJson) => {
      return semver.inc(pkg.version, type);
    });
}