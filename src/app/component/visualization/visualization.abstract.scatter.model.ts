import { VisualizationEnum, EntityTypeEnum, DimensionEnum } from 'app/model/enum.model';
import { GraphData } from './../../model/graph-data.model';
import { GraphConfig } from './../../model/graph-config.model';


export class VisualizationAbstractScatterConfigModel extends GraphConfig {

  constructor() {
      super();
      this.isScatterVisualization = true;
      this.enableMarkerBaseSize = true;
      this.enableSize = true;
      this.uiOptions.markerBaseSize = 10;

    }


}
