import { DefaultBodyType, PathParams, ResponseResolver, StrictRequest, http } from "msw";
import {
  SchemeType,
  RoutesType,
  HandlerType,
  CurrentFieldType,
  MethodType,
  RequestType,
  BodyContentType,
  ParamsType,
} from "./types";
import qs from "qs";
import { HttpRequestResolverExtras } from "msw/lib/core/handlers/HttpHandler";

export class TypedHttpOpenApi<Scheme extends SchemeType> {
  private http: typeof http;
  private readonly baseURL?: string;

  /**
   * @param _http Объект, который содержит набор обработчиков запросов, предназначенных для удобного имитации запросов REST API.
   * @param baseURL базовый URL, будет добавлен ко всем путям
   */
  constructor(_http: typeof http, baseURL?: string) {
    this.http = _http;
    this.baseURL = baseURL;
  }

  public get<
    Route extends RoutesType<Scheme, "get">,
    Field extends CurrentFieldType<Scheme, "get", Route, "parameters">,
  >(path: Route, handler: HandlerType<Scheme, "get", never, Route, Field>) {
    return this.http.get(this.preparePath(path as string), this.prepareHandler(handler));
  }

  public post<
    Route extends RoutesType<Scheme, "post">,
    Content extends BodyContentType,
    Field extends CurrentFieldType<Scheme, "post", Route, "parameters">,
  >(path: Route, handler: HandlerType<Scheme, "post", Content, Route, Field>) {
    return this.http.post(this.preparePath(path as string), this.prepareHandler(handler));
  }

  public put<
    Route extends RoutesType<Scheme, "put">,
    Content extends BodyContentType,
    Field extends CurrentFieldType<Scheme, "put", Route, "parameters">,
  >(path: Route, handler: HandlerType<Scheme, "put", Content, Route, Field>) {
    return this.http.put(this.preparePath(path as string), this.prepareHandler(handler));
  }

  public delete<
    Route extends RoutesType<Scheme, "delete">,
    Field extends CurrentFieldType<Scheme, "delete", Route, "parameters">,
  >(path: Route, handler: HandlerType<Scheme, "delete", never, Route, Field>) {
    return this.http.delete(this.preparePath(path as string), this.prepareHandler(handler));
  }

  public head<
    Route extends RoutesType<Scheme, "head">,
    Field extends CurrentFieldType<Scheme, "head", Route, "parameters">,
  >(path: Route, handler: HandlerType<Scheme, "head", never, Route, Field>) {
    return this.http.head(this.preparePath(path as string), this.prepareHandler(handler));
  }

  public patch<
    Route extends RoutesType<Scheme, "patch">,
    Content extends BodyContentType,
    Field extends CurrentFieldType<Scheme, "patch", Route, "parameters">,
  >(path: Route, handler: HandlerType<Scheme, "patch", Content, Route, Field>) {
    return this.http.patch(this.preparePath(path as string), this.prepareHandler(handler));
  }

  public options<
    Route extends RoutesType<Scheme, "options">,
    Content extends BodyContentType,
    Field extends CurrentFieldType<Scheme, "options", Route, "parameters">,
  >(path: Route, handler: HandlerType<Scheme, "options", Content, Route, Field>) {
    return this.http.options(this.preparePath(path as string), this.prepareHandler(handler));
  }

  public all<Key extends keyof Scheme>(
    path: Key,
    handler: ResponseResolver<HttpRequestResolverExtras<PathParams>, DefaultBodyType, undefined>,
  ) {
    return this.http.all(this.preparePath(path as string), handler);
  }

  /**
   *  @description Обертка над обработчиком, чтобы прокинуть query в объект HttpRequest
   */
  private prepareHandler<
    Method extends MethodType,
    Content extends BodyContentType,
    Route extends RoutesType<Scheme, Method>,
    Field extends CurrentFieldType<Scheme, Method, Route, "parameters">,
  >(handler: HandlerType<Scheme, Method, Content, Route, Field>) {
    return ({
      request,
      params,
    }: {
      request: StrictRequest<DefaultBodyType>;
      params: PathParams;
    }) => {
      const reqWithQuery = request as RequestType<Scheme, Method, Content, Route, Field>;
      const newParams = params as ParamsType<Scheme, Method, Route, Field>;
      const url = new URL(request.url);
      const query = qs.parse(url.search, { ignoreQueryPrefix: true });
      reqWithQuery.query = query as typeof reqWithQuery.query;

      return handler({ request: reqWithQuery, params: newParams });
    };
  }

  private preparePath(path: string) {
    return this.convertPath(this.baseURL ? `${this.baseURL}${path}` : path);
  }

  /**
   * @description Метод, который конвертирует параметры пути к формату :ids, так как изначально приходит путь формата {ids}
   * @param {string} swaggerPath - Исходный сваггер путь
   * @example
   * convertPath(/contractors/byIds/{ids});
   * return /contractors/byIds/:ids
   */
  private convertPath(swaggerPath: string) {
    const mswPath = swaggerPath.replace(/}/gi, "").replace(/{/gi, ":");
    return mswPath;
  }
}
