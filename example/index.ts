import { HttpResponse, http } from "msw";
import { TypedHttp, TypedOpenApiHttp } from "src";
import { TAxiosTestApi, TestOpenApi } from "./data";

const typedHttp = new TypedHttp<TAxiosTestApi>(http);
typedHttp.get("/test1", async ({ request, params }) => {
  return HttpResponse.text("test");
});

const typedHttpOpenapi = new TypedOpenApiHttp<TestOpenApi>(http);
typedHttpOpenapi.get("/breeds", ({ request, params }) => {
  return HttpResponse.text("test");
});
