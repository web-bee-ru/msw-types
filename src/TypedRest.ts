// @NOTE: ONLY msw@1 (!)
// msw@2 is not supported
import {
  MockedResponse,
  PathParams,
  ResponseComposition,
  ResponseResolver,
  rest,
  RestContext,
  RestRequest,
  DefaultBodyType,
} from "msw";
import qs from "qs";
import { ConditionalPick } from "type-fest";

/**
 * Метод, который конвертирует параметры пути к формату :ids, так как изначально приходит путь формата {ids}
 *  @param swaggerPath Исходный сваггер путь
 *  @example
 *  convertPath(/contractors/byIds/{ids});
 *  return /contractors/byIds/:ids
 */
const convertPath = (swaggerPath: string) => {
  const mswPath = swaggerPath.replace(/}/gi, "").replace(/{/gi, ":");
  return mswPath;
};

type Method = "GET" | "HEAD" | "POST" | "PUT" | "DELETE" | "OPTIONS" | "PATCH";
type Field = "query" | "params" | "body" | "response";
type Scheme = {
  version: "1";
  routes: {
    [route in string]: {
      [method in Method]?: {
        [field in Field]?: unknown;
      };
    };
  };
};

type Routes<T extends Scheme, M extends Method> = keyof ConditionalPick<
  T["routes"],
  Partial<Record<M, unknown>>
>;

type FieldType<
  T extends Scheme,
  M extends Method,
  Route extends Routes<T, M>,
  F extends Field,
> = Required<T["routes"][Route]>[M] extends Partial<Record<F, any>>
  ? Required<Required<T["routes"][Route]>[M]>[F]
  : never;

/**
 * msw хранит параметры как строки или массив строк, поэтому нужно привести все значения params из Taxios к строке или массиву строк
 */
type Params<T extends Scheme, M extends Method, Route extends Routes<T, M>> = {
  [K in keyof FieldType<T, M, Route, "params">]: FieldType<
    T,
    M,
    Route,
    "params"
  >[K] extends unknown[]
    ? string[]
    : string;
};
/**
 * Расширяем тип RestRequest, добавляя поле query, который берем  из taxios`а, а типы приводим к строке (т.к. это query запроса).
 */
interface RestRequestWithQuery<
  BodyType extends DefaultBodyType = DefaultBodyType,
  ParamsType extends PathParams = PathParams,
  T extends Scheme = Scheme,
  M extends Method = Method,
  Route extends Routes<T, M> = Routes<T, M>,
  Q = Required<FieldType<T, M, Route, "query">>,
> extends RestRequest<BodyType, ParamsType> {
  query: {
    [K in keyof Q]:
      | (FieldType<T, M, Route, "query">[K] extends undefined ? undefined : never)
      | (Q[K] extends unknown[] ? string[] : string);
  };
}

type ReqType<T extends Scheme, M extends Method, K extends Routes<T, M>> = Record<
  M,
  unknown
> extends { GET: unknown } | { HEAD: unknown }
  ? RestRequestWithQuery<never, Params<T, M, K>, T, M, K>
  : RestRequestWithQuery<FieldType<T, M, K, "body">, Params<T, M, K>, T, M, K>;

type HandlerType<T extends Scheme, M extends Method, K extends Routes<T, M>> = (
  req: ReqType<T, M, K>,
  res: ResponseComposition<FieldType<T, M, K, "response">>,
  ctx: RestContext,
) =>
  | MockedResponse<FieldType<T, M, K, "response">>
  | Promise<MockedResponse<FieldType<T, M, K, "response">>>;

/**
 * Класс, который типизирует методы msw REST с помощью taxios схемы
 * @see https://github.com/simplesmiler/taxios
 * @see https://mswjs.io/
 */
