import {PostludeCard} from './PostludeCard';
import {CardType} from '../../../common/cards/CardType';
import {CardName} from '../../../common/cards/CardName';
import {Tag} from '../../../common/cards/Tag';
import {IPlayer} from '../../IPlayer';
import {CardRenderer} from '../render/CardRenderer';
import {PostludeExpansion} from '../../postlude/PostludeExpansion';
import {Board} from '../../boards/Board';
import {SelectCard} from '../../inputs/SelectCard';
import {CardResource} from '../../../common/CardResource';
import {OrOptions} from '../../inputs/OrOptions';
import {SelectOption} from '../../inputs/SelectOption';
import {SelectAmount} from '../../inputs/SelectAmount';
import {ALL_RESOURCES} from '../../../common/Resource';
import {IActionCard, ICard} from '../ICard';
import {IProjectCard} from '../IProjectCard';
import {PlayerInput} from '../../PlayerInput';
import {cities} from '../render/DynamicVictoryPoints';

export class DeluxeWaterfrontResort extends PostludeCard implements IActionCard {
  constructor() {
    super({
      name: CardName.DELUXE_WATERFRONT_RESORT,
      type: CardType.ACTIVE,
      tags: [Tag.EARTH, Tag.BUILDING],
      cost: 7,
      upgradeType: 'CITY_UPGRADE',
      metadata: {
        cardNumber: 'PL01',
        description: 'Place the Resort on your City by an Ocean tile.',
        renderData: CardRenderer.builder((b) => {
          b.action('Gain 3 M€ per adjacent Ocean tile.', (eb) => {
            eb.empty().startAction.megacredits(3).slash().oceanTile();
          }).br;
          b.postludeUpgrade(CardName.DELUXE_WATERFRONT_RESORT).colon().cityUpgrade().asterix();
        }),
      },
    });
  }

  public canAct(player: IPlayer): boolean {
    const space = this.getSpace(player);
    return space !== undefined && PostludeExpansion.adjacentOceans(player.game.board, space) > 0;
  }

  public action(player: IPlayer): PlayerInput | undefined {
    const space = this.getSpace(player);
    if (space === undefined) {
      return undefined;
    }
    const count = PostludeExpansion.adjacentOceans(player.game.board, space);
    player.megaCredits += count * 3;
    player.game.log('${0} gained ${1} M€ with ${2}', (b) =>
      b.player(player).number(count * 3).card(this),
    );
    return undefined;
  }
}

export class AstroUniversity extends PostludeCard {
  constructor() {
    super({
      name: CardName.ASTRO_UNIVERSITY,
      type: CardType.ACTIVE,
      tags: [Tag.EARTH],
      cost: 10,
      upgradeType: 'CITY_UPGRADE',
      victoryPoints: 'special',
      metadata: {
        cardNumber: 'PL02',
        description: 'Place the University on your City.',
        renderData: CardRenderer.builder((b) => {
          b.postludeTile(CardName.ASTRO_UNIVERSITY).colon().cityUpgrade().br;
          b.vpText('1 VP per City of yours within 2 hexes.');
        }),
        victoryPoints: cities(1, 1, true, true),
      },
    });
  }

  public override getVictoryPoints(player: IPlayer): number {
    const space = this.getSpace(player);
    if (space === undefined) {
      return 0;
    }
    const spaces = PostludeExpansion.getSpacesWithinDistance(player.game.board, space, 2);
    return spaces.filter((s) => s.player === player && Board.isCitySpace(s)).length;
  }
}

export class CityProjectLibrary extends PostludeCard implements IActionCard {
  constructor() {
    super({
      name: CardName.CITY_PROJECT_LIBRARY,
      type: CardType.ACTIVE,
      tags: [Tag.EARTH, Tag.BUILDING],
      cost: 7,
      upgradeType: 'CITY_UPGRADE',
      metadata: {
        cardNumber: 'PL03',
        description: 'Place the Library on your City.',
        renderData: CardRenderer.builder((b) => {
          b.action('Replay a played Event with 1 M€ discount per own adjacent tile, then remove it.', (eb) => {
            eb.empty().startAction.tag(Tag.EVENT).colon().minus().megacredits(1).slash().emptyTile();
          }).br;
          b.postludeTile(CardName.CITY_PROJECT_LIBRARY).colon().cityUpgrade();
        }),
      },
    });
  }

