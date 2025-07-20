import {
  QueryClient,
  defaultShouldDehydrateQuery,
  isServer,
} from "@tanstack/react-query";

function makeQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 60 * 1000, // 1분
        gcTime: 5 * 60 * 1000, // 5분 (cacheTime 대신 gcTime 사용)
        retry: 3, // 실패 시 3번 재시도
        retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000), // 지수 백오프
        refetchOnWindowFocus: false, // 창 포커스 시 자동 재조회 비활성화
        refetchOnReconnect: true, // 재연결 시 자동 재조회
        networkMode: 'always', // 네트워크 상태와 관계없이 항상 쿼리 실행
      },
      mutations: {
        retry: 1, // 뮤테이션 실패 시 1번 재시도
        networkMode: 'always', // 네트워크 상태와 관계없이 항상 뮤테이션 실행
      },
      dehydrate: {
        // include pending queries in dehydration
        shouldDehydrateQuery: (query) =>
          defaultShouldDehydrateQuery(query) ||
          query.state.status === "pending",
      },
    },
  });
}

let browserQueryClient: QueryClient | undefined = undefined;

export function getQueryClient() {
  if (isServer) {
    // Server: always make a new query client
    return makeQueryClient();
  } else {
    // Browser: make a new query client if we don't already have one
    // This is very important, so we don't re-make a new query client if React
    // suspends during the initial render. This may not be needed if we
    // have a suspense boundary BELOW the creation of the query client
    if (!browserQueryClient) browserQueryClient = makeQueryClient();
    return browserQueryClient;
  }
}
