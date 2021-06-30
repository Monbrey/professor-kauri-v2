import type { PokemonType } from "urpg.js";

export const TypeColor: { [key in PokemonType]: number } = {
  NONE: 0x000000,
  BUG: 0xA8B820,
  DARK: 0x624D3E,
  DRAGON: 0x7038F8,
  ELECTRIC: 0xF8D030,
  FAIRY: 0xe898e8,
  FIRE: 0xD35400,
  FIGHTING: 0xC03028,
  FLYING: 0xA890F0,
  GHOST: 0x705898,
  GRASS: 0x78C850,
  GROUND: 0xE0C068,
  ICE: 0x98D8D8,
  NORMAL: 0x8A8A59,
  POISON: 0xA040A0,
  PSYCHIC: 0xF85888,
  ROCK: 0xB8A038,
  STEEL: 0xB8B8D0,
  WATER: 0x6890F0,
};
