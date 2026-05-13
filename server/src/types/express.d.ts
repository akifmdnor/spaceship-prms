import type { Passenger } from "../domain/Passenger.js";
import type { Resource } from "../domain/Resource.js";

declare module "express-serve-static-core" {
  interface Locals {
    shipUser?: Passenger;
    shipResource?: Resource;
  }
}

export {};
