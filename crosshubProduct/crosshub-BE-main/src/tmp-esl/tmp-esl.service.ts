import { Inject, Injectable } from '@nestjs/common';
import { INJECT_PG_ESL } from './tmp-esl.pg.drizzle.provider';
import { PostgresJsDatabase } from 'drizzle-orm/postgres-js';
import { sql } from 'drizzle-orm';
import { INJECT_MARIA_ESL } from './tmp-esl.maria.drizzle.provider';
import { MySql2Database, MySqlRawQueryResult } from 'drizzle-orm/mysql2';

type SkuResult = {
  STR_CODE: string;
  SKU_CODE: string;
  CUST_SKU_NM: string;
  NEW_UPRICE: string;
  TOT_CAP: string;
  UNIT_CAP: string;
  LOW_PRICE_20: string;
  POG_SEQ_NO: string;
  POG_MCODE_NM: any;
};

@Injectable()
export class TmpEslService {
  constructor(
    @Inject(INJECT_PG_ESL) private readonly pgDb: PostgresJsDatabase,
    @Inject(INJECT_MARIA_ESL) private readonly mariaDb: MySql2Database,
  ) {}

  getEslCode(code: string) {
    const statement = sql`select * from content where code = ${code}`;

    return this.pgDb.execute(statement);
  }

  getEslCodeList(code: string) {
    const statement = sql`select * from content where code like ${'%' + code.toString() + '%'}`;

    return this.pgDb.execute(statement);
  }

  async getExactSKU(code: string) {
    const statement = sql`select
          STR_CODE,
          SKU_CODE,
          CUST_SKU_NM,
          NEW_UPRICE,
          TOT_CAP,
          UNIT_CAP,
          LOW_PRICE_20,
          POG_SEQ_NO,
          POG_MCODE_NM
From MTPCD_PCHG where SKU_CODE = ${code} and STR_CODE = 4011`;

    const res: MySqlRawQueryResult = await this.mariaDb.execute(statement);
    const exists = this.formatSkuResult(res[0] as unknown as SkuResult[]);
    return exists.length > 0 ?
        { ...exists[0], exists: true }
      : { exists: false };
  }

  async searchBySKUCode(code: string) {
    const statement = sql`select 
        STR_CODE,
        SKU_CODE,
        CUST_SKU_NM,
        NEW_UPRICE,
        TOT_CAP,
        UNIT_CAP,
        LOW_PRICE_20,
        POG_SEQ_NO,
        POG_MCODE_NM
From MTPCD_PCHG 
where  
STR_CODE = 4011
AND MATCH (SKU_CODE) AGAINST(${'*' + code + '*'} IN BOOLEAN MODE)
`;

    const res: MySqlRawQueryResult = await this.mariaDb.execute(statement);
    return this.formatSkuResult(res[0] as unknown as SkuResult[]);
  }

  async searchBySkuNmae(name: string) {
    const statement = sql`select
          STR_CODE,
          SKU_CODE,
          CUST_SKU_NM,
          NEW_UPRICE,
          TOT_CAP,
          UNIT_CAP,
          LOW_PRICE_20,
          POG_SEQ_NO,
          POG_MCODE_NM
From MTPCD_PCHG
 where STR_CODE = 4011
 AND MATCH (CUST_SKU_NM) AGAINST(${'*' + name + '*'} IN BOOLEAN MODE);
 `;

    const res: MySqlRawQueryResult = await this.mariaDb.execute(statement);
    return this.formatSkuResult(res[0] as unknown as SkuResult[]);
  }

  private formatSkuResult(result: SkuResult[]) {
    return result.map((r) => ({
      str_code: r.STR_CODE, // (매장코드),
      sku_code: r.SKU_CODE, // (상품코드),
      cust_sku_nm: r.CUST_SKU_NM, // (상품명),
      new_uprice: r.NEW_UPRICE, // (매가, 표준매가),
      low_price_20: r.LOW_PRICE_20, // (20일 최저가),
      pog_seq_no: r.POG_SEQ_NO, // (대분류코드),
      pog_mcode_nm: r.POG_MCODE_NM, // (대분류명),
      unit_price:
        Number(r.NEW_UPRICE) / (Number(r.TOT_CAP) / Number(r.UNIT_CAP)), //(단위당단가) 구하는 법 new_uprice(매가) / (tot_cap(전체용량)/unit_cap(단위용량)),
    }));
  }
}
