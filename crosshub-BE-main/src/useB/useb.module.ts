import { Module } from "@nestjs/common";
import { useBService } from "./useb.service"


@Module({
  imports: [],
  controllers: [],
  providers: [useBService],
  exports: [useBService],
})
export class UseBModule {}