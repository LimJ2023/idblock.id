import { Injectable } from '@nestjs/common';

@Injectable()
export abstract class EmailService {
  public abstract sendEmail(to: string, code: string): Promise<string>;
}
