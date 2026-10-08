import {Board} from '../boards/Board';
import {Space} from '../boards/Space';
import {IPlayer} from '../IPlayer';
import {IGame} from '../IGame';
import {CardName} from '../../common/cards/CardName';
import {UpgradeType} from '../../common/postlude/PostludeTypes';
import {SpaceBonus} from '../../common/boards/SpaceBonus';
import {SpaceId} from '../../common/Types';
import {ICard} from '../cards/ICard';
import {IStandardProjectCard} from '../cards/IStandardProjectCard';
import {Message} from '../../common/logs/Message';

export interface UpgradePaymentOptions {
  steel?: boolean;
  titanium?: boolean;
  steelSpaces?: ReadonlyArray<Space>;
  titaniumSpaces?: ReadonlyArray<Space>;
  commonSpaces?: ReadonlyArray<Space>;
  exclusiveSteelTitanium?: boolean;
}

export class PostludeExpansion {
  public static isPolar(board: Board, space: Space): boolean {
    const mainBoardSpaces = board.spaces.filter((s) => s.y >= 0);
    const yValues = mainBoardSpaces.map((s) => s.y);
    const minY = Math.min(...yValues);
    const maxY = Math.max(...yValues);
    return space.y === minY || space.y === maxY;
  }

  public static isEquatorial(board: Board, space: Space): boolean {
    const mainBoardSpaces = board.spaces.filter((s) => s.y >= 0);
    const yValues = mainBoardSpaces.map((s) => s.y);
    const minY = Math.min(...yValues);
    const maxY = Math.max(...yValues);
    const midY = Math.floor((minY + maxY) / 2);
    return Math.abs(space.y - midY) <= 1;
  }

  public static isPeriphery(board: Board, space: Space): boolean {
    return board.getAdjacentSpaces(space).length < 6;
  }

  public static occupiedNeighbors(board: Board, space: Space): number {
    return board.getAdjacentSpaces(space).filter((s) => s.tile !== undefined).length;
  }

  public static emptyNeighbors(board: Board, space: Space): number {
    return board.getAdjacentSpaces(space).filter((s) => s.tile === undefined).length;
  }

  public static adjacentCities(board: Board, space: Space): number {
    return board.getAdjacentSpaces(space).filter(Board.isCitySpace).length;
  }

  public static adjacentOceans(board: Board, space: Space): number {
    return board.getAdjacentSpaces(space).filter(Board.isOceanSpace).length;
  }

  public static adjacentSpecial(board: Board, space: Space): boolean {
    return board.getAdjacentSpaces(space).some(
      (s) => s.tile !== undefined && !Board.isCitySpace(s) && !Board.isGreenerySpace(s) && !Board.isOceanSpace(s),
    );
  }

  public static adjacentGreeneries(board: Board, space: Space): number {
    return board.getAdjacentSpaces(space).filter(Board.isGreenerySpace).length;
  }

  public static ownAdjacentGreeneries(board: Board, space: Space, player: IPlayer): number {
    return board.getAdjacentSpaces(space).filter((s) => s.player === player && Board.isGreenerySpace(s)).length;
  }

  public static ownAdjacentTiles(board: Board, space: Space, player: IPlayer): number {
    return board.getAdjacentSpaces(space).filter((s) => s.player === player && s.tile !== undefined).length;
  }

  public static getSpacesWithinDistance(board: Board, center: Space, maxDistance: number): Array<Space> {
    const visited = new Set<SpaceId>([center.id]);
    let currentLayer = [center];
    for (let dist = 1; dist <= maxDistance; dist++) {
      const nextLayer: Array<Space> = [];
      for (const space of currentLayer) {
        for (const adj of board.getAdjacentSpaces(space)) {
          if (!visited.has(adj.id)) {
            visited.add(adj.id);
            nextLayer.push(adj);
          }
        }
      }
      currentLayer = nextLayer;
    }
    return board.spaces.filter((s) => visited.has(s.id));
  }

