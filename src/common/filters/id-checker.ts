import { BadRequestException, Injectable } from "@nestjs/common";

@Injectable()
export class IdChecker {
  check(id: any) {
    if (isNaN(Number(id))) {
      throw new BadRequestException("ID must be a number");
    }
    id = Number(id);
    if (Number(id) < 1) {
      throw new BadRequestException("ID must be greater than 0");
    }
    return true;
  }
}
