import { DefaultBodyType, HttpResponse, PathParams, StrictRequest } from "msw";
import { ConditionalPick } from "type-fest";

export type MethodType = "get" | "put" | "post" | "delete" | "options" | "head" | "patch";
export type FieldType = "parameters" | "requestBody" | "responses";
export type BodyContentType = "multipart/form-data" | "application/json";

/**
 * @description Тип openapi схемы с полями, необходимыми для request и parameters в msw
 */
export type SchemeType = {
  [route in keyof object]: {
    [method in MethodType]?: {
      parameters: {
        query?: {
          [key: string]: unknown;
        };
        header?: never;
        path?: {
          [key: string]: unknown;
        };
        cookie?: never;
      };
      requestBody?: {
        content: {
          [content in BodyContentType]: unknown;
        };
      };
      responses: {
        [code: number]: {
          headers: {
            [name: string]: unknown;
          };
          content: {
            [content in BodyContentType]: unknown;
          };
        };
        default: {
          headers: {
            [name: string]: unknown;
          };
          content: {
            [content in BodyContentType]: unknown;
          };
        };
      };
    };
  };
};

/**
 * @description Выборка всех маршрутов в интерфейсе схемы openapi
 */
export type RoutesType<
  Scheme extends SchemeType,
  Method extends MethodType,
> = keyof ConditionalPick<Scheme, Partial<Record<Method, unknown>>>;

/**
 * @description Если method является ключем Scheme[Route], то тогда проверяет наличие поля. Если есть, то выбирает его. Any используется, так как в поле может быть любым из parameters, requestBody, responses
 */
export type CurrentFieldType<
  Scheme extends SchemeType,
  Method extends MethodType,
  Route extends RoutesType<Scheme, Method>,
  Field extends FieldType,
> = Method extends keyof Scheme[Route]
  ? Required<Scheme[Route]>[Method] extends Partial<Record<Field, any>>
    ? Required<Required<Scheme[Route]>[Method]>[Field]
    : never
  : never;

/**
 * @description Если method является ключем Scheme[Route], то проверяет наличие query. Если query есть и является ключем, то берет его
 */
export type QueryParamsFieldType<
  Scheme extends SchemeType,
  Method extends MethodType,
  Route extends RoutesType<Scheme, Method>,
  Field extends CurrentFieldType<Scheme, Method, Route, "parameters">,
> = Method extends keyof Scheme[Route]
  ? Required<Scheme[Route][Method]>[Field] extends Partial<Record<"query", object>>
    ? "query" extends keyof Scheme[Route][Method][Field]
      ? Required<Required<Scheme[Route]>[Method]>[Field]["query"]
      : never
    : never
  : never;

/**
 * @description Если method является ключем Scheme[Route], то проверяет наличие path. Если query path и является ключем, то берет его
 */
export type ParamsFieldType<
  Scheme extends SchemeType,
  Method extends MethodType,
  Route extends RoutesType<Scheme, Method>,
  Field extends CurrentFieldType<Scheme, Method, Route, "parameters">,
> = Method extends keyof Scheme[Route]
  ? Required<Scheme[Route][Method]>[Field] extends Partial<Record<"path", object>>
    ? "path" extends keyof Scheme[Route][Method][Field]
      ? Required<Required<Scheme[Route]>[Method]>[Field]["path"]
      : never
    : never
  : never;

/**
 * @description msw хранит параметры как строки или массив строк, поэтому нужно привести все значения params из openapi к строке или массиву строк
 */
export type ParamsType<
  Scheme extends SchemeType,
  Method extends MethodType,
  Route extends RoutesType<Scheme, Method>,
  Field extends CurrentFieldType<Scheme, Method, Route, "parameters">,
> = {
  [Key in keyof ParamsFieldType<Scheme, Method, Route, Field>]: ParamsFieldType<
    Scheme,
    Method,
    Route,
    Field
  >[Key] extends unknown[]
    ? string[]
    : string;
};

/**
 * @description Выбирает все query параметры
 */
export type QueryParamsType<
  Scheme extends SchemeType,
  Method extends MethodType,
  Route extends RoutesType<Scheme, Method>,
  Field extends CurrentFieldType<Scheme, Method, Route, "parameters">,
> = {
  [Key in keyof QueryParamsFieldType<Scheme, Method, Route, Field>]: QueryParamsFieldType<
    Scheme,
    Method,
    Route,
    Field
  >[Key];
};

/**
 * @description Расширяет HttpRequest, добавляя поле query, который берем из openapi, а типы приводим к строке (т.к. это query запрос).
 */
export interface HttpRequestWithQuery<
  BodyType extends DefaultBodyType = DefaultBodyType,
  Scheme extends SchemeType = SchemeType,
  Method extends MethodType = MethodType,
  Route extends RoutesType<Scheme, Method> = RoutesType<Scheme, Method>,
  Field extends CurrentFieldType<Scheme, Method, Route, "parameters"> = CurrentFieldType<
    Scheme,
    Method,
    Route,
    "parameters"
  >,
  Query = Required<QueryParamsType<Scheme, Method, Route, Field>>,
> extends StrictRequest<BodyType> {
  query: {
    [Key in keyof Query]: Query[Key] extends unknown[] ? string[] : string;
  };
}

/**
 * @description Если get или head запрос, то не используем тело запроса
 */
export type RequestType<
  Scheme extends SchemeType,
  Method extends MethodType,
  Content extends BodyContentType,
  Route extends RoutesType<Scheme, Method>,
  Field extends CurrentFieldType<Scheme, Method, Route, "parameters">,
> = Record<Method, unknown> extends { get: unknown } | { head: unknown }
  ? HttpRequestWithQuery<never, Scheme, Method, Route, Field>
  : HttpRequestWithQuery<
      CurrentFieldType<Scheme, Method, Route, "requestBody">["content"][Content],
      Scheme,
      Method,
      Route,
      Field
    >;

/**
 * @description Тип обработчика с обновленным request
 */
export type HandlerType<
  Scheme extends SchemeType,
  Method extends MethodType,
  Content extends BodyContentType,
  Route extends RoutesType<Scheme, Method>,
  Field extends CurrentFieldType<Scheme, Method, Route, "parameters">,
> = ({
  request,
  params,
}: {
  request: RequestType<Scheme, Method, Content, Route, Field>;
  params: PathParams;
}) => HttpResponse | Promise<HttpResponse>;