  public static canPlaceUpgrade(board: Board, space: Space, cardName: CardName, player: IPlayer): boolean {
    if (space.upgradeTile !== undefined) {
      return false;
    }

    switch (cardName) {
    // City Upgrades
    case CardName.DELUXE_WATERFRONT_RESORT:
      return space.player === player && Board.isCitySpace(space) && board.getAdjacentSpaces(space).some(Board.isOceanSpace);
    case CardName.ASTRO_UNIVERSITY:
    case CardName.CITY_PROJECT_LIBRARY:
    case CardName.FLIGHT_ACADEMY:
    case CardName.FOOD_PROCESSING_UNIT:
    case CardName.INSURANCE_HQ:
    case CardName.MACHINERY_FACTORY:
    case CardName.METALLURGY_WORKSHOP:
    case CardName.THE_BLACK_MARKET:
      return space.player === player && Board.isCitySpace(space);
    case CardName.MARS_CASINO:
      return space.player === player && Board.isCitySpace(space) && this.isPolar(board, space);
    case CardName.MARS_HOSPITAL:
    case CardName.NANO_PARTICLE_SYNTHESIZER:
    case CardName.PHARMACEUTICAL_CO:
      return space.player === player && Board.isCitySpace(space) && this.occupiedNeighbors(board, space) <= 2;
    case CardName.MINERAL_REFINERY:
    case CardName.MINING_DEPOT:
    case CardName.SCIENCE_INSTITUTE:
      return space.player === player && Board.isCitySpace(space) && this.occupiedNeighbors(board, space) >= 2;
    case CardName.POWER_CONVERTER:
      return space.player === player && Board.isCitySpace(space) && this.isEquatorial(board, space);
    case CardName.RE_DEVELOPMENT_OFFICE:
      return space.player === player && Board.isCitySpace(space) && this.adjacentSpecial(board, space);

    // Greenery Upgrades
    case CardName.AMUSEMENT_PARK:
    case CardName.SOIL_ENRICHMENT_LAB:
      return space.player === player && Board.isGreenerySpace(space) && board.getAdjacentSpaces(space).some(Board.isCitySpace);
    case CardName.ANIMAL_FARM:
    case CardName.PHOTOBIONIC_POWER_STATION:
      return space.player === player && Board.isGreenerySpace(space) && this.adjacentCities(board, space) >= 2;
    case CardName.CULTIVATION_BIO_DOME:
    case CardName.PROBIOTICS_MANUFACTORY:
      return space.player === player && Board.isGreenerySpace(space) && board.getAdjacentSpaces(space).some(Board.isOceanSpace);
    case CardName.UNIVERSAL_BIO_STORE:
      return space.player === player && Board.isGreenerySpace(space);
    case CardName.WASTE_PROCESSING_CENTRE:
      return space.player === player && Board.isGreenerySpace(space) && this.isPeriphery(board, space);
    case CardName.NATIONAL_GREEN_PARK:
      return space.player === player && Board.isGreenerySpace(space) && !board.getAdjacentSpaces(space).some(Board.isOceanSpace);

    // Ocean Upgrades (all 15)
    case CardName.AQUATIC_LIFE_LABORATORY:
    case CardName.CLOUD_GENERATOR:
    case CardName.DEEP_SEA_MINING_RIG:
    case CardName.FLOATING_METROPOLIS:
    case CardName.HYDRAULIC_POWER_PLANT:
    case CardName.MARINE_AQUARIUM:
    case CardName.MOBILE_LAUNCH_STATION:
    case CardName.OCEAN_GREEN_FARM:
    case CardName.ORE_REFINERY:
    case CardName.RESEARCH_WATCHTOWER:
    case CardName.SEA_ORBITER:
    case CardName.SKY_ELEVATOR:
    case CardName.SPORT_DIVING_SCHOOL:
    case CardName.UNDERWATER_RESORT:
    case CardName.WATER_RECYCLE_COMPLEX:
      return Board.isOceanSpace(space);

    default:
      return false;
    }
  }