  public canAct(player: IPlayer): boolean {
    const events = player.playedCards.filter((c) => c.type === CardType.EVENT);
    if (events.length === 0) {
      return false;
    }
    const space = this.getSpace(player);
    const discount = space ? PostludeExpansion.ownAdjacentTiles(player.game.board, space, player) : 0;
    return events.some((c) => player.canAfford(Math.max(0, (c.cost ?? 0) - discount)));
  }

  public action(player: IPlayer): PlayerInput | undefined {
    const space = this.getSpace(player);
    const discount = space ? PostludeExpansion.ownAdjacentTiles(player.game.board, space, player) : 0;
    const events = player.playedCards.filter(
      (c) => c.type === CardType.EVENT && player.canAfford(Math.max(0, (c.cost ?? 0) - discount)),
    );
    if (events.length === 0) {
      return undefined;
    }

    return new SelectCard<IProjectCard>('Select played event to replay', 'Replay', events as Array<IProjectCard>).andThen(([card]) => {
      const cost = Math.max(0, (card.cost ?? 0) - discount);
      if (cost > 0) {
        player.megaCredits -= cost;
      }
      player.playedCards.remove(card);
      player.game.log('${0} replayed event ${1} with ${2} M€ discount via ${3}', (b) =>
        b.player(player).card(card).number(discount).card(this),
      );
      player.playCard(card, undefined, 'nothing');
      player.removedFromPlayCards.push(card);
      return undefined;
    });
  }
}

export class FlightAcademy extends PostludeCard implements IActionCard {
  constructor() {
    super({
      name: CardName.FLIGHT_ACADEMY,
      type: CardType.ACTIVE,
      tags: [Tag.SPACE, Tag.JOVIAN],
      cost: 10,
      upgradeType: 'CITY_UPGRADE',
      metadata: {
        cardNumber: 'PL04',
        description: 'Place the Academy on your City.',
        renderData: CardRenderer.builder((b) => {
          b.action('Move up to 1 resource per own adjacent tile between two of your cards of the same type.', (eb) => {
            eb.empty().startAction.cards(1).arrow().cards(1).slash().emptyTile();
          }).br;
          b.postludeTile(CardName.FLIGHT_ACADEMY).colon().cityUpgrade();
        }),
      },
    });
  }

  public canAct(player: IPlayer): boolean {
    const space = this.getSpace(player);
    if (space === undefined) {
      return false;
    }
    const maxMove = PostludeExpansion.ownAdjacentTiles(player.game.board, space, player);
    if (maxMove <= 0) {
      return false;
    }
    const isEligible = (c: ICard) => c.resourceType !== undefined && !(c instanceof PostludeCard);
    const sourceCards = player.tableau.filter((c) => isEligible(c) && c.resourceCount > 0);
    return sourceCards.some((src) =>
      player.tableau.some((dest) => dest !== src && isEligible(dest) && dest.resourceType === src.resourceType),
    );
  }

