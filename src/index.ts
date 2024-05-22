export * from "./TypedHttp";

export function parseArrayParam(param: string | string[]) {
  return typeof param === 'string' ? param.split(',') : param;
}
