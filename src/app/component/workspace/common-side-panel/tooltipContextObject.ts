import { EntityTypeEnum } from "app/model/enum.model";

export class TooltipContextObject {
  entityId: string;
  entityType: EntityTypeEnum;
  
  
  constructor(entityType: EntityTypeEnum, entityId: string) {
    this.entityType = entityType;
    this.entityId = entityId;
  }
}