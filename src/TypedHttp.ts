import { DefaultBodyType, PathParams, ResponseResolver, StrictRequest, http } from "msw";
import qs from "qs";
import { FieldType, HandlerType, Method, Params, ReqType, Routes, Scheme } from "./types";
import { HttpRequestResolverExtras } from "msw/lib/core/handlers/HttpHandler";

export class TypedHttp<T extends Scheme> {
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

  public get<K extends Routes<T, "GET">>(path: K, handler: HandlerType<T, "GET", K>) {
    return this.http.get<never, FieldType<T, "GET", K, "response">>(
      this.preparePath(path as string),
      this.prepareHandler(handler),
    );
  }

  public post<K extends Routes<T, "POST">>(path: K, handler: HandlerType<T, "POST", K>) {
    return this.http.post<FieldType<T, "POST", K, "body">, FieldType<T, "POST", K, "response">>(
      this.preparePath(path as string),
      this.prepareHandler(handler),
    );
  }

  public put<K extends Routes<T, "PUT">>(path: K, handler: HandlerType<T, "PUT", K>) {
    return this.http.put<FieldType<T, "PUT", K, "body">, FieldType<T, "PUT", K, "response">>(
      this.preparePath(path as string),
      this.prepareHandler(handler),
    );
  }

  public delete<K extends Routes<T, "DELETE">>(path: K, handler: HandlerType<T, "DELETE", K>) {
    return this.http.delete<
      FieldType<T, "DELETE", K, "body">,
      FieldType<T, "DELETE", K, "response">
    >(this.preparePath(path as string), this.prepareHandler(handler));
  }

  public head<K extends Routes<T, "HEAD">>(path: K, handler: HandlerType<T, "HEAD", K>) {
    return this.http.head<never, FieldType<T, "HEAD", K, "response">>(
      this.preparePath(path as string),
      this.prepareHandler(handler),
    );
  }

  public patch<K extends Routes<T, "PATCH">>(path: K, handler: HandlerType<T, "PATCH", K>) {
    return this.http.patch<FieldType<T, "PATCH", K, "body">, FieldType<T, "PATCH", K, "response">>(
      this.preparePath(path as string),
      this.prepareHandler(handler),
    );
  }

  public options<K extends Routes<T, "OPTIONS">>(path: K, handler: HandlerType<T, "OPTIONS", K>) {
    return this.http.options<
      FieldType<T, "OPTIONS", K, "body">,
      FieldType<T, "OPTIONS", K, "response">
    >(this.preparePath(path as string), this.prepareHandler(handler));
  }

  public all<K extends keyof T["routes"]>(
    path: K,
    handler: ResponseResolver<HttpRequestResolverExtras<PathParams>, DefaultBodyType, undefined>,
  ) {
    return this.http.all(this.preparePath(path as string), handler);
  }

  /**
   * Обертка над обработчиком, чтобы прокинуть query в объект HttpRequest
   */
  private prepareHandler<M extends Method, K extends Routes<T, M>>(handler: HandlerType<T, M, K>) {
    return ({
      request,
      params,
    }: {
      request: StrictRequest<DefaultBodyType>;
      params: PathParams;
    }) => {
      const reqWithQuery = request as ReqType<T, M, K>;
      const newParams = params as Params<T, M, K>;
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