  public action(player: IPlayer): PlayerInput | undefined {
    const space = this.getSpace(player);
    if (space === undefined) {
      return undefined;
    }
    const maxMove = PostludeExpansion.ownAdjacentTiles(player.game.board, space, player);
    const isEligible = (c: ICard) => c.resourceType !== undefined && !(c instanceof PostludeCard);
    const sourceCards = player.tableau.filter(
      (src) =>
        isEligible(src) &&
        src.resourceCount > 0 &&
        player.tableau.some((dest) => dest !== src && isEligible(dest) && dest.resourceType === src.resourceType),
    );
    if (sourceCards.length === 0) {
      return undefined;
    }

    return new SelectCard('Select card to move resources from', 'Select', sourceCards).andThen(([src]) => {
      const destCards = player.tableau.filter((d) => d !== src && isEligible(d) && d.resourceType === src.resourceType);
      return new SelectCard('Select card to move resources to', 'Select', destCards).andThen(([dest]) => {
        const maxCount = Math.min(src.resourceCount, maxMove);
        if (maxCount > 1) {
          return new SelectAmount('Select number of resources to move', 'Move', 1, maxCount).andThen((amount) => {
            src.resourceCount -= amount;
            dest.resourceCount += amount;
            player.game.log('${0} moved ${1} resource(s) from ${2} to ${3} via ${4}', (b) =>
              b.player(player).number(amount).card(src).card(dest).card(this),
            );
            return undefined;
          });
        }
        src.resourceCount -= maxCount;
        dest.resourceCount += maxCount;
        player.game.log('${0} moved ${1} resource(s) from ${2} to ${3} via ${4}', (b) =>
          b.player(player).number(maxCount).card(src).card(dest).card(this),
        );
        return undefined;
      });
    });
  }
}

export class FoodProcessingUnit extends PostludeCard implements IActionCard {
  constructor() {
    super({
      name: CardName.FOOD_PROCESSING_UNIT,
      type: CardType.ACTIVE,
      tags: [Tag.ANIMAL, Tag.BUILDING],
      cost: 8,
      upgradeType: 'CITY_UPGRADE',
      resourceType: CardResource.SPACE_FOOD,
      metadata: {
        cardNumber: 'PL05',
        description: 'Place the Unit on your City.',
        renderData: CardRenderer.builder((b) => {
          b.action(undefined, (eb) => {
            eb.plants(1).resource(CardResource.ANIMAL, 1).startAction.resource(CardResource.SPACE_FOOD, 1);
          }).br;
          b.or().br;
          b.action('Spend 1 Plant and 1 Animal to add 1 Space Food; OR spend 1 Space Food for 4 M€ per own adjacent tile and 1 TR.', (eb) => {
            eb.resource(CardResource.SPACE_FOOD, 1).startAction.megacredits(4).slash().emptyTile().plus().tr(1);
          }).br;
          b.postludeTile(CardName.FOOD_PROCESSING_UNIT).colon().cityUpgrade();
        }),
      },
    });
  }

  public canAct(player: IPlayer): boolean {
    const hasAnimals = player.tableau.some((c) => c.resourceType === CardResource.ANIMAL && c.resourceCount >= 1);
    const canProduce = player.plants >= 1 && hasAnimals;
    const canConsume = this.resourceCount >= 1;
    return canProduce || canConsume;
  }

  public action(player: IPlayer): PlayerInput | undefined {
    const animalCards = player.tableau.filter((c) => c.resourceType === CardResource.ANIMAL && c.resourceCount >= 1);
    const canProduce = player.plants >= 1 && animalCards.length > 0;
    const canConsume = this.resourceCount >= 1;
    const options: Array<PlayerInput> = [];

    if (canProduce) {
      options.push(
        new SelectOption('Spend 1 Plant and 1 Animal to add 1 Space Food').andThen(() => {
          player.plants -= 1;
          if (animalCards.length === 1) {
            animalCards[0].resourceCount -= 1;
            this.resourceCount += 1;
            player.game.log('${0} spent 1 Plant and 1 Animal to add 1 Space Food to ${1}', (b) =>
              b.player(player).card(this),
            );
            return undefined;
          }
          return new SelectCard('Select card to remove 1 Animal from', 'Select', animalCards).andThen(([c]) => {
            c.resourceCount -= 1;
            this.resourceCount += 1;
            player.game.log('${0} spent 1 Plant and 1 Animal to add 1 Space Food to ${1}', (b) =>
              b.player(player).card(this),
            );
            return undefined;
          });
        }),
      );
    }

    if (canConsume) {
      options.push(
        new SelectOption('Spend 1 Space Food to gain 4 M€ per own adjacent tile and 1 TR').andThen(() => {
          this.resourceCount -= 1;
          const space = this.getSpace(player);
          const count = space ? PostludeExpansion.ownAdjacentTiles(player.game.board, space, player) : 0;
          player.megaCredits += count * 4;
          player.increaseTerraformRating(1);
          player.game.log('${0} spent 1 Space Food to gain ${1} M€ and 1 TR via ${2}', (b) =>
            b.player(player).number(count * 4).card(this),
          );
          return undefined;
        }),
      );
    }

    return new OrOptions(...options);
  }
}

