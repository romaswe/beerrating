export interface BeerSheet {
  headers: string[]
  data: Array<string[]>
  styleArray: Array<Array<StyleArrayClass>>
}

export interface StyleArrayClass {
  style: string
  count: number
  topBeer: TopBeer
  avrageStyleRating: number
}

export interface TopBeer {
  name: string
  rating: number
  style: string
}

export interface Beer {
  _id: number
  name: string
  type: BeerStyle
  brewery?: string
  abv?: number
  averageRating?: number
}

export enum BeerStyle {
  LAGER = 'Lager',
  PILSNER = 'Pilsner',
  PALE_ALE = 'Pale Ale',
  IPA = 'IPA',
  STOUT = 'Stout',
  PORTER = 'Porter',
  WHEAT = 'Wheat',
  SOUR = 'Sour',
  SAISON = 'Saison',
  BELGIAN_ALE = 'Belgian Ale',
  DOUBLE_IPA = 'Double IPA',
  AMBER_ALE = 'Amber Ale',
  BROWN_ALE = 'Brown Ale',
  DUNKEL = 'Dunkel',
  OTHER = 'Other'
  // Add more styles as needed
}

export interface Rating {
  _id: string
  beer: string
  user: User
  score: number
  comment: string
  createdAt: Date
  updatedAt: Date
  __v: number
}

export interface User {
  _id: string
  username: string
}
