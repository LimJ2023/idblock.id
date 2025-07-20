import ky from "ky";

const multipartApi = ky.create({
  prefixUrl: "/api/v1/",
  credentials: "include",
  retry: {},
  timeout: 60000, // 60초 타임아웃
});

const api = ky.create({
  // TODO
  // prefixUrl: "https://admin.idblock-test.site/api/v1/",
  // prefixUrl: "https://manager.idblock.id/api/v1/",
  prefixUrl: "https://idblock-test.site/api/v1/scan",
  credentials: "include",
  timeout: 60000, // 60초 타임아웃
  headers: {
    "Content-Type": "application/json",
  },
  hooks: {
    afterResponse: [
      async (_request, _options, response) => {
        if (response.status === 401) {
          // Automatically log out the user
          // logout();
          window.location.href = "/";

          // Optionally throw an error so the calling code knows
          throw new Error("Unauthorized. User has been logged out.");
        }

        return response;
      },
    ],
  },
});

// const authorized = admin.extend({
//   headers:
// })

const polygonApi = ky.create({
  prefixUrl: "https://api-cardona-zkevm.polygonscan.com/api",
  timeout: 30000, // 30초 타임아웃 (외부 API)
  searchParams: {
    // apikey: "3PXZ4CZWFS3KGZDSUS8M3P78MW4AW7R6XN",
    apikey: "QSRKS6RJKYPMERPS1WAG9TQK19E7D1SXNF",
  },
});

export { api, multipartApi, polygonApi };