export class InsuranceHQ extends PostludeCard {
  constructor() {
    super({
      name: CardName.INSURANCE_HQ,
      type: CardType.ACTIVE,
      tags: [Tag.EARTH],
      cost: 5,
      upgradeType: 'CITY_UPGRADE',
      metadata: {
        cardNumber: 'PL06',
        description: 'Place the HQ on your City.',
        renderData: CardRenderer.builder((b) => {
          b.effect('Immune to production reduction from attack cards. When resources are stolen/destroyed, refund 1 per own adjacent tile.', (eb) => {
            eb.empty().startEffect.production((pb) => pb.wild(1)).slash().emptyTile();
          }).br;
          b.postludeTile(CardName.INSURANCE_HQ).colon().cityUpgrade();
        }),
      },
    });
  }
}

export class MachineryFactory extends PostludeCard {
  constructor() {
    super({
      name: CardName.MACHINERY_FACTORY,
      type: CardType.ACTIVE,
      tags: [Tag.BUILDING],
      cost: 3,
      upgradeType: 'CITY_UPGRADE',
      metadata: {
        cardNumber: 'PL07',
        description: 'Place the Factory on your City.',
        renderData: CardRenderer.builder((b) => {
          b.effect('Adjacent tile placements may be paid with Steel.', (eb) => {
            eb.emptyTile().asterix().startEffect.steel(1);
          }).br;
          b.postludeTile(CardName.MACHINERY_FACTORY).colon().cityUpgrade();
        }),
      },
    });
  }
}

export class MarsCasino extends PostludeCard implements IActionCard {
  constructor() {
    super({
      name: CardName.MARS_CASINO,
      type: CardType.ACTIVE,
      tags: [Tag.EARTH, Tag.BUILDING],
      cost: 4,
      upgradeType: 'CITY_UPGRADE',
      metadata: {
        cardNumber: 'PL08',
        description: 'Place the Mars Casino on your City at the top or bottom row of polar region.',
        renderData: CardRenderer.builder((b) => {
          b.action('Draw cards equal to own adjacent tiles. Keep those costing more than the top discard card.', (eb) => {
            eb.empty().startAction.cards(1).slash().emptyTile();
          }).br;
          b.postludeTile(CardName.MARS_CASINO).colon().cityUpgrade().asterix();
        }),
      },
    });
  }

  public canAct(player: IPlayer): boolean {
    const space = this.getSpace(player);
    return space !== undefined && PostludeExpansion.ownAdjacentTiles(player.game.board, space, player) > 0;
  }

  public action(player: IPlayer): PlayerInput | undefined {
    const space = this.getSpace(player);
    if (space === undefined) {
      return undefined;
    }
    const count = PostludeExpansion.ownAdjacentTiles(player.game.board, space, player);
    const drawn = player.game.projectDeck.drawN(player.game, count);
    const discarded = player.game.projectDeck.discardPile.pop();
    const threshold = discarded?.cost ?? 0;
    if (discarded !== undefined) {
      player.game.projectDeck.discard(discarded);
    }
    let kept = 0;
    for (const card of drawn) {
      if ((card.cost ?? 0) > threshold) {
        player.cardsInHand.push(card);
        kept++;
      } else {
        player.game.projectDeck.discard(card);
      }
    }
    player.game.log('${0} used Mars Casino (threshold: ${1} M€), kept ${2} of ${3} cards', (b) =>
      b.player(player).number(threshold).number(kept).number(count),
    );
    return undefined;
  }
}

