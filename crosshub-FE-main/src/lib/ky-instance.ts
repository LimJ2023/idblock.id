import ky from "ky";

const multipartApi = ky.create({
  prefixUrl: "/api/v1/",
  credentials: "include",
  retry: {},
});

const api = ky.create({
  prefixUrl: "/api/v1/",
  credentials: "include",
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
  searchParams: {
    // apikey: "3PXZ4CZWFS3KGZDSUS8M3P78MW4AW7R6XN",
    apikey: "QSRKS6RJKYPMERPS1WAG9TQK19E7D1SXNF",
  },
});

export { api, multipartApi, polygonApi };
