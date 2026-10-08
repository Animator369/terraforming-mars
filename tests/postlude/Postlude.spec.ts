import {expect} from 'chai';
import {IGame} from '../../src/server/IGame';
import {TestPlayer} from '../TestPlayer';
import {testGame, addCity, addGreenery, addOcean, setOxygenLevel} from '../TestingUtils';
import {PostludeExpansion} from '../../src/server/postlude/PostludeExpansion';
import {CardName} from '../../src/common/cards/CardName';
import {SpaceBonus} from '../../src/common/boards/SpaceBonus';
import {SpaceType} from '../../src/common/boards/SpaceType';
import {Board} from '../../src/server/boards/Board';
import {MAX_OXYGEN_LEVEL} from '../../src/common/constants';
import {Resource} from '../../src/common/Resource';
import {ConvertPlants} from '../../src/server/cards/base/standardActions/ConvertPlants';
import {MachineryFactory, MetallurgyWorkshop, AstroUniversity, InsuranceHQ, TheBlackMarket, MineralRefinery, MiningDepot, FoodProcessingUnit, FlightAcademy} from '../../src/server/cards/postlude/PostludeCityCards';
import {AmusementPark, SoilEnrichmentLab, CultivationBioDome, NationalGreenPark, ProbioticsManufactory, UniversalBioStore} from '../../src/server/cards/postlude/PostludeGreeneryCards';
import {SeaOrbiter, OreRefinery, DeepSeaMiningRig} from '../../src/server/cards/postlude/PostludeOceanCards';
import {RoboticWorkforce} from '../../src/server/cards/base/RoboticWorkforce';
import {CyberiaSystems} from '../../src/server/cards/promo/CyberiaSystems';
import {PowerPlant} from '../../src/server/cards/base/PowerPlant';
import {DecreaseAnyProduction} from '../../src/server/deferredActions/DecreaseAnyProduction';
import {CardResource} from '../../src/common/CardResource';
import {Tag} from '../../src/common/cards/Tag';
import {GreeneryStandardProject} from '../../src/server/cards/base/standardProjects/GreeneryStandardProject';
import {SelectSpace} from '../../src/server/inputs/SelectSpace';
import {Plantation} from '../../src/server/cards/base/Plantation';