export class MarsHospital extends PostludeCard {
  constructor() {
    super({
      name: CardName.MARS_HOSPITAL,
      type: CardType.ACTIVE,
      tags: [Tag.EARTH, Tag.BUILDING],
      cost: 6,
      upgradeType: 'CITY_UPGRADE',
      metadata: {
        cardNumber: 'PL09',
        description: 'Place the Hospital on your City adjacent to at most 2 tiles.',
        renderData: CardRenderer.builder((b) => {
          b.effect('Placing Greenery adjacent to this space raises TR even if Oxygen is at max.', (eb) => {
            eb.greenery().asterix().startEffect.tr(1);
          }).br;
          b.postludeTile(CardName.MARS_HOSPITAL).colon().cityUpgrade().asterix();
        }),
      },
    });
  }
}

export class MetallurgyWorkshop extends PostludeCard {
  constructor() {
    super({
      name: CardName.METALLURGY_WORKSHOP,
      type: CardType.ACTIVE,
      tags: [Tag.SPACE, Tag.SCIENCE],
      cost: 9,
      upgradeType: 'CITY_UPGRADE',
      metadata: {
        cardNumber: 'PL10',
        description: 'Place the Workshop on your City.',
        renderData: CardRenderer.builder((b) => {
          b.effect('Adjacent tile placements may be paid with Titanium.', (eb) => {
            eb.emptyTile().asterix().startEffect.titanium(1);
          }).br;
          b.postludeTile(CardName.METALLURGY_WORKSHOP).colon().cityUpgrade();
        }),
      },
    });
  }
}

export class MineralRefinery extends PostludeCard implements IActionCard {
  constructor() {
    super({
      name: CardName.MINERAL_REFINERY,
      type: CardType.ACTIVE,
      tags: [Tag.SPACE, Tag.BUILDING],
      cost: 26,
      upgradeType: 'CITY_UPGRADE',
      metadata: {
        cardNumber: 'PL11',
        description: 'Place the Refinery on your City adjacent to at least 2 tiles.',
        renderData: CardRenderer.builder((b) => {
          b.action('Gain 1 Titanium for each empty adjacent space.', (eb) => {
            eb.empty().startAction.titanium(1).slash().emptyTile();
          }).br;
          b.postludeTile(CardName.MINERAL_REFINERY).colon().cityUpgrade().asterix();
        }),
      },
    });
  }

  public canAct(player: IPlayer): boolean {
    const space = this.getSpace(player);
    return space !== undefined && PostludeExpansion.emptyNeighbors(player.game.board, space) > 0;
  }

  public action(player: IPlayer): PlayerInput | undefined {
    const space = this.getSpace(player);
    if (space === undefined) {
      return undefined;
    }
    const count = PostludeExpansion.emptyNeighbors(player.game.board, space);
    player.titanium += count;
    player.game.log('${0} gained ${1} Titanium with ${2}', (b) =>
      b.player(player).number(count).card(this),
    );
    return undefined;
  }
}

export class MiningDepot extends PostludeCard implements IActionCard {
  constructor() {
    super({
      name: CardName.MINING_DEPOT,
      type: CardType.ACTIVE,
      tags: [Tag.BUILDING],
      cost: 15,
      upgradeType: 'CITY_UPGRADE',
      metadata: {
        cardNumber: 'PL12',
        description: 'Place the Depot on your City adjacent to at least 2 tiles.',
        renderData: CardRenderer.builder((b) => {
          b.action('Gain 1 Steel for each empty adjacent space.', (eb) => {
            eb.empty().startAction.steel(1).slash().emptyTile();
          }).br;
          b.postludeTile(CardName.MINING_DEPOT).colon().cityUpgrade().asterix();
        }),
      },
    });
  }

  public canAct(player: IPlayer): boolean {
    const space = this.getSpace(player);
    return space !== undefined && PostludeExpansion.emptyNeighbors(player.game.board, space) > 0;
  }

