export enum MassUnit {
  MCG = 'mcg',
  MG = 'mg',
  G = 'g',
  KG = 'kg',
  OZ = 'oz',
  LB = 'lb',
}

export enum VolumeUnit {
  MM3 = 'mm3',
  CM3 = 'cm3',
  ML = 'ml',
  L = 'l',
  M3 = 'm3',
  KM3 = 'km3',
  TSP = 'tsp',
  TBSP = 'Tbs',
  FL_OZ = 'fl-oz',
  CUP = 'cup',
  PNT = 'pnt',
  QT = 'qt',
  GAL = 'gal',
}

export enum PieceUnit {
  PIECE = 'piece',
  UNIT = 'unit',
}

export const Unit = { ...MassUnit, ...VolumeUnit, ...PieceUnit };
export type UnitType = MassUnit | VolumeUnit | PieceUnit;

export const AllUnits = [
  ...Object.values(MassUnit),
  ...Object.values(VolumeUnit),
  ...Object.values(PieceUnit),
];

// Groupes d'unités pour l'affichage dans le select
export const UnitGroups = {
  Mass: Object.values(MassUnit),
  Volume: Object.values(VolumeUnit),
  Piece: Object.values(PieceUnit),
};

// Labels pour l'affichage
export const UnitLabels: Record<UnitType, string> = {
  // Mass units
  [MassUnit.MCG]: 'Microgramme (mcg)',
  [MassUnit.MG]: 'Milligramme (mg)',
  [MassUnit.G]: 'Gramme (g)',
  [MassUnit.KG]: 'Kilogramme (kg)',
  [MassUnit.OZ]: 'Once (oz)',
  [MassUnit.LB]: 'Livre (lb)',

  // Volume units
  [VolumeUnit.MM3]: 'Millimètre cube (mm³)',
  [VolumeUnit.CM3]: 'Centimètre cube (cm³)',
  [VolumeUnit.ML]: 'Millilitre (ml)',
  [VolumeUnit.L]: 'Litre (l)',
  [VolumeUnit.M3]: 'Mètre cube (m³)',
  [VolumeUnit.KM3]: 'Kilomètre cube (km³)',
  [VolumeUnit.TSP]: 'Cuillère à café (tsp)',
  [VolumeUnit.TBSP]: 'Cuillère à soupe (Tbs)',
  [VolumeUnit.FL_OZ]: 'Once liquide (fl-oz)',
  [VolumeUnit.CUP]: 'Tasse (cup)',
  [VolumeUnit.PNT]: 'Pinte (pnt)',
  [VolumeUnit.QT]: 'Quart (qt)',
  [VolumeUnit.GAL]: 'Gallon (gal)',

  // Piece units
  [PieceUnit.PIECE]: 'Pièce',
  [PieceUnit.UNIT]: 'Unité',
};