export class TypedRest<T extends Scheme> {
  private rest: typeof rest;
  private readonly baseURL?: string;
  /**
   * @param _rest Объект, который содержит набор обработчиков запросов, предназначенных для удобного имитации запросов REST API.
   * @param baseURL базовый URL, будет добавлен ко всем путям
   */
  constructor(_rest: typeof rest, baseURL?: string) {
    this.rest = _rest;
    this.baseURL = baseURL;
  }

  /**
   * Обертка над обработчиком, чтобы прокинуть query в объект RestRequest
   */
  private prepareHandler<M extends Method, K extends Routes<T, M>>(handler: HandlerType<T, M, K>) {
    return (
      req: Record<M, unknown> extends { GET: unknown } | { HEAD: unknown }
        ? RestRequest<never, Params<T, M, K>>
        : RestRequest<FieldType<T, M, K, "body">, Params<T, M, K>>,
      res: ResponseComposition<FieldType<T, M, K, "response">>,
      ctx: RestContext,
    ) => {
      const reqWithQuery = req as ReqType<T, M, K>;
      const query = qs.parse(req.url.search, { ignoreQueryPrefix: true });
      reqWithQuery.query = query as typeof reqWithQuery.query;
      return handler(reqWithQuery, res, ctx);
    };
  }

  private preparePath(path: string) {
    return convertPath(this.baseURL ? `${this.baseURL}${path}` : path);
  }

  public get<K extends Routes<T, "GET">>(path: K, handler: HandlerType<T, "GET", K>) {
    return this.rest.get<never, Params<T, "GET", K>, FieldType<T, "GET", K, "response">>(
      this.preparePath(path as string),
      this.prepareHandler(handler),
    );
  }

  public post<K extends Routes<T, "POST">>(path: K, handler: HandlerType<T, "POST", K>) {
    return this.rest.post<
      FieldType<T, "POST", K, "body">,
      Params<T, "POST", K>,
      FieldType<T, "POST", K, "response">
    >(this.preparePath(path as string), this.prepareHandler(handler));
  }

  public put<K extends Routes<T, "PUT">>(path: K, handler: HandlerType<T, "PUT", K>) {
    return this.rest.put<
      FieldType<T, "PUT", K, "body">,
      Params<T, "PUT", K>,
      FieldType<T, "PUT", K, "response">
    >(this.preparePath(path as string), this.prepareHandler(handler));
  }

  public delete<K extends Routes<T, "DELETE">>(path: K, handler: HandlerType<T, "DELETE", K>) {
    return this.rest.delete<
      FieldType<T, "DELETE", K, "body">,
      Params<T, "DELETE", K>,
      FieldType<T, "DELETE", K, "response">
    >(this.preparePath(path as string), this.prepareHandler(handler));
  }

  public head<K extends Routes<T, "HEAD">>(path: K, handler: HandlerType<T, "HEAD", K>) {
    return this.rest.head<never, Params<T, "HEAD", K>, FieldType<T, "HEAD", K, "response">>(
      this.preparePath(path as string),
      this.prepareHandler(handler),
    );
  }

  public patch<K extends Routes<T, "PATCH">>(path: K, handler: HandlerType<T, "PATCH", K>) {
    return this.rest.patch<
      FieldType<T, "PATCH", K, "body">,
      Params<T, "PATCH", K>,
      FieldType<T, "PATCH", K, "response">
    >(this.preparePath(path as string), this.prepareHandler(handler));
  }

  public options<K extends Routes<T, "OPTIONS">>(path: K, handler: HandlerType<T, "OPTIONS", K>) {
    return this.rest.options<
      FieldType<T, "OPTIONS", K, "body">,
      Params<T, "OPTIONS", K>,
      FieldType<T, "OPTIONS", K, "response">
    >(this.preparePath(path as string), this.prepareHandler(handler));
  }

  public all<K extends keyof T["routes"]>(
    path: K,
    handler: ResponseResolver<
      RestRequest<DefaultBodyType, PathParams>,
      RestContext,
      DefaultBodyType
    >,
  ) {
    return this.rest.all(this.preparePath(path as string), handler);
  }
}