  public action(player: IPlayer): PlayerInput | undefined {
    const space = this.getSpace(player);
    if (space === undefined) {
      return undefined;
    }
    const count = PostludeExpansion.emptyNeighbors(player.game.board, space);
    player.steel += count;
    player.game.log('${0} gained ${1} Steel with ${2}', (b) =>
      b.player(player).number(count).card(this),
    );
    return undefined;
  }
}

export class NanoParticleSynthesizer extends PostludeCard implements IActionCard {
  constructor() {
    super({
      name: CardName.NANO_PARTICLE_SYNTHESIZER,
      type: CardType.ACTIVE,
      tags: [Tag.SCIENCE, Tag.SPACE],
      cost: 17,
      upgradeType: 'CITY_UPGRADE',
      metadata: {
        cardNumber: 'PL13',
        description: 'Place the Synthesizer on your City adjacent to at most 2 tiles.',
        renderData: CardRenderer.builder((b) => {
          b.action('Increase any production 1 step per own adjacent tile.', (eb) => {
            eb.empty().startAction.production((pb) => pb.wild(1)).slash().emptyTile();
          }).br;
          b.postludeTile(CardName.NANO_PARTICLE_SYNTHESIZER).colon().cityUpgrade().asterix();
        }),
      },
    });
  }

  public canAct(player: IPlayer): boolean {
    const space = this.getSpace(player);
    return space !== undefined && PostludeExpansion.ownAdjacentTiles(player.game.board, space, player) > 0;
  }

  public action(player: IPlayer): PlayerInput | undefined {
    const space = this.getSpace(player);
    if (space === undefined) {
      return undefined;
    }
    const count = PostludeExpansion.ownAdjacentTiles(player.game.board, space, player);

    const promptNext = (remaining: number): PlayerInput | undefined => {
      if (remaining <= 0) {
        return undefined;
      }
      const options = ALL_RESOURCES.map((res) =>
        new SelectOption(`Increase ${res} production by 1`).andThen(() => {
          player.production.add(res, 1, {log: true});
          return promptNext(remaining - 1);
        }),
      );
      return new OrOptions(...options);
    };

    return promptNext(count);
  }
}

export class PharmaceuticalCo extends PostludeCard implements IActionCard {
  constructor() {
    super({
      name: CardName.PHARMACEUTICAL_CO,
      type: CardType.ACTIVE,
      tags: [Tag.SCIENCE],
      cost: 9,
      upgradeType: 'CITY_UPGRADE',
      metadata: {
        cardNumber: 'PL14',
        description: 'Place the Company on your City adjacent to at most 2 tiles.',
        renderData: CardRenderer.builder((b) => {
          b.action('Increase lowest non-zero production 1 step per own adjacent tile.', (eb) => {
            eb.empty().startAction.production((pb) => pb.wild(1)).slash().emptyTile();
          }).br;
          b.postludeTile(CardName.PHARMACEUTICAL_CO).colon().cityUpgrade().asterix();
        }),
      },
    });
  }

  public canAct(player: IPlayer): boolean {
    const space = this.getSpace(player);
    if (space === undefined) {
      return false;
    }
    const count = PostludeExpansion.ownAdjacentTiles(player.game.board, space, player);
    if (count <= 0) {
      return false;
    }
    return ALL_RESOURCES.some((r) => player.production[r] > 0);
  }

