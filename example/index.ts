import { HttpResponse, http } from "msw";
import { TypedHttp, TypedHttpOpenApi } from "src";
import { TAxiosTestApi, TestOpenApi } from "./data";

const typedHttp = new TypedHttp<TAxiosTestApi>(http);
typedHttp.get("/test1", async ({ request, params }) => {
  return HttpResponse.text("test");
});

const typedHttpOpenapi = new TypedHttpOpenApi<TestOpenApi>(http);
typedHttpOpenapi.get("/breeds", ({ request, params }) => {
  return HttpResponse.text("test");
});
