/**
 * Represents a geneVariantTree
 */
export interface GeneCnaVariantTree {
  amp: Array<number>; // all values are IDs in sorted sampleID list.
  gain: Array<number>;
  loss: Array<number>;
  del: Array<number>;
}
