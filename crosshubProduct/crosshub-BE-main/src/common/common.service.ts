import { Inject, Injectable } from '@nestjs/common';
import { DrizzleDB, INJECT_DRIZZLE } from 'src/database/drizzle.provider';
import { EnvService } from 'src/env/env.service';

@Injectable()
export class CommonService {
  constructor(
    @Inject(INJECT_DRIZZLE) private db: DrizzleDB,
    private readonly envService: EnvService,
  ) {}

  getCountryList() {
    return this.db.query.Country.findMany();
  }

  getCityList(countryCode: string) {
    return this.db.query.City.findMany({
      where: (cities, { eq }) => eq(cities.countryCode, countryCode),
      columns: {
        id: true,
        country: true,
        name: true,
      },
    });
  }

  async getTermOfService() {
    const [target] = await this.db.execute(
      'SELECT * FROM privacy_policy where category = 0 order by id desc LIMIT 1',
    );

    return target.url;
  }

  async getPrivacyPolicy() {
    const [target] = await this.db.execute(
      'SELECT * FROM privacy_policy where category = 1 order by id desc LIMIT 1',
    );

    return target.url;
  }

  async getVersion(q: 'ANDROID' | 'IOS') {
    return {
      minVersion:
        q === 'ANDROID' ?
          this.envService.get('ANDROID_MIN_VERSION')
        : this.envService.get('IOS_MIN_VERSION'),
    };
  }
}
