import {CardName} from '../../../common/cards/CardName';
import {ModuleManifest} from '../ModuleManifest';
import * as City from './PostludeCityCards';
import * as Greenery from './PostludeGreeneryCards';
import * as Ocean from './PostludeOceanCards';

export const POSTLUDE_CARD_MANIFEST = new ModuleManifest({
  module: 'postlude',
  projectCards: {
    // City Upgrades (18)
    [CardName.DELUXE_WATERFRONT_RESORT]: {Factory: City.DeluxeWaterfrontResort},
    [CardName.ASTRO_UNIVERSITY]: {Factory: City.AstroUniversity},
    [CardName.CITY_PROJECT_LIBRARY]: {Factory: City.CityProjectLibrary},
    [CardName.FLIGHT_ACADEMY]: {Factory: City.FlightAcademy},
    [CardName.FOOD_PROCESSING_UNIT]: {Factory: City.FoodProcessingUnit},
    [CardName.INSURANCE_HQ]: {Factory: City.InsuranceHQ},
    [CardName.MACHINERY_FACTORY]: {Factory: City.MachineryFactory},
    [CardName.MARS_CASINO]: {Factory: City.MarsCasino},
    [CardName.MARS_HOSPITAL]: {Factory: City.MarsHospital},
    [CardName.METALLURGY_WORKSHOP]: {Factory: City.MetallurgyWorkshop},
    [CardName.MINERAL_REFINERY]: {Factory: City.MineralRefinery},
    [CardName.MINING_DEPOT]: {Factory: City.MiningDepot},
    [CardName.NANO_PARTICLE_SYNTHESIZER]: {Factory: City.NanoParticleSynthesizer},
    [CardName.PHARMACEUTICAL_CO]: {Factory: City.PharmaceuticalCo},
    [CardName.POWER_CONVERTER]: {Factory: City.PowerConverter},
    [CardName.RE_DEVELOPMENT_OFFICE]: {Factory: City.ReDevelopmentOffice},
    [CardName.SCIENCE_INSTITUTE]: {Factory: City.ScienceInstitute},
    [CardName.THE_BLACK_MARKET]: {Factory: City.TheBlackMarket},

    // Greenery Upgrades (9)
    [CardName.AMUSEMENT_PARK]: {Factory: Greenery.AmusementPark},
    [CardName.ANIMAL_FARM]: {Factory: Greenery.AnimalFarm},
    [CardName.CULTIVATION_BIO_DOME]: {Factory: Greenery.CultivationBioDome},
    [CardName.PHOTOBIONIC_POWER_STATION]: {Factory: Greenery.PhotobionicPowerStation},
    [CardName.PROBIOTICS_MANUFACTORY]: {Factory: Greenery.ProbioticsManufactory},
    [CardName.SOIL_ENRICHMENT_LAB]: {Factory: Greenery.SoilEnrichmentLab},
    [CardName.UNIVERSAL_BIO_STORE]: {Factory: Greenery.UniversalBioStore},
    [CardName.WASTE_PROCESSING_CENTRE]: {Factory: Greenery.WasteProcessingCentre},
    [CardName.NATIONAL_GREEN_PARK]: {Factory: Greenery.NationalGreenPark},

    // Ocean Upgrades (15)
    [CardName.AQUATIC_LIFE_LABORATORY]: {Factory: Ocean.AquaticLifeLaboratory},
    [CardName.CLOUD_GENERATOR]: {Factory: Ocean.CloudGenerator},
    [CardName.DEEP_SEA_MINING_RIG]: {Factory: Ocean.DeepSeaMiningRig},
    [CardName.FLOATING_METROPOLIS]: {Factory: Ocean.FloatingMetropolis},
    [CardName.HYDRAULIC_POWER_PLANT]: {Factory: Ocean.HydraulicPowerPlant},
    [CardName.MARINE_AQUARIUM]: {Factory: Ocean.MarineAquarium},
    [CardName.MOBILE_LAUNCH_STATION]: {Factory: Ocean.MobileLaunchStation},
    [CardName.OCEAN_GREEN_FARM]: {Factory: Ocean.OceanGreenFarm},
    [CardName.ORE_REFINERY]: {Factory: Ocean.OreRefinery},
    [CardName.RESEARCH_WATCHTOWER]: {Factory: Ocean.ResearchWatchtower},
    [CardName.SEA_ORBITER]: {Factory: Ocean.SeaOrbiter},
    [CardName.SKY_ELEVATOR]: {Factory: Ocean.SkyElevator},
    [CardName.SPORT_DIVING_SCHOOL]: {Factory: Ocean.SportDivingSchool},
    [CardName.UNDERWATER_RESORT]: {Factory: Ocean.UnderwaterResort},
    [CardName.WATER_RECYCLE_COMPLEX]: {Factory: Ocean.WaterRecycleComplex},
  },
});
