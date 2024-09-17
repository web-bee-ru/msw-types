# Библиотека для типизации моков msw при помощи схем taxios и openapi-typescript

## Для msw@1 использовать версию 0.1.0

msw - [Github](https://github.com/mswjs/msw), [NPM](https://www.npmjs.com/package/msw)

taxios - [Github](https://github.com/simplesmiler/taxios), [NPM](https://www.npmjs.com/package/@simplesmiler/taxios-generate), [Пример схем](https://github.com/simplesmiler/taxios/tree/master/packages/taxios-sandbox/src)

openapi-typescript - [Github](https://github.com/drwpow/openapi-typescript), [NPM](https://www.npmjs.com/package/openapi-typescript), [Пример схем](https://github.com/drwpow/openapi-typescript/tree/main/packages/openapi-typescript/examples)

## Примеры

### taxios

```typescript

import { HttpResponse, http } from "msw";
import { TypedHttp } from "@web-bee-ru/msw-types";
import { TaxiosTestApi } from "./data";

const typedHttp = new TypedHttp<TaxiosTestApi>(http, '/api');
typedHttp.get("/test1/{id}", async ({ request, params }) => {
  return HttpResponse.text("test");
});

```

### openapi-typescript

**DEPRECATED**: Используйте [openapi-msw](https://www.npmjs.com/package/openapi-msw)

```typescript

import { HttpResponse, http } from "msw";
import { TypedOpenApiHttp } from "@web-bee-ru/msw-types";
import { TestOpenApi } from "./data";

const typedHttpOpenapi = new TypedOpenApiHttp<TestOpenApi>(http, '/api');
typedHttpOpenapi.get("/breeds/{id}", ({ request, params }) => {
  return HttpResponse.text("test");
});
```

### taxios для msw@1 (версия @web-bee-ru/msw-types 0.1.0)

```typescript

import { rest } from 'msw';
import { TypedRest } from "@web-bee-ru/msw-types"
import { IncidentsAPI } from './IncidentsAPI';

const incidentsRest = new TypedRest<IncidentsAPI>(rest, '/api');

incidentsRest.get('/v1/ui/{slxIds}', async (req, res, ctx) => {
    const params = req.params;
    return res(ctx.json({
    params
  }));
})
```
