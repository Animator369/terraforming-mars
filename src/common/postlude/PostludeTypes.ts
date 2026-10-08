import {CardName} from '../cards/CardName';
import {SpaceBonus} from '../boards/SpaceBonus';
import {PlayerId} from '../Types';
import {Color} from '../Color';

export type UpgradeType = 'CITY_UPGRADE' | 'GREENERY_UPGRADE' | 'OCEAN_UPGRADE';
export type TargetTileType = 'CITY' | 'GREENERY' | 'OCEAN';

export interface SpaceUpgrade {
  cardId: CardName;
  upgradeType: UpgradeType;
  ownerId: PlayerId;
  additionalPlacementBonus?: Array<SpaceBonus>;
}

export interface SpaceUpgradeModel {
  cardId: CardName;
  upgradeType: UpgradeType;
  ownerId: PlayerId;
  color?: Color;
  additionalPlacementBonus?: Array<SpaceBonus>;
}

export const POSTLUDE_CARD_IMAGE_MAP: Partial<Record<CardName, string>> = {
  [CardName.DELUXE_WATERFRONT_RESORT]: 'deluxe-waterfront-resort.webp',
  [CardName.ASTRO_UNIVERSITY]: 'astro-university.webp',
  [CardName.CITY_PROJECT_LIBRARY]: 'city-project-library.webp',
  [CardName.FLIGHT_ACADEMY]: 'flight-academy.webp',
  [CardName.FOOD_PROCESSING_UNIT]: 'food-processing-unit.webp',
  [CardName.INSURANCE_HQ]: 'insurance-hq.webp',
  [CardName.MACHINERY_FACTORY]: 'machinery-factory.webp',
  [CardName.MARS_CASINO]: 'mars-casino.webp',
  [CardName.MARS_HOSPITAL]: 'mars-hospital.webp',
  [CardName.METALLURGY_WORKSHOP]: 'metalurgy-workshop.webp',
  [CardName.MINERAL_REFINERY]: 'mineral-refinery.webp',
  [CardName.MINING_DEPOT]: 'mining-depot.webp',
  [CardName.NANO_PARTICLE_SYNTHESIZER]: 'nano-particle-synthesizer.webp',
  [CardName.PHARMACEUTICAL_CO]: 'pharmaceutical-co.webp',
  [CardName.POWER_CONVERTER]: 'power-converter.webp',
  [CardName.RE_DEVELOPMENT_OFFICE]: 'redevelopment-office.webp',
  [CardName.SCIENCE_INSTITUTE]: 'science-institute.webp',
  [CardName.THE_BLACK_MARKET]: 'black-market.webp',
  [CardName.AMUSEMENT_PARK]: 'amusement-park.webp',
  [CardName.ANIMAL_FARM]: 'animal-farm.webp',
  [CardName.CULTIVATION_BIO_DOME]: 'cultivation-bio-dome.webp',
  [CardName.PHOTOBIONIC_POWER_STATION]: 'photobionic-power-station.webp',
  [CardName.PROBIOTICS_MANUFACTORY]: 'probiotics.webp',
  [CardName.SOIL_ENRICHMENT_LAB]: 'soil-enrichment-lab.webp',
  [CardName.UNIVERSAL_BIO_STORE]: 'universal-bio-store.webp',
  [CardName.WASTE_PROCESSING_CENTRE]: 'waste-processing-centre.webp',
  [CardName.NATIONAL_GREEN_PARK]: 'national-green-park.webp',
  [CardName.AQUATIC_LIFE_LABORATORY]: 'aquatic-life-laboratory.webp',
  [CardName.CLOUD_GENERATOR]: 'cloud-generator.webp',
  [CardName.DEEP_SEA_MINING_RIG]: 'deep-sea-mining-rig.webp',
  [CardName.FLOATING_METROPOLIS]: 'floating-metropolis.webp',
  [CardName.HYDRAULIC_POWER_PLANT]: 'hydraulic-power-plant.webp',
  [CardName.MARINE_AQUARIUM]: 'marine-aquarium.webp',
  [CardName.MOBILE_LAUNCH_STATION]: 'mobile-launch-station.webp',
  [CardName.OCEAN_GREEN_FARM]: 'ocean-green-farm.webp',
  [CardName.ORE_REFINERY]: 'ore-refinery.webp',
  [CardName.RESEARCH_WATCHTOWER]: 'research-watchtower.webp',
  [CardName.SEA_ORBITER]: 'sea-orbiter.webp',
  [CardName.SKY_ELEVATOR]: 'sky-elevator.webp',
  [CardName.SPORT_DIVING_SCHOOL]: 'sport-diving-school.webp',
  [CardName.UNDERWATER_RESORT]: 'underwater-resort.webp',
  [CardName.WATER_RECYCLE_COMPLEX]: 'water-recycle-complex.webp',
};