  public action(player: IPlayer): PlayerInput | undefined {
    const space = this.getSpace(player);
    if (space === undefined) {
      return undefined;
    }
    const count = PostludeExpansion.ownAdjacentTiles(player.game.board, space, player);
    const nonZero = ALL_RESOURCES.filter((r) => player.production[r] > 0);
    if (nonZero.length === 0) {
      return undefined;
    }

    const minVal = Math.min(...nonZero.map((r) => player.production[r]));
    const lowest = nonZero.filter((r) => player.production[r] === minVal);

    if (lowest.length === 1) {
      player.production.add(lowest[0], count, {log: true});
      player.game.log('${0} increased ${1} production by ${2} with ${3}', (b) =>
        b.player(player).string(lowest[0]).number(count).card(this),
      );
      return undefined;
    }

    return new OrOptions(
      ...lowest.map((res) =>
        new SelectOption(`Increase ${res} production by ${count}`).andThen(() => {
          player.production.add(res, count, {log: true});
          player.game.log('${0} increased ${1} production by ${2} with ${3}', (b) =>
            b.player(player).string(res).number(count).card(this),
          );
          return undefined;
        }),
      ),
    );
  }
}

export class PowerConverter extends PostludeCard implements IActionCard {
  constructor() {
    super({
      name: CardName.POWER_CONVERTER,
      type: CardType.ACTIVE,
      tags: [Tag.SCIENCE, Tag.POWER],
      cost: 6,
      upgradeType: 'CITY_UPGRADE',
      metadata: {
        cardNumber: 'PL15',
        description: 'Place the Converter on your City in equatorial rows.',
        renderData: CardRenderer.builder((b) => {
          b.action(undefined, (eb) => {
            eb.energy(1).startAction.heat(2);
          }).br;
          b.or().br;
          b.action('Convert 1 Energy to 2 Heat OR 2 Heat to 1 Energy (up to own adjacent tiles).', (eb) => {
            eb.heat(2).startAction.energy(1);
          }).br;
          b.postludeTile(CardName.POWER_CONVERTER).colon().cityUpgrade().asterix();
        }),
      },
    });
  }

  public canAct(player: IPlayer): boolean {
    const space = this.getSpace(player);
    if (space === undefined) {
      return false;
    }
    const count = PostludeExpansion.ownAdjacentTiles(player.game.board, space, player);
    if (count <= 0) {
      return false;
    }
    return player.energy >= 1 || player.heat >= 2;
  }

  public action(player: IPlayer): PlayerInput | undefined {
    const space = this.getSpace(player);
    if (space === undefined) {
      return undefined;
    }
    const count = PostludeExpansion.ownAdjacentTiles(player.game.board, space, player);
    const options: Array<PlayerInput> = [];

    if (player.energy >= 1) {
      const maxConv = Math.min(count, player.energy);
      options.push(
        new SelectAmount('Convert Energy to Heat (1:2)', 'Convert', 1, maxConv).andThen((amount) => {
          player.energy -= amount;
          player.heat += amount * 2;
          player.game.log('${0} converted ${1} Energy to ${2} Heat with Power Converter', (b) =>
            b.player(player).number(amount).number(amount * 2),
          );
          return undefined;
        }),
      );
    }

    if (player.heat >= 2) {
      const maxConv = Math.min(count, Math.floor(player.heat / 2));
      options.push(
        new SelectAmount('Convert Heat to Energy (2:1)', 'Convert', 1, maxConv).andThen((amount) => {
          player.heat -= amount * 2;
          player.energy += amount;
          player.game.log('${0} converted ${1} Heat to ${2} Energy with ${3}', (b) =>
            b.player(player).number(amount * 2).number(amount).card(this),
          );
          return undefined;
        }),
      );
    }

    return new OrOptions(...options);
  }
}

export class ReDevelopmentOffice extends PostludeCard implements IActionCard {
  constructor() {
    super({
      name: CardName.RE_DEVELOPMENT_OFFICE,
      type: CardType.ACTIVE,
      tags: [Tag.BUILDING],
      cost: 5,
      upgradeType: 'CITY_UPGRADE',
      metadata: {
        cardNumber: 'PL16',
        description: 'Place the Office on your City adjacent to a Special tile.',
        renderData: CardRenderer.builder((b) => {
          b.action('Draw 1 card from discard for each of your tiles adjacent to the Special tile.', (eb) => {
            eb.empty().startAction.cards(1).slash().emptyTile();
          }).br;
          b.postludeTile(CardName.RE_DEVELOPMENT_OFFICE).colon().cityUpgrade().asterix();
        }),
      },
    });
  }

