import { DefaultBodyType, PathParams, ResponseResolver, StrictRequest, http } from "msw";
import qs from "qs";
import {
  CurrentFieldType,
  HandlerType,
  MethodType,
  ParamsType,
  RequestType,
  RoutesType,
  SchemeType,
} from "./types";
import { HttpRequestResolverExtras } from "msw/lib/core/handlers/HttpHandler";

export class TypedHttp<Scheme extends SchemeType> {
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

  public get<Route extends RoutesType<Scheme, "GET">>(
    path: Route,
    handler: HandlerType<Scheme, "GET", Route>,
  ) {
    return this.http.get<never, CurrentFieldType<Scheme, "GET", Route, "response">>(
      this.preparePath(path as string),
      this.prepareHandler(handler),
    );
  }

  public post<Route extends RoutesType<Scheme, "POST">>(
    path: Route,
    handler: HandlerType<Scheme, "POST", Route>,
  ) {
    return this.http.post<
      CurrentFieldType<Scheme, "POST", Route, "body">,
      CurrentFieldType<Scheme, "POST", Route, "response">
    >(this.preparePath(path as string), this.prepareHandler(handler));
  }

  public put<Route extends RoutesType<Scheme, "PUT">>(
    path: Route,
    handler: HandlerType<Scheme, "PUT", Route>,
  ) {
    return this.http.put<
      CurrentFieldType<Scheme, "PUT", Route, "body">,
      CurrentFieldType<Scheme, "PUT", Route, "response">
    >(this.preparePath(path as string), this.prepareHandler(handler));
  }

  public delete<Route extends RoutesType<Scheme, "DELETE">>(
    path: Route,
    handler: HandlerType<Scheme, "DELETE", Route>,
  ) {
    return this.http.delete<
      CurrentFieldType<Scheme, "DELETE", Route, "body">,
      CurrentFieldType<Scheme, "DELETE", Route, "response">
    >(this.preparePath(path as string), this.prepareHandler(handler));
  }

  public head<Route extends RoutesType<Scheme, "HEAD">>(
    path: Route,
    handler: HandlerType<Scheme, "HEAD", Route>,
  ) {
    return this.http.head<never, CurrentFieldType<Scheme, "HEAD", Route, "response">>(
      this.preparePath(path as string),
      this.prepareHandler(handler),
    );
  }

  public patch<Route extends RoutesType<Scheme, "PATCH">>(
    path: Route,
    handler: HandlerType<Scheme, "PATCH", Route>,
  ) {
    return this.http.patch<
      CurrentFieldType<Scheme, "PATCH", Route, "body">,
      CurrentFieldType<Scheme, "PATCH", Route, "response">
    >(this.preparePath(path as string), this.prepareHandler(handler));
  }

  public options<Route extends RoutesType<Scheme, "OPTIONS">>(
    path: Route,
    handler: HandlerType<Scheme, "OPTIONS", Route>,
  ) {
    return this.http.options<
      CurrentFieldType<Scheme, "OPTIONS", Route, "body">,
      CurrentFieldType<Scheme, "OPTIONS", Route, "response">
    >(this.preparePath(path as string), this.prepareHandler(handler));
  }

  public all<Route extends keyof Scheme["routes"]>(
    path: Route,
    handler: ResponseResolver<HttpRequestResolverExtras<PathParams>, DefaultBodyType, undefined>,
  ) {
    return this.http.all(this.preparePath(path as string), handler);
  }

  /**
   * Обертка над обработчиком, чтобы прокинуть query в объект HttpRequest
   */
  private prepareHandler<Method extends MethodType, Route extends RoutesType<Scheme, Method>>(
    handler: HandlerType<Scheme, Method, Route>,
  ) {
    return ({
      request,
      params,
    }: {
      request: StrictRequest<DefaultBodyType>;
      params: PathParams;
    }) => {
      const reqWithQuery = request as RequestType<Scheme, Method, Route>;
      const newParams = params as ParamsType<Scheme, Method, Route>;
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
   * Метод, который конвертирует параметры пути к формату :ids, так как изначально приходит путь формата {ids}
   *  @param swaggerPath Исходный сваггер путь
   *  @example
   *  convertPath(/contractors/byIds/{ids});
   *  return /contractors/byIds/:ids
   */
  private convertPath(swaggerPath: string) {
    const mswPath = swaggerPath.replace(/}/gi, "").replace(/{/gi, ":");
    return mswPath;
  }
}
