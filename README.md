Type your `msw` handlers with `taxios` scheme.

# Install

```sh
$ npm i @web-bee-ru/msw-types
```

# Usage

```ts
import { HttpResponse, http } from "msw";
import { TypedHttp } from "@web-bee-ru/msw-types";
import { TestApi } from "./TestApi";

const typedHttp = new TypedHttp<TestApi>(http, '/api/test-service); // baseUrl is optional

// GET /api/test-service/test1
typedHttp.get("/test1", async ({ request, params }) => {
  return HttpResponse.text("test");
});
```
