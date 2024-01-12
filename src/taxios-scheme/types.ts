import { DefaultBodyType, HttpResponse, PathParams, StrictRequest } from "msw";
import { ConditionalPick } from "type-fest";

export type MethodType = "GET" | "HEAD" | "POST" | "PUT" | "DELETE" | "OPTIONS" | "PATCH";
type FieldType = "query" | "params" | "body" | "response";

/**
 * @description Тип taxios схемы с полями, необходимыми для request и parameters в msw
 */
export type SchemeType = {
  version: "1";
  routes: {
    [route in string]: {
      [method in MethodType]?: {
        [field in FieldType]?: unknown;
      };
    };
  };
};

/**
 * @description Выборка всех маршрутов в интерфейсе схемы taxios
 */
export type RoutesType<
  Scheme extends SchemeType,
  Method extends MethodType,
> = keyof ConditionalPick<Scheme["routes"], Partial<Record<Method, unknown>>>;

/**
 * @description Проверяет наличие поля. Если есть, то выбирает его. Any используется, так как в поле может быть любым из query, params, body, response
 */
export type CurrentFieldType<
  Scheme extends SchemeType,
  Method extends MethodType,
  Route extends RoutesType<Scheme, Method>,
  Field extends FieldType,
> = Required<Scheme["routes"][Route]>[Method] extends Partial<Record<Field, any>>
  ? Required<Required<Scheme["routes"][Route]>[Method]>[Field]
  : never;

/**
 * @description msw хранит параметры как строки или массив строк, поэтому нужно привести все значения params из taxios к строке или массиву строк
 */
export type ParamsType<
  Scheme extends SchemeType,
  Method extends MethodType,
  Route extends RoutesType<Scheme, Method>,
> = {
  [Key in keyof CurrentFieldType<Scheme, Method, Route, "params">]: CurrentFieldType<
    Scheme,
    Method,
    Route,
    "params"
  >[Key] extends unknown[]
    ? string[]
    : string;
};

/**
 * @description Расширяет HttpRequest, добавляя поле query, который берем из taxios, а типы приводим к строке (т.к. это query запрос).
 */
interface HttpRequestWithQuery<
  BodyType extends DefaultBodyType = DefaultBodyType,
  Scheme extends SchemeType = SchemeType,
  Method extends MethodType = MethodType,
  Route extends RoutesType<Scheme, Method> = RoutesType<Scheme, Method>,
  Query = Required<CurrentFieldType<Scheme, Method, Route, "query">>,
> extends StrictRequest<BodyType> {
  query: {
    [Key in keyof Query]:
      | (CurrentFieldType<Scheme, Method, Route, "query">[Key] extends undefined
          ? undefined
          : never)
      | (Query[Key] extends unknown[] ? string[] : string);
  };
}

/**
 * @description Если get или head запрос, то не используем тело запроса
 */
export type RequestType<
  Scheme extends SchemeType,
  Method extends MethodType,
  Route extends RoutesType<Scheme, Method>,
> = Record<Method, unknown> extends { GET: unknown } | { HEAD: unknown }
  ? HttpRequestWithQuery<never, Scheme, Method, Route>
  : HttpRequestWithQuery<CurrentFieldType<Scheme, Method, Route, "body">, Scheme, Method, Route>;

/**
 * @description Тип обработчика с обновленным request
 */
export type HandlerType<
  Scheme extends SchemeType,
  Method extends MethodType,
  Route extends RoutesType<Scheme, Method>,
> = ({
  request,
  params,
}: {
  request: RequestType<Scheme, Method, Route>;
  params: PathParams;
}) => HttpResponse | Promise<HttpResponse>;