  public canAct(player: IPlayer): boolean {
    const space = this.getSpace(player);
    return space !== undefined && PostludeExpansion.adjacentSpecial(player.game.board, space);
  }

  public action(player: IPlayer): PlayerInput | undefined {
    const space = this.getSpace(player);
    if (space === undefined) {
      return undefined;
    }

    const specialSpaces = player.game.board.getAdjacentSpaces(space).filter(
      (s) => s.tile !== undefined && !Board.isCitySpace(s) && !Board.isGreenerySpace(s) && !Board.isOceanSpace(s),
    );
    const countedSpaces = new Set<string>();
    for (const spec of specialSpaces) {
      for (const adj of player.game.board.getAdjacentSpaces(spec)) {
        if (adj.player === player && adj.tile !== undefined) {
          countedSpaces.add(adj.id);
        }
      }
    }
    const count = countedSpaces.size;
    for (let i = 0; i < count; i++) {
      if (player.game.projectDeck.discardPile.length > 0) {
        const idx = Math.floor(Math.random() * player.game.projectDeck.discardPile.length);
        const [card] = player.game.projectDeck.discardPile.splice(idx, 1);
        player.cardsInHand.push(card);
      } else {
        player.drawCard(1);
      }
    }
    player.game.log('${0} drew ${1} cards from discard with ${2}', (b) =>
      b.player(player).number(count).card(this),
    );
    return undefined;
  }
}

export class ScienceInstitute extends PostludeCard implements IActionCard {
  constructor() {
    super({
      name: CardName.SCIENCE_INSTITUTE,
      type: CardType.ACTIVE,
      tags: [Tag.SCIENCE],
      cost: 11,
      upgradeType: 'CITY_UPGRADE',
      metadata: {
        cardNumber: 'PL17',
        description: 'Place the Institute on your City adjacent to at least 2 tiles.',
        renderData: CardRenderer.builder((b) => {
          b.action('Draw 1 card per empty adjacent space, keep 1 and discard the rest.', (eb) => {
            eb.empty().startAction.cards(1).slash().emptyTile().asterix();
          }).br;
          b.postludeTile(CardName.SCIENCE_INSTITUTE).colon().cityUpgrade().asterix();
        }),
      },
    });
  }

  public canAct(player: IPlayer): boolean {
    const space = this.getSpace(player);
    return space !== undefined && PostludeExpansion.emptyNeighbors(player.game.board, space) > 0;
  }

  public action(player: IPlayer): PlayerInput | undefined {
    const space = this.getSpace(player);
    if (space === undefined) {
      return undefined;
    }
    const count = PostludeExpansion.emptyNeighbors(player.game.board, space);
    const drawn = player.game.projectDeck.drawN(player.game, count);

    return new SelectCard<IProjectCard>('Choose 1 card to keep', 'Keep', drawn).andThen(([card]) => {
      player.cardsInHand.push(card);
      for (const other of drawn) {
        if (other !== card) {
          player.game.projectDeck.discard(other);
        }
      }
      player.game.log('${0} kept ${1} from ${2}', (b) =>
        b.player(player).card(card).card(this),
      );
      return undefined;
    });
  }
}

export class TheBlackMarket extends PostludeCard {
  constructor() {
    super({
      name: CardName.THE_BLACK_MARKET,
      type: CardType.ACTIVE,
      cost: 0,
      upgradeType: 'CITY_UPGRADE',
      metadata: {
        cardNumber: 'PL18',
        description: 'Place the Market on your City.',
        renderData: CardRenderer.builder((b) => {
          b.effect('Gain resources/production lost to sabotage, less 1 per own adjacent tile.', (eb) => {
            eb.empty().startEffect.production((pb) => pb.wild(1)).or().wild(1);
          }).br;
          b.postludeTile(CardName.THE_BLACK_MARKET).colon().cityUpgrade();
        }),
      },
    });
  }
}
