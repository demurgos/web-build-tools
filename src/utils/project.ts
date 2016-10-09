import * as fs from "fs";

import * as Bluebird from "bluebird";
import * as semver from "semver";

import * as git from "./git";
import Locations from "../config/locations";

const readFile: (filename: string, encoding: string) => Bluebird<string> = <any> Bluebird.promisify(fs.readFile);
const writeFile: (filename: string, data: any) => Bluebird<any> = Bluebird.promisify(fs.writeFile);

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
  return Bluebird.all([
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

export function readPackage(locations: Locations): Bluebird<IPackageJson> {
  return readFile(locations.config.project.package, "utf8")
    .then((content: string) => {
      return JSON.parse(content);
    });
}

export function writePackage(pkg: IPackageJson, locations: Locations){
  return writeFile(locations.config.project.package, JSON.stringify(pkg, null, 2));
}

export function setPackageVersion(version: string, locations: Locations): Bluebird<any> {
  return readPackage(locations)
    .then((pkg: IPackageJson) => {
      pkg.version = version;
      return writePackage(pkg, locations);
    });
}

export function getNextVersion(bumpKind: "major" | "minor" | "patch", locations: Locations): Bluebird<string> {
  return readPackage(locations)
    .then((pkg: IPackageJson) => {
      return semver.inc(pkg.version, bumpKind);
    });
}

export function bumpVersion (bumpKind: "major" | "minor" | "patch", locations: Locations): Bluebird<any> {
  return getNextVersion(bumpKind, locations)
    .then((nextVersion: string) => {
      return release(nextVersion, locations);
    });
}
