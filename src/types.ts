import { DefaultBodyType, HttpResponse, StrictRequest } from "msw";
import { ConditionalPick } from "type-fest";

export type Method = "GET" | "HEAD" | "POST" | "PUT" | "DELETE" | "OPTIONS" | "PATCH";
type Field = "query" | "params" | "body" | "response";

export type FieldType<
  T extends Scheme,
  M extends Method,
  Route extends Routes<T, M>,
  F extends Field,
> = Required<T["routes"][Route]>[M] extends Partial<Record<F, any>>
  ? Required<Required<T["routes"][Route]>[M]>[F]
  : never;

export type Scheme = {
  version: "1";
  routes: {
    [route in string]: {
      [method in Method]?: {
        [field in Field]?: unknown;
      };
    };
  };
};

export type Routes<T extends Scheme, M extends Method> = keyof ConditionalPick<
  T["routes"],
  Partial<Record<M, unknown>>
>;

/**
 * msw хранит параметры как строки или массив строк, поэтому нужно привести все значения params из Taxios к строке или массиву строк
 */
export type Params<T extends Scheme, M extends Method, Route extends Routes<T, M>> = {
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
 * Расширяем тип HttpRequest, добавляя поле query, который берем  из taxios`а, а типы приводим к строке (т.к. это query запроса).
 */
interface HttpRequestWithQuery<
  BodyType extends DefaultBodyType = DefaultBodyType,
  T extends Scheme = Scheme,
  M extends Method = Method,
  Route extends Routes<T, M> = Routes<T, M>,
  Q = Required<FieldType<T, M, Route, "query">>,
> extends StrictRequest<BodyType> {
  query: {
    [K in keyof Q]:
      | (FieldType<T, M, Route, "query">[K] extends undefined ? undefined : never)
      | (Q[K] extends unknown[] ? string[] : string);
  };
}

export type ReqType<T extends Scheme, M extends Method, K extends Routes<T, M>> = Record<
  M,
  unknown
> extends { GET: unknown } | { HEAD: unknown }
  ? HttpRequestWithQuery<never, T, M, K>
  : HttpRequestWithQuery<FieldType<T, M, K, "body">, T, M, K>;

export type HandlerType<T extends Scheme, M extends Method, K extends Routes<T, M>> = ({
  request,
  params,
}: {
  request: ReqType<T, M, K>;
  params: unknown;
}) => HttpResponse | Promise<HttpResponse>;
