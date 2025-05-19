import { mergeQueryKeys } from "@lukemorales/query-key-factory";

import { admin } from "@/queries/admin.query";
import { announcement } from "@/queries/announcement.query";
import { coins } from "@/queries/coins.query";
import { faq } from "@/queries/faq.query";
import { news } from "@/queries/news.query";
import { users } from "./users.query";
import { sites } from "./sites.query";
import { visitors } from "./visitor.query";
import { txs } from "./polygon.query";

export const queries = mergeQueryKeys(
  admin,
  coins,
  news,
  faq,
  announcement,
  users,
  sites,
  visitors,
  txs,
);