  public static getAvailableSpaces(player: IPlayer, cardName: CardName): Array<Space> {
    return player.game.board.spaces.filter((space) => this.canPlaceUpgrade(player.game.board, space, cardName, player));
  }

  public static placeUpgrade(
    player: IPlayer,
    space: Space,
    cardName: CardName,
    upgradeType: UpgradeType,
    additionalPlacementBonus?: Array<SpaceBonus>,
  ): void {
    space.upgradeTile = {
      cardId: cardName,
      upgradeType,
      owner: player,
      additionalPlacementBonus,
    };
    player.game.log('${0} placed upgrade ${1} on space ${2}', (b) =>
      b.player(player).cardName(cardName).space(space),
    );
  }

  public static getSpaceForUpgrade(game: IGame, cardName: CardName): Space | undefined {
    return game.board.spaces.find((s) => s.upgradeTile?.cardId === cardName);
  }

  public static getCardTilePlacementSpaces(player: IPlayer, card: ICard | IStandardProjectCard): ReadonlyArray<Space> | undefined {
    const board = player.game.board;

    // Standard projects
    if (card.name === CardName.CITY_STANDARD_PROJECT) {
      return board.getAvailableSpacesForCity(player);
    }
    if (card.name === CardName.GREENERY_STANDARD_PROJECT) {
      return board.getAvailableSpacesForGreenery(player);
    }
    if (card.name === CardName.AQUIFER_STANDARD_PROJECT) {
      return board.getAvailableSpacesForOcean(player);
    }

    // Card behavior
    const anyCard = card as any;
    const behavior = anyCard.behavior;
    if (behavior !== undefined) {
      if (behavior.city !== undefined) {
        const citySpace = behavior.city.space;
        if (citySpace) {
          const s = board.spaces.find((space) => space.id === citySpace);
          return s ? [s] : [];
        }
        if (behavior.city.on) {
          return board.getAvailableSpacesForType(player, behavior.city.on);
        }
        return board.getAvailableSpacesForCity(player);
      }
      if (behavior.greenery !== undefined) {
        if (behavior.greenery.on) {
          return board.getAvailableSpacesForType(player, behavior.greenery.on);
        }
        return board.getAvailableSpacesForGreenery(player);
      }
      if (behavior.ocean !== undefined) {
        if (behavior.ocean.on) {
          return board.getAvailableSpacesForType(player, behavior.ocean.on);
        }
        return board.getAvailableSpacesForOcean(player);
      }
      if (behavior.tile !== undefined) {
        if (typeof behavior.tile.on === 'string') {
          return board.getAvailableSpacesForType(player, behavior.tile.on);
        } else if (typeof behavior.tile.on === 'function') {
          return (behavior.tile.on as () => ReadonlyArray<Space>)();
        }
        return board.getAvailableSpacesOnLand(player);
      }
    }

    if (typeof anyCard.getAvailableSpaces === 'function') {
      return anyCard.getAvailableSpaces(player);
    }
    if (typeof anyCard.availableSpaces === 'function') {
      return anyCard.availableSpaces(player);
    }
    if (typeof anyCard.eligibleSpaces === 'function') {
      return anyCard.eligibleSpaces(player);
    }

    switch (card.name) {
    case CardName.IMMIGRANT_CITY:
    case CardName.MIND_SET_MARS:
    case CardName.DEEP_FOUNDATIONS:
    case CardName.SPECIALIZED_SETTLEMENT:
    case CardName.BOOM_TOWN:
    case CardName.CAVE_CITY:
    case CardName.GAIA_CITY:
    case CardName.STAR_VEGAS:
    case CardName.UNDERGROUND_SETTLEMENT:
      return board.getAvailableSpacesForCity(player);
    case CardName.NOCTIS_CITY: {
      const noctisCitySpaceId = board.noctisCitySpaceId;
      if (noctisCitySpaceId !== undefined) {
        const noctis = board.spaces.find((s) => s.id === noctisCitySpaceId);
        return noctis && noctis.tile === undefined ? [noctis] : board.getAvailableSpacesForCity(player);
      }
      return board.getAvailableSpacesForCity(player);
    }
    case CardName.URBANIZED_AREA:
      return board.getAvailableSpacesOnLand(player)
        .filter((space) => board.getAdjacentSpaces(space).filter(Board.isCitySpace).length >= 2);
    case CardName.FLOODING:
    case CardName.SECRET_LABS:
    case CardName.ARTESIAN_AQUIFER:
    case CardName.SUBTERRANEAN_SEA:
    case CardName.CENTRAL_RESERVOIR:
    case CardName.POLDERTECH_DUTCH:
      return board.getAvailableSpacesForOcean(player);
    case CardName.GUERILLA_ECOLOGISTS:
      return board.getAvailableSpacesForGreenery(player);
    case CardName.CRASHLANDING:
    case CardName.WETLANDS:
    case CardName.SOLAR_FARM:
    case CardName.ECOLOGICAL_ZONE:
    case CardName.INDUSTRIAL_CENTER:
    case CardName.RED_CITY:
    case CardName.GREAT_DAM_PROMO:
    case CardName.MAN_MADE_VOLCANO:
      return board.getAvailableSpacesOnLand(player);
    default:
      return undefined;
    }
  }

