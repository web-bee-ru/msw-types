export interface TestApi {
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
