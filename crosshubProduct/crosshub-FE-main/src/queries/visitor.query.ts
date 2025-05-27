import { getReviews } from "@/api/site.review.api";
import { getVisitorById, getVisitors } from "@/api/site.visitor.api";
import { createQueryKeys } from "@lukemorales/query-key-factory";

const visitors = createQueryKeys("visitor", {
  all: { queryKey: [""], queryFn: getVisitors },
  reviews: { queryKey: ["reviews"], queryFn: getReviews },
  detail: (id: string) => ({
    queryKey: ["detail", id],
    queryFn: () => getVisitorById(id),
  }),
});

export { visitors };