  public static getPostludePaymentOptions(player: IPlayer, card: ICard | IStandardProjectCard): UpgradePaymentOptions | undefined {
    const spaces = this.getCardTilePlacementSpaces(player, card);
    if (spaces === undefined) {
      return undefined;
    }

    const res: UpgradePaymentOptions = {};
    const board = player.game.board;

    const hasMF = player.tableau.has(CardName.MACHINERY_FACTORY);
    const mfSpace = hasMF ? this.getSpaceForUpgrade(player.game, CardName.MACHINERY_FACTORY) : undefined;
    if (mfSpace !== undefined) {
      const mfAdj = board.getAdjacentSpaces(mfSpace);
      const validMF = spaces.filter((s) => mfAdj.some((adj) => adj.id === s.id));
      if (validMF.length > 0) {
        res.steel = true;
        res.steelSpaces = validMF;
      }
    }

    const hasMW = player.tableau.has(CardName.METALLURGY_WORKSHOP);
    const mwSpace = hasMW ? this.getSpaceForUpgrade(player.game, CardName.METALLURGY_WORKSHOP) : undefined;
    if (mwSpace !== undefined) {
      const mwAdj = board.getAdjacentSpaces(mwSpace);
      const validMW = spaces.filter((s) => mwAdj.some((adj) => adj.id === s.id));
      if (validMW.length > 0) {
        res.titanium = true;
        res.titaniumSpaces = validMW;
      }
    }

    if (res.steel && res.titanium && res.steelSpaces && res.titaniumSpaces) {
      const common = res.steelSpaces.filter((s) => res.titaniumSpaces!.some((t) => t.id === s.id));
      res.commonSpaces = common;
      if (common.length === 0) {
        res.exclusiveSteelTitanium = true;
      }
    }

    if (!res.steel && !res.titanium) {
      return undefined;
    }

    return res;
  }

  public static applyPlacementConstraint(
    player: IPlayer,
    spaces: ReadonlyArray<Space>,
    title?: string | Message,
  ): {spaces: ReadonlyArray<Space>, title: string | Message} {
    if (player.postludePlacementConstraint === undefined) {
      return {spaces, title: title ?? 'Select space for tile'};
    }
    const constraint = player.postludePlacementConstraint;
    player.postludePlacementConstraint = undefined;
    const filtered = spaces.filter((s) => constraint.spaces.some((c) => c.id === s.id));
    const label = constraint.label;
    let newTitle: string | Message;
    if (typeof title === 'string') {
      newTitle = `${title} (adjacent to ${label})`;
    } else if (title !== undefined) {
      newTitle = {
        message: `${title.message} (adjacent to ${label})`,
        data: title.data,
      };
    } else {
      newTitle = `Select space adjacent to ${label}`;
    }
    return {spaces: filtered, title: newTitle};
  }
}
