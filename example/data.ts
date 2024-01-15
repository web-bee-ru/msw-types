/** Пример taxios схемы */

export interface TaxiosTestApi {
  version: "1";
  routes: {
    "/test1": {
      GET: {
        query: {
          name: string;
        };
        params: {
          id: string;
        };
        response: {
          id: "string";
          data: object;
        };
      };
    };
    "/test2": {
      GET: {
        query: {
          name2: string;
        };
        params: {
          id2: string;
        };
        response: {
          id2: string;
          data2: object;
        };
      };
    };
    "/test3": {
      GET: {
        query: {
          name3: string;
        };
        params: {
          id3: string;
        };
        response: {
          id3: string;
          data3: object;
        };
      };
    };
  };
}

/** Пример openapi-typescript схемы  */
export interface TestOpenApi {
  "/breeds": {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    /**
     * Get a list of breeds
     * @description Returns a a list of breeds
     */
    get: operations["getBreeds"];
    put?: never;
    post?: never;
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  "/fact": {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    /**
     * Get Random Fact
     * @description Returns a random fact
     */
    get: operations["getRandomFact"];
    put?: never;
    post?: never;
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  "/facts": {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    /**
     * Get a list of facts
     * @description Returns a a list of facts
     */
    get: operations["getFacts"];
    put?: never;
    post?: never;
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
}

interface components {
  schemas: {
    /**
     * Breed model
     * @description Breed
     */
    Breed: {
      /**
       * Breed
       * Format: string
       * @description Breed
       */
      breed?: string;
      /**
       * Country
       * Format: string
       * @description Country
       */
      country?: string;
      /**
       * Origin
       * Format: string
       * @description Origin
       */
      origin?: string;
      /**
       * Coat
       * Format: string
       * @description Coat
       */
      coat?: string;
      /**
       * Pattern
       * Format: string
       * @description Pattern
       */
      pattern?: string;
    };
    /**
     * CatFact model
     * @description CatFact
     */
    CatFact: {
      /**
       * Fact
       * Format: string
       * @description Fact
       */
      fact?: string;
      /**
       * Length
       * Format: int32
       * @description Length
       */
      length?: number;
    };
    Error: {
      code: number;
      message: string;
    };
  };
  responses: never;
  parameters: never;
  requestBodies: never;
  headers: never;
  pathItems: never;
}

interface operations {
  getBreeds: {
    parameters: {
      query?: {
        /** @description limit the amount of results returned */
        limit?: number;
      };
      header?: never;
      path?: never;
      cookie?: never;
    };
    requestBody?: never;
    responses: {
      /** @description successful operation */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          "application/json": components["schemas"]["Breed"][];
        };
      };
      /** @description error */
      default: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          "application/json": components["schemas"]["Error"];
        };
      };
    };
  };
  getRandomFact: {
    parameters: {
      query?: {
        /** @description maximum length of returned fact */
        max_length?: number;
      };
      header?: never;
      path?: never;
      cookie?: never;
    };
    requestBody?: never;
    responses: {
      /** @description successful operation */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          "application/json": components["schemas"]["CatFact"];
        };
      };
      /** @description not found */
      404: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          "application/json": components["schemas"]["Error"];
        };
      };
      /** @description error */
      default: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          "application/json": components["schemas"]["Error"];
        };
      };
    };
  };
  getFacts: {
    parameters: {
      query?: {
        /** @description maximum length of returned fact */
        max_length?: number;
        /** @description limit the amount of results returned */
        limit?: number;
      };
      header?: never;
      path?: never;
      cookie?: never;
    };
    requestBody?: never;
    responses: {
      /** @description successful operation */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          "application/json": components["schemas"]["CatFact"][];
        };
      };
      /** @description error */
      default: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          "application/json": components["schemas"]["Error"];
        };
      };
    };
  };
}