describe('Postlude Expansion', () => {
  let game: IGame;
  let player1: TestPlayer;
  let player2: TestPlayer;

  beforeEach(() => {
    [game, player1, player2] = testGame(2, {postludeExpansion: true});
  });

  describe('Placement validation', () => {
    it('Mars Hospital allows placement on city with <= 2 occupied neighbors, rejects > 2', () => {
      const center = game.board.spaces.find(
        (s) => s.spaceType === SpaceType.LAND && game.board.getAdjacentSpaces(s).filter((adj) => adj.spaceType === SpaceType.LAND).length >= 3,
      )!;
      addCity(player1, center.id);

      expect(PostludeExpansion.canPlaceUpgrade(game.board, center, CardName.MARS_HOSPITAL, player1)).is.true;

      const adj = game.board.getAdjacentSpaces(center).filter((s) => s.spaceType === SpaceType.LAND);
      addGreenery(player1, adj[0].id);
      addGreenery(player1, adj[1].id);
      expect(PostludeExpansion.canPlaceUpgrade(game.board, center, CardName.MARS_HOSPITAL, player1)).is.true;

      addGreenery(player1, adj[2].id);
      // Now 3 occupied neighbors
      expect(PostludeExpansion.canPlaceUpgrade(game.board, center, CardName.MARS_HOSPITAL, player1)).is.false;
    });

    it('Mars Casino only valid in polar rows', () => {
      const yValues = game.board.spaces.filter((s) => s.y >= 0 && s.spaceType === SpaceType.LAND).map((s) => s.y);
      const minY = Math.min(...yValues);
      const maxY = Math.max(...yValues);
      const midY = Math.floor((minY + maxY) / 2);

      const polarSpace = game.board.spaces.find((s) => s.y === minY && s.spaceType === SpaceType.LAND)!;
      const midSpace = game.board.spaces.find((s) => s.y === midY && s.spaceType === SpaceType.LAND)!;

      addCity(player1, polarSpace.id);
      addCity(player1, midSpace.id);

      expect(PostludeExpansion.canPlaceUpgrade(game.board, polarSpace, CardName.MARS_CASINO, player1)).is.true;
      expect(PostludeExpansion.canPlaceUpgrade(game.board, midSpace, CardName.MARS_CASINO, player1)).is.false;
    });

    it('Waste Processing Centre only valid on map periphery', () => {
      const edgeSpace = game.board.spaces.find((s) => PostludeExpansion.isPeriphery(game.board, s) && s.spaceType === SpaceType.LAND)!;
      const centerSpace = game.board.spaces.find((s) => !PostludeExpansion.isPeriphery(game.board, s) && s.spaceType === SpaceType.LAND)!;

      addGreenery(player1, edgeSpace.id);
      addGreenery(player1, centerSpace.id);

      expect(PostludeExpansion.canPlaceUpgrade(game.board, edgeSpace, CardName.WASTE_PROCESSING_CENTRE, player1)).is.true;
      expect(PostludeExpansion.canPlaceUpgrade(game.board, centerSpace, CardName.WASTE_PROCESSING_CENTRE, player1)).is.false;
    });

    it('Deluxe Waterfront Resort requires City adjacent to Ocean', () => {
      const oceanSlot = game.board.spaces.find((s) => s.spaceType === SpaceType.OCEAN)!;
      addOcean(player1, oceanSlot.id);
      const landAdjToOcean = game.board.getAdjacentSpaces(oceanSlot).find((s) => s.spaceType === SpaceType.LAND)!;
      const nonOceanAdj = game.board.spaces.find(
        (s) => s.spaceType === SpaceType.LAND && !game.board.getAdjacentSpaces(s).some(Board.isOceanSpace),
      )!;

      addCity(player1, landAdjToOcean.id);
      addCity(player1, nonOceanAdj.id);

      expect(PostludeExpansion.canPlaceUpgrade(game.board, landAdjToOcean, CardName.DELUXE_WATERFRONT_RESORT, player1)).is.true;
      expect(PostludeExpansion.canPlaceUpgrade(game.board, nonOceanAdj, CardName.DELUXE_WATERFRONT_RESORT, player1)).is.false;
    });

    it('Ocean upgrades can be placed on any ocean, but not city or greenery', () => {
      const oceanSlot = game.board.spaces.find((s) => s.spaceType === SpaceType.OCEAN)!;
      const ocean = addOcean(player1, oceanSlot.id);
      const land = game.board.spaces.find((s) => s.spaceType === SpaceType.LAND)!;
      addCity(player1, land.id);

      expect(PostludeExpansion.canPlaceUpgrade(game.board, ocean, CardName.DEEP_SEA_MINING_RIG, player1)).is.true;
      expect(PostludeExpansion.canPlaceUpgrade(game.board, land, CardName.DEEP_SEA_MINING_RIG, player1)).is.false;
    });

    it('Cannot place upgrade on space that already has an upgrade', () => {
      const oceanSlot = game.board.spaces.find((s) => s.spaceType === SpaceType.OCEAN)!;
      const ocean = addOcean(player1, oceanSlot.id);
      expect(PostludeExpansion.canPlaceUpgrade(game.board, ocean, CardName.DEEP_SEA_MINING_RIG, player1)).is.true;

      PostludeExpansion.placeUpgrade(player1, ocean, CardName.DEEP_SEA_MINING_RIG, 'OCEAN_UPGRADE', [SpaceBonus.STEEL]);
      expect(PostludeExpansion.canPlaceUpgrade(game.board, ocean, CardName.AQUATIC_LIFE_LABORATORY, player1)).is.false;
    });
  });

  describe('Ocean Upgrade neighbor placement bonuses', () => {
    it('Player 2 receives Steel neighbor bonus when placing adjacent to Deep Sea Mining Rig', () => {
      const oceanSlot = game.board.spaces.find((s) => s.spaceType === SpaceType.OCEAN)!;
      const ocean = addOcean(player1, oceanSlot.id);
      const adjLand = game.board.getAdjacentSpaces(ocean).find((s) => s.spaceType === SpaceType.LAND)!;

      PostludeExpansion.placeUpgrade(player1, ocean, CardName.DEEP_SEA_MINING_RIG, 'OCEAN_UPGRADE', [SpaceBonus.STEEL]);

      const initialSteel = player2.steel;
      addGreenery(player2, adjLand.id);

      expect(player2.steel).eq(initialSteel + 1);
    });

    it('Player 2 receives 2 M€ neighbor bonus when placing adjacent to Underwater Resort', () => {
      const oceanSlot = game.board.spaces.find((s) => s.spaceType === SpaceType.OCEAN)!;
      const ocean = addOcean(player1, oceanSlot.id);
      const adjLand = game.board.getAdjacentSpaces(ocean).find((s) => s.spaceType === SpaceType.LAND)!;

      PostludeExpansion.placeUpgrade(player1, ocean, CardName.UNDERWATER_RESORT, 'OCEAN_UPGRADE', [
        SpaceBonus.MEGACREDITS,
        SpaceBonus.MEGACREDITS,
      ]);

      const initialMC = player2.megaCredits;
      addCity(player2, adjLand.id);

      // Standard ocean adjacency bonus (2 MC) + Underwater Resort placement bonus (2 MC) = 4 MC
      expect(player2.megaCredits).eq(initialMC + 4);
    });
  });

  describe('Amusement Park bonus doubling', () => {
    it('Doubles the placement bonus of adjacent hex', () => {
      const landWithPlants = game.board.spaces.find((s) => s.spaceType === SpaceType.LAND && s.bonus.includes(SpaceBonus.PLANT))!;
      const adjLand = game.board.getAdjacentSpaces(landWithPlants).find((s) => s.spaceType === SpaceType.LAND)!;

      addGreenery(player1, adjLand.id);
      PostludeExpansion.placeUpgrade(player1, adjLand, CardName.AMUSEMENT_PARK, 'GREENERY_UPGRADE');

      const initialPlants = player2.plants;
      const plantBonusCount = landWithPlants.bonus.filter((b) => b === SpaceBonus.PLANT).length;

      addCity(player2, landWithPlants.id);

      // Amusement park doubles the space bonus (2X)
      expect(player2.plants).eq(initialPlants + plantBonusCount * 2);
    });
  });

  describe('Mars Hospital TR bonus at max Oxygen', () => {
    it('Grants TR for adjacent greenery even when oxygen is at 14%', () => {
      setOxygenLevel(game, MAX_OXYGEN_LEVEL);

      const citySpace = game.board.spaces.find((s) => s.spaceType === SpaceType.LAND)!;
      const adjSpace = game.board.getAdjacentSpaces(citySpace).find((s) => s.spaceType === SpaceType.LAND)!;

      addCity(player1, citySpace.id);
      PostludeExpansion.placeUpgrade(player1, citySpace, CardName.MARS_HOSPITAL, 'CITY_UPGRADE');

      const initialTR = player1.terraformRating;
      addGreenery(player1, adjSpace.id);

      expect(player1.terraformRating).eq(initialTR + 1);
    });
  });

  describe('Insurance HQ immunity and attack refund', () => {
    it('Prevents production reduction from attacks', () => {
      const citySpace = game.board.spaces.find((s) => s.spaceType === SpaceType.LAND)!;
      addCity(player1, citySpace.id);
      PostludeExpansion.placeUpgrade(player1, citySpace, CardName.INSURANCE_HQ, 'CITY_UPGRADE');
      player1.playedCards.push(new InsuranceHQ());

      expect(player1.canHaveProductionReduced(Resource.ENERGY, 1, player2)).is.false;
      expect(player1.canHaveProductionReduced(Resource.STEEL, 1, player2)).is.false;
    });

    it('Refunds resources when stolen or destroyed', () => {
      const citySpace = game.board.spaces.find((s) => s.spaceType === SpaceType.LAND)!;
      const adjSpace1 = game.board.getAdjacentSpaces(citySpace).find((s) => s.spaceType === SpaceType.LAND)!;

      addCity(player1, citySpace.id);
      addGreenery(player1, adjSpace1.id);
      PostludeExpansion.placeUpgrade(player1, citySpace, CardName.INSURANCE_HQ, 'CITY_UPGRADE');
      player1.playedCards.push(new InsuranceHQ());

      player1.plants = 5;
      // Opponent steals 2 plants:
      player1.attack(player2, Resource.PLANTS, 2);

      // Normal deduction was 2, but Insurance HQ refunded 1 plant per own adjacent tile (1 adjacent own greenery)
      expect(player1.plants).eq(5 - 2 + 1);
    });
  });

  describe('The Black Market theft hook', () => {
    it('Gains difference between deducted resources and own adjacent tiles', () => {
      const citySpace = game.board.spaces.find((s) => s.spaceType === SpaceType.LAND)!;
      addCity(player1, citySpace.id);
      PostludeExpansion.placeUpgrade(player1, citySpace, CardName.THE_BLACK_MARKET, 'CITY_UPGRADE');
      player1.playedCards.push(new TheBlackMarket());

      player1.plants = 10;
      const initialPlants = player1.plants;
      // If player2 attacks player1 for 3 plants:
      // Actual deducted: 3. Own adjacent tiles to Black Market: 0. Difference: 3.
      // Owner of Black Market (player1) gains 3 plants!
      player1.attack(player2, Resource.PLANTS, 3);
      // player1 lost 3 from attack, but gained 3 back from Black Market!
      expect(player1.plants).eq(initialPlants - 3 + 3);
    });
  });

  describe('Soil Enrichment Lab greenery plant discount', () => {
    it('Reduces greenery cost by 1 plant (7 plants instead of 8) for adjacent spaces', () => {
      const greenerySpace = game.board.spaces.find((s) => s.spaceType === SpaceType.LAND)!;

      addGreenery(player1, greenerySpace.id);
      PostludeExpansion.placeUpgrade(player1, greenerySpace, CardName.SOIL_ENRICHMENT_LAB, 'GREENERY_UPGRADE');

      player1.plants = 7;
      const action = new ConvertPlants();
      // Should be able to act with 7 plants because adjSpace is valid and discounted
      expect(action.canAct(player1)).is.true;
    });
  });

  describe('End-of-game VP scoring', () => {
    it('Astro-University scores 1 VP per own City within distance <= 2', () => {
      const card = new AstroUniversity();
      const center = game.board.spaces.find((s) => s.spaceType === SpaceType.LAND)!;
      addCity(player1, center.id);
      PostludeExpansion.placeUpgrade(player1, center, CardName.ASTRO_UNIVERSITY, 'CITY_UPGRADE');

      // Add 2 other cities within distance 2
      const within2 = PostludeExpansion.getSpacesWithinDistance(game.board, center, 2).filter(
        (s) => s.id !== center.id && s.spaceType === SpaceType.LAND,
      );
      addCity(player1, within2[0].id);
      addCity(player1, within2[1].id);

      // Total 3 own cities within distance 2
      expect(card.getVictoryPoints(player1)).eq(3);
    });

    it('Amusement Park scores 1 VP per adjacent City', () => {
      const card = new AmusementPark();
      const center = game.board.spaces.find((s) => s.spaceType === SpaceType.LAND)!;
      addGreenery(player1, center.id);
      PostludeExpansion.placeUpgrade(player1, center, CardName.AMUSEMENT_PARK, 'GREENERY_UPGRADE');

      const adj = game.board.getAdjacentSpaces(center).filter((s) => s.spaceType === SpaceType.LAND);
      addCity(player1, adj[0].id);
      addCity(player2, adj[1].id);

      expect(card.getVictoryPoints(player1)).eq(2);
    });

    it('Soil Enrichment Lab scores 1 VP per own adjacent Greenery', () => {
      const card = new SoilEnrichmentLab();
      const center = game.board.spaces.find((s) => s.spaceType === SpaceType.LAND)!;
      addGreenery(player1, center.id);
      PostludeExpansion.placeUpgrade(player1, center, CardName.SOIL_ENRICHMENT_LAB, 'GREENERY_UPGRADE');

      const adj = game.board.getAdjacentSpaces(center).filter((s) => s.spaceType === SpaceType.LAND);
      addGreenery(player1, adj[0].id);
      addGreenery(player2, adj[1].id); // Opponent greenery, does not count

      expect(card.getVictoryPoints(player1)).eq(1);
    });

    it('Cultivation Bio-Dome scores 1 VP per adjacent Ocean', () => {
      const card = new CultivationBioDome();
      const oceanSlot = game.board.spaces.find((s) => s.spaceType === SpaceType.OCEAN)!;
      addOcean(player1, oceanSlot.id);
      const center = game.board.getAdjacentSpaces(oceanSlot).find((s) => s.spaceType === SpaceType.LAND)!;

      addGreenery(player1, center.id);
      PostludeExpansion.placeUpgrade(player1, center, CardName.CULTIVATION_BIO_DOME, 'GREENERY_UPGRADE');

      const oceanCount = PostludeExpansion.adjacentOceans(game.board, center);
      expect(card.getVictoryPoints(player1)).eq(oceanCount);
      expect(oceanCount).be.at.least(1);
    });

    it('National Green Park scores 1 VP per adjacent Greenery', () => {
      const card = new NationalGreenPark();
      const center = game.board.spaces.find((s) => s.spaceType === SpaceType.LAND)!;
      addGreenery(player1, center.id);
      PostludeExpansion.placeUpgrade(player1, center, CardName.NATIONAL_GREEN_PARK, 'GREENERY_UPGRADE');
      player1.playedCards.push(card);

      const adj = game.board.getAdjacentSpaces(center).filter((s) => s.spaceType === SpaceType.LAND);
      addGreenery(player1, adj[0].id);
      addGreenery(player2, adj[1].id);

      expect(card.getVictoryPoints(player1)).eq(2);
    });

    it('Probiotics Manufactory scores 1 VP per 2 Probiotics', () => {
      const card = new ProbioticsManufactory();
      card.resourceCount = 5;
      expect(card.getVictoryPoints(player1)).eq(2);
    });
  });

  describe('Card actions and custom resources', () => {
    it('Mining Depot grants 1 Steel per empty adjacent space', () => {
      const card = new MiningDepot();
      const center = game.board.spaces.find((s) => s.spaceType === SpaceType.LAND)!;
      addCity(player1, center.id);
      PostludeExpansion.placeUpgrade(player1, center, CardName.MINING_DEPOT, 'CITY_UPGRADE');
      player1.playedCards.push(card);

      const emptyCount = PostludeExpansion.emptyNeighbors(game.board, center);
      const initialSteel = player1.steel;
      card.action(player1);
      expect(player1.steel).eq(initialSteel + emptyCount);
    });

    it('Mineral Refinery grants 1 Titanium per empty adjacent space', () => {
      const card = new MineralRefinery();
      const center = game.board.spaces.find((s) => s.spaceType === SpaceType.LAND)!;
      addCity(player1, center.id);
      PostludeExpansion.placeUpgrade(player1, center, CardName.MINERAL_REFINERY, 'CITY_UPGRADE');
      player1.playedCards.push(card);

      const emptyCount = PostludeExpansion.emptyNeighbors(game.board, center);
      const initialTitanium = player1.titanium;
      card.action(player1);
      expect(player1.titanium).eq(initialTitanium + emptyCount);
    });

    it('Food Processing Unit spends Space Food to gain MC per own adjacent tile and 1 TR', () => {
      const card = new FoodProcessingUnit();
      const center = game.board.spaces.find((s) => s.spaceType === SpaceType.LAND)!;
      addCity(player1, center.id);
      PostludeExpansion.placeUpgrade(player1, center, CardName.FOOD_PROCESSING_UNIT, 'CITY_UPGRADE');
      player1.playedCards.push(card);

      const adj = game.board.getAdjacentSpaces(center).find((s) => s.spaceType === SpaceType.LAND)!;
      addGreenery(player1, adj.id);

      card.resourceCount = 1;
      const initialMC = player1.megaCredits;
      const initialTR = player1.terraformRating;

      const input = card.action(player1);
      expect(input).is.not.undefined;
      if (input && 'options' in input) {
        const consumeOpt = (input as any).options.find((opt: any) => opt.title.includes('Spend 1 Space Food'));
        consumeOpt?.cb();
      }
      expect(card.resourceCount).eq(0);
      expect(player1.terraformRating).eq(initialTR + 1);
      expect(player1.megaCredits).eq(initialMC + 1 * 4);
    });

    it('Sea Orbiter uses Data resource and Ocean Upgrade placement', () => {
      const card = new SeaOrbiter();
      expect(card.resourceType).eq(CardResource.DATA);
      expect(card.upgradeType).eq('OCEAN_UPGRADE');
    });

    it('The Black Market gains production reduced by sabotage', () => {
      const bmCard = new TheBlackMarket();
      player1.tableau.push(bmCard);

      const center = game.board.spaces.find((s) => s.spaceType === SpaceType.LAND)!;
      addCity(player1, center.id);
      PostludeExpansion.placeUpgrade(player1, center, CardName.THE_BLACK_MARKET, 'CITY_UPGRADE');

      player2.production.add(Resource.ENERGY, 2);
      const initialEnergyProd = player1.production.energy;

      // Sabotage reduces player2 energy production by 1
      const dap = new DecreaseAnyProduction(player1, Resource.ENERGY, {count: 1});
      dap.execute();

      // No adjacent tiles of player1, so player1 gains 1 Energy production
      expect(player1.production.energy).eq(initialEnergyProd + 1);
    });

    it('Ore Refinery places on ocean and adds Ore per Building tag in play', () => {
      const oceanSlot = game.board.spaces.find((s) => s.spaceType === SpaceType.OCEAN)!;
      const ocean = addOcean(player1, oceanSlot.id);

      const card = new OreRefinery();
      player1.tableau.push(card);

      PostludeExpansion.placeUpgrade(player1, ocean, CardName.ORE_REFINERY, 'OCEAN_UPGRADE', [SpaceBonus.ORE]);
      card.onUpgradePlaced(player1, ocean);
      game.deferredActions.runNext();

      // Card has Building tag (+1), so at least 2 Ore are added
      expect(card.resourceCount).gte(2);
    });

    it('Universal Bio-Store allows taking M€ from card', () => {
      const card = new UniversalBioStore();
      player1.tableau.push(card);
      card.resourceCount = 5;

      const initialMC = player1.megaCredits;
      const input = card.action(player1);
      expect(input).is.not.undefined;
      if (input && 'options' in input) {
        const takeOpt = (input as any).options.find((opt: any) => opt.title?.includes('Take'));
        takeOpt?.cb(3);
      }
      expect(card.resourceCount).eq(2);
      expect(player1.megaCredits).eq(initialMC + 3);
    });

    it('Flight Academy allows transferring resources between non-Postlude cards only', () => {
      const card = new FlightAcademy();
      const center = game.board.spaces.find((s) => s.spaceType === SpaceType.LAND)!;
      addCity(player1, center.id);
      PostludeExpansion.placeUpgrade(player1, center, CardName.FLIGHT_ACADEMY, 'CITY_UPGRADE');
      player1.playedCards.push(card);

      const adj = game.board.getAdjacentSpaces(center).find((s) => s.spaceType === SpaceType.LAND)!;
      addGreenery(player1, adj.id);

      // Cannot transfer between/from Postlude cards (e.g. FoodProcessingUnit)
      const foodUnit = new FoodProcessingUnit();
      foodUnit.resourceCount = 3;
      player1.tableau.push(foodUnit);

      expect(card.canAct(player1)).is.false;
    });
  });

  describe('Robotic Workforce and Cyberia Systems compatibility', () => {
    it('Robotic Workforce copies Deep Sea Mining Rig steel production', () => {
      const oceanSlot = game.board.spaces.find((s) => s.spaceType === SpaceType.OCEAN)!;
      addOcean(player1, oceanSlot.id);

      const rig = new DeepSeaMiningRig();
      player1.playCard(rig);
      const selectSpace = (game.deferredActions.runNext() ?? player1.popWaitingFor()) as any;
      selectSpace.cb(selectSpace.spaces[0]);

      expect(player1.production.steel).eq(2);

      const rw = new RoboticWorkforce();
      player1.cardsInHand.push(rw);
      expect(rw.canPlay(player1)).is.true;
      player1.playCard(rw);

      // Resolve robotic workforce prompt
      const selectCard = (game.deferredActions.runNext() ?? player1.popWaitingFor()) as any;
      expect(selectCard).is.not.undefined;
      selectCard.cb([rig]);

      // Steel production increased by another 2 steps to 4
      expect(player1.production.steel).eq(4);
    });

    it('Cyberia Systems copies Deep Sea Mining Rig steel production and Power Plant energy production', () => {
      const oceanSlots = game.board.spaces.filter((s) => s.spaceType === SpaceType.OCEAN);
      addOcean(player1, oceanSlots[0].id);

      const rig = new DeepSeaMiningRig();
      player1.playCard(rig);
      const selectRigSpace = (game.deferredActions.runNext() ?? player1.popWaitingFor()) as any;
      selectRigSpace.cb(selectRigSpace.spaces[0]);

      const powerPlant = new PowerPlant();
      player1.playCard(powerPlant);

      expect(player1.production.steel).eq(2);
      expect(player1.production.energy).eq(1);

      const cyberia = new CyberiaSystems();
      player1.cardsInHand.push(cyberia);
      expect(cyberia.canPlay(player1)).is.true;
      player1.playCard(cyberia);

      // Cyberia adds 1 steel prod
      expect(player1.production.steel).eq(3);

      const firstSelect = (game.deferredActions.runNext() ?? player1.popWaitingFor()) as any;
      expect(firstSelect).is.not.undefined;
      firstSelect.cb([rig]);
      expect(player1.production.steel).eq(5); // +2 steel from rig

      const secondSelect = (game.deferredActions.runNext() ?? player1.popWaitingFor()) as any;
      expect(secondSelect).is.not.undefined;
      secondSelect.cb([powerPlant]);
      expect(player1.production.energy).eq(2); // +1 energy from power plant
    });
  });

  describe('Deck inclusion', () => {
    it('Postlude cards are included in project deck when postludeExpansion is enabled', () => {
      const allCardsInDeck = game.projectDeck.drawPile.map((c) => c.name);
      expect(allCardsInDeck).to.include(CardName.DELUXE_WATERFRONT_RESORT);
      expect(allCardsInDeck).to.include(CardName.ASTRO_UNIVERSITY);
      expect(allCardsInDeck).to.include(CardName.AMUSEMENT_PARK);
      expect(allCardsInDeck).to.include(CardName.DEEP_SEA_MINING_RIG);
      expect(allCardsInDeck).to.include(CardName.THE_BLACK_MARKET);
      expect(allCardsInDeck).to.include(CardName.SEA_ORBITER);
      expect(allCardsInDeck).to.include(CardName.WATER_RECYCLE_COMPLEX);
    });

    it('Postlude cards are included when enabled via expansions.postlude', () => {
      const [postludeGame] = testGame(2, {expansions: {postlude: true} as any});
      const allCardsInDeck = postludeGame.projectDeck.drawPile.map((c) => c.name);
      expect(allCardsInDeck).to.include(CardName.DELUXE_WATERFRONT_RESORT);
      expect(allCardsInDeck).to.include(CardName.AMUSEMENT_PARK);
      expect(allCardsInDeck).to.include(CardName.DEEP_SEA_MINING_RIG);
    });

    it('Postlude cards are NOT included when expansion is disabled', () => {
      const [baseGame] = testGame(2, {postludeExpansion: false});
      const allCardsInDeck = baseGame.projectDeck.drawPile.map((c) => c.name);
      expect(allCardsInDeck).to.not.include(CardName.DELUXE_WATERFRONT_RESORT);
      expect(allCardsInDeck).to.not.include(CardName.AMUSEMENT_PARK);
      expect(allCardsInDeck).to.not.include(CardName.DEEP_SEA_MINING_RIG);
    });
  });

  describe('Machinery Factory and Metallurgy Workshop payment and placement rules', () => {
    it('Machinery Factory enables steel only when adjacent free spaces exist for standard project', () => {
      const greenerySP = new GreeneryStandardProject();
      const citySpace = game.board.spaces.find((s) => s.spaceType === SpaceType.LAND)!;
      addCity(player1, citySpace.id);

      // Before Machinery Factory
      expect(greenerySP.canPayWith(player1).steel).to.be.undefined;

      // Play Machinery Factory
      PostludeExpansion.placeUpgrade(player1, citySpace, CardName.MACHINERY_FACTORY, 'CITY_UPGRADE');
      player1.playedCards.push(new MachineryFactory());

      // With adjacent free spaces
      expect(greenerySP.canPayWith(player1).steel).to.be.true;

      // Fill all adjacent spaces
      const adjSpaces = game.board.getAdjacentSpaces(citySpace);
      for (const adj of adjSpaces) {
        addGreenery(player2, adj.id);
      }

      // Now no adjacent free spaces
      expect(greenerySP.canPayWith(player1).steel).to.be.undefined;
    });

    it('Metallurgy Workshop enables titanium only when adjacent free spaces exist', () => {
      const greenerySP = new GreeneryStandardProject();
      const citySpace = game.board.spaces.find((s) => s.spaceType === SpaceType.LAND)!;
      addCity(player1, citySpace.id);

      PostludeExpansion.placeUpgrade(player1, citySpace, CardName.METALLURGY_WORKSHOP, 'CITY_UPGRADE');
      player1.playedCards.push(new MetallurgyWorkshop());

      expect(greenerySP.canPayWith(player1).titanium).to.be.true;

      const adjSpaces = game.board.getAdjacentSpaces(citySpace);
      for (const adj of adjSpaces) {
        addGreenery(player2, adj.id);
      }

      expect(greenerySP.canPayWith(player1).titanium).to.be.undefined;
    });

    it('Paying with steel restricts standard project greenery placement to spaces adjacent to Machinery Factory', () => {
      const citySpace = game.board.spaces.find(
        (s) => s.spaceType === SpaceType.LAND && game.board.getAdjacentSpaces(s).length === 6,
      )!;
      addCity(player1, citySpace.id);

      PostludeExpansion.placeUpgrade(player1, citySpace, CardName.MACHINERY_FACTORY, 'CITY_UPGRADE');
      player1.playedCards.push(new MachineryFactory());

      player1.steel = 10;
      player1.megaCredits = 50;

      const spOption = player1.getStandardProjectOption();
      // Greenery SP cost is 23: pay with 5 steel (10 MC) and 13 MC
      spOption.process({
        type: 'projectCard',
        card: CardName.GREENERY_STANDARD_PROJECT,
        payment: {megacredits: 13, steel: 5, titanium: 0, heat: 0, plants: 0, microbes: 0, floaters: 0, lunaArchivesScience: 0, seeds: 0, graphene: 0, kuiperAsteroids: 0, auroraiData: 0, spireScience: 0},
      });

      const selectSpaceAction = (game.deferredActions.runNext() ?? player1.popWaitingFor()) as SelectSpace;
      expect(selectSpaceAction).to.be.instanceOf(SelectSpace);

      const mfAdjacentIds = new Set(game.board.getAdjacentSpaces(citySpace).map((s) => s.id));
      for (const space of selectSpaceAction.spaces) {
        expect(mfAdjacentIds.has(space.id)).to.be.true;
      }
      expect(String(selectSpaceAction.title)).to.include('Machinery Factory');
    });

    it('Paying with only M€ does NOT constrain standard project greenery placement', () => {
      const citySpace = game.board.spaces.find(
        (s) => s.spaceType === SpaceType.LAND && game.board.getAdjacentSpaces(s).length === 6,
      )!;
      addCity(player1, citySpace.id);

      PostludeExpansion.placeUpgrade(player1, citySpace, CardName.MACHINERY_FACTORY, 'CITY_UPGRADE');
      player1.playedCards.push(new MachineryFactory());

      player1.steel = 10;
      player1.megaCredits = 50;

      const spOption = player1.getStandardProjectOption();
      // Pay with 23 MC, 0 steel
      spOption.process({
        type: 'projectCard',
        card: CardName.GREENERY_STANDARD_PROJECT,
        payment: {megacredits: 23, steel: 0, titanium: 0, heat: 0, plants: 0, microbes: 0, floaters: 0, lunaArchivesScience: 0, seeds: 0, graphene: 0, kuiperAsteroids: 0, auroraiData: 0, spireScience: 0},
      });

      const selectSpaceAction = (game.deferredActions.runNext() ?? player1.popWaitingFor()) as SelectSpace;
      expect(selectSpaceAction).to.be.instanceOf(SelectSpace);

      const allGreenerySpaces = game.board.getAvailableSpacesForGreenery(player1);
      expect(selectSpaceAction.spaces.length).to.eq(allGreenerySpaces.length);
    });

    it('When MF and MW share adjacent space, paying with both steel and titanium is allowed and restricted to intersection', () => {
      // Find two land spaces adjacent to each other with common neighbors
      const space1 = game.board.spaces.find(
        (s) => s.spaceType === SpaceType.LAND && game.board.getAdjacentSpaces(s).some((adj) => adj.spaceType === SpaceType.LAND),
      )!;
      const space2 = game.board.getAdjacentSpaces(space1).find((s) => s.spaceType === SpaceType.LAND)!;

      addCity(player1, space1.id);
      addCity(player1, space2.id);

      PostludeExpansion.placeUpgrade(player1, space1, CardName.MACHINERY_FACTORY, 'CITY_UPGRADE');
      player1.playedCards.push(new MachineryFactory());

      PostludeExpansion.placeUpgrade(player1, space2, CardName.METALLURGY_WORKSHOP, 'CITY_UPGRADE');
      player1.playedCards.push(new MetallurgyWorkshop());

      // Shared adjacent spaces
      const adj1 = game.board.getAdjacentSpaces(space1).map((s) => s.id);
      const adj2 = game.board.getAdjacentSpaces(space2).map((s) => s.id);
      const shared = adj1.filter((id) => adj2.includes(id));
      expect(shared.length).to.be.greaterThan(0);

      const greenerySP = new GreeneryStandardProject();
      const options = PostludeExpansion.getPostludePaymentOptions(player1, greenerySP);
      expect(options?.steel).to.be.true;
      expect(options?.titanium).to.be.true;
      expect(options?.exclusiveSteelTitanium).to.be.undefined;
      expect(options?.commonSpaces?.length).to.be.greaterThan(0);

      player1.steel = 5;
      player1.titanium = 3;
      player1.megaCredits = 30;

      const spOption = player1.getStandardProjectOption();
      // Greenery SP cost is 23: Pay with 2 steel (4 MC) + 3 titanium (9 MC) + 10 MC = 23 MC
      spOption.process({
        type: 'projectCard',
        card: CardName.GREENERY_STANDARD_PROJECT,
        payment: {megacredits: 10, steel: 2, titanium: 3, heat: 0, plants: 0, microbes: 0, floaters: 0, lunaArchivesScience: 0, seeds: 0, graphene: 0, kuiperAsteroids: 0, auroraiData: 0, spireScience: 0},
      });

      const selectSpaceAction = (game.deferredActions.runNext() ?? player1.popWaitingFor()) as SelectSpace;
      expect(selectSpaceAction).to.be.instanceOf(SelectSpace);
      expect(selectSpaceAction.spaces.length).to.eq(options!.commonSpaces!.length);
      for (const space of selectSpaceAction.spaces) {
        expect(shared).to.include(space.id);
      }
      expect(String(selectSpaceAction.title)).to.include('Machinery Factory & Metallurgy Workshop');
    });

    it('When MF and MW have NO shared space, paying with both steel and titanium throws error', () => {
      // Find two distant land spaces
      const space1 = game.board.spaces.find((s) => s.y === 0 && s.spaceType === SpaceType.LAND)!;
      const space2 = game.board.spaces.find((s) => s.y === 8 && s.spaceType === SpaceType.LAND)!;

      addCity(player1, space1.id);
      addCity(player1, space2.id);

      PostludeExpansion.placeUpgrade(player1, space1, CardName.MACHINERY_FACTORY, 'CITY_UPGRADE');
      player1.playedCards.push(new MachineryFactory());

      PostludeExpansion.placeUpgrade(player1, space2, CardName.METALLURGY_WORKSHOP, 'CITY_UPGRADE');
      player1.playedCards.push(new MetallurgyWorkshop());

      const greenerySP = new GreeneryStandardProject();
      const options = PostludeExpansion.getPostludePaymentOptions(player1, greenerySP);
      expect(options?.steel).to.be.true;
      expect(options?.titanium).to.be.true;
      expect(options?.exclusiveSteelTitanium).to.be.true;

      player1.steel = 5;
      player1.titanium = 3;
      player1.megaCredits = 30;

      const spOption = player1.getStandardProjectOption();
      expect(() => {
        spOption.process({
          type: 'projectCard',
          card: CardName.GREENERY_STANDARD_PROJECT,
          payment: {megacredits: 10, steel: 2, titanium: 3, heat: 0, plants: 0, microbes: 0, floaters: 0, lunaArchivesScience: 0, seeds: 0, graphene: 0, kuiperAsteroids: 0, auroraiData: 0, spireScience: 0},
        });
      }).to.throw(/Cannot pay with both Steel and Titanium/);
    });

    it('Project cards placing tiles allow Machinery Factory steel payment and restrict placement', () => {
      const citySpace = game.board.spaces.find(
        (s) => s.spaceType === SpaceType.LAND && game.board.getAdjacentSpaces(s).length === 6,
      )!;
      addCity(player1, citySpace.id);

      PostludeExpansion.placeUpgrade(player1, citySpace, CardName.MACHINERY_FACTORY, 'CITY_UPGRADE');
      player1.playedCards.push(new MachineryFactory());

      const card = new Plantation(); // cost 15, has Tag.PLANT only
      player1.cardsInHand.push(card);
      player1.tagsForTest = {[Tag.SCIENCE]: 2}; // meet requirements
      player1.steel = 5;
      player1.megaCredits = 20;

      const options = PostludeExpansion.getPostludePaymentOptions(player1, card);
      expect(options?.steel).to.be.true;
      expect(options?.steelSpaces?.length).to.be.greaterThan(0);

      // Pay with 5 steel (10 MC) + 5 MC = 15 MC
      player1.checkPaymentAndPlayCard(card, {
        megacredits: 5,
        steel: 5,
        titanium: 0,
        heat: 0,
        plants: 0,
        microbes: 0,
        floaters: 0,
        lunaArchivesScience: 0,
        seeds: 0,
        graphene: 0,
        kuiperAsteroids: 0,
        auroraiData: 0,
        spireScience: 0,
      });

      const selectSpaceAction = (game.deferredActions.runNext() ?? player1.popWaitingFor()) as SelectSpace;
      expect(selectSpaceAction).to.be.instanceOf(SelectSpace);
      const mfAdjacentIds = new Set(game.board.getAdjacentSpaces(citySpace).map((s) => s.id));
      for (const space of selectSpaceAction.spaces) {
        expect(mfAdjacentIds.has(space.id)).to.be.true;
      }
      expect(String(selectSpaceAction.title)).to.include('Machinery Factory');
    });
  });
});

