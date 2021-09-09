export class DiffexpResult {
  hugoName: string;
  logFoldChange: number;
  pValue: number = null;

  constructor(name:string, logFoldValue: number, pValue){
    this.hugoName=name;
    this.logFoldChange = logFoldValue;
    this.pValue=pValue;
  }
}

export class DiffexpResults {
  error: string = null;
  haspValues: boolean = false;
  geneResults:Array<DiffexpResult> = new Array();
  
  constructor() {

  }

  formatAsTextLines(maxLines:number){
    let s ="";
    for(let i = 0;i<this.geneResults.length && i<maxLines;i++){
      let q = this.geneResults[i].hugoName;
      s = s + "\n"+ q.toString(); 
    }
    return s;
  }

}
