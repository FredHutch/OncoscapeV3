
/**
 * Value Object Decorator For Files That Undergo Testing
 * Data Contains ... Well Data
 * Info Contains Warnings
 * Erro Contains ... Well Errors
 */
export interface iError {
    action: eAction;
    element: eElement;
    constraint: eConstraint;
    prop: string;
    value: string;
  }
  
  /**
   * Value Object Decorator For Files That Undergo Testing
   * Data Contains ... Well Data
   * Info Contains Warnings
   * Erro Contains ... Well Errors
   */
  export interface iTest {
    data: any;
    info: Array<iError>;
    error: Array<iError>;
  }
  
  export interface iSheetLog {
    sheet: eSheet;
    file: string;
    error: Array<iError>;
    info: Array<iError>;
  }
  
  export interface iField {
    name: string;
    type: eDataType;
    values: Array<any>;
  }
  
  export enum eDataType {
    Number = 1 << 0,
    String = 1 << 1,
    ID = 1 << 2,
    NA = 1 << 3
  }
  export enum eSheet {
    PATIENT = 1 << 0,
    SAMPLE = 1 << 1,
    MATRIX = 1 << 2,
    EVENT = 1 << 3,
    MUTATION = 1 << 4
  }
  export enum eConstraint {
    UNIQUE = 1 << 0,
    REQUIRED = 1 << 1,
    INVALID_VALUE = 1 << 2,
    SINGLE_VALUE = 1 << 3, // 8
    NON_NUMERIC = 1 << 4, // 16
    UNKNOWN_TYPE = 1 << 5,
    UNINFORMATIVE = 1 << 6
  }
  export enum eAction {
    REM = 1 << 0,
    MOD = 1 << 1
  }
  export enum eElement {
    SHEET = 1 << 0,
    COLUMN = 1 << 1,
    ROW = 1 << 2,
    GENE = 1 << 4
  }
  
  export interface iDatavalueNumberMinMax {
    min: number,
    max: number
  }
  
  // Either     "age":{"min": 13,"max": 93}, or "sex": ["female","male"].
  export interface iPropertyValuesMap {
    [propName: string]: (iDatavalueNumberMinMax | Array<string>)
  }
  
  export interface iManifestFileDetails {
    name: string;
    datatype: string;
    file:string,
  }
  
  export interface iManifest {
    patient: iPropertyValuesMap;
    sample: iPropertyValuesMap;
    version:string,
    schema: any,
    files: Array<iManifestFileDetails>,
    events: any
    //error: Array<iError>;
  }
  
  export interface iStudyFileStructure {
    study: {[id: string] : string; } ,
    metaFiles: iCbioMetafile[]
  }
  
  export interface iMatrixProcessResult {
    baseFileName: string,
    numNormalRecords: number,
    numZeroedRecords: number,
    loggingResult: Array<any>
  }
  
  export interface iStudyDetails {
    numPatients: number,
    numSamples: number,
    manifest: iManifest,
    studyFileStructure: iStudyFileStructure
    processedMatrixFiles: Array<iMatrixProcessResult>
  }
  
  export interface iPatientAndMetaData {
    patientIds: string[],
    metaData: any
  }
  
  export interface iSampleAndMetaData {
    sampleIds: string[],
    metaData: any
  }
  
  // iCbioMetafile contains *at least* these items.
  export interface iCbioMetafile {
    genetic_alteration_type: string,
    datatype: string,
    data_filename: string,
    stable_id: string;
  }
  
  export interface UserDataSet {
    nameString: string;
    descriptionString: string;
    fileString: string;
    isHuman: boolean;
    isHumanNull: boolean;
    isPhiBoolean: boolean;
    isPublicNull: boolean;
    manifestMap: any;
    reviewNumberString: string;
    reviewTypeMap: any;
    statusString: string;
    userIdString: string;
  }

  export interface iDataSet {
    project: string, // itemId|user
    content: any,
//    userDataSet: UserDataSet,
    studyDetails: iStudyDetails,
    datasetAnnotations: any,
    friendlyName: string
  }