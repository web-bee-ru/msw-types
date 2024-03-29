import { HttpResponse, http } from "msw";
import { TypedHttp } from "src";
import { TestApi } from "./data";

const typedHttp = new TypedHttp<TestApi>(http);

typedHttp.get("/test1", async ({ request, params }) => {
  return HttpResponse.text("test");
});
