import {PostludeCard} from './PostludeCard';
import {CardType} from '../../../common/cards/CardType';
import {CardName} from '../../../common/cards/CardName';
import {Tag} from '../../../common/cards/Tag';
import {IPlayer} from '../../IPlayer';
import {CardRenderer} from '../render/CardRenderer';
import {PostludeExpansion} from '../../postlude/PostludeExpansion';
import {Board} from '../../boards/Board';
import {CardResource} from '../../../common/CardResource';
import {OrOptions} from '../../inputs/OrOptions';
import {SelectOption} from '../../inputs/SelectOption';
import {SelectCard} from '../../inputs/SelectCard';
import {SelectAmount} from '../../inputs/SelectAmount';
import {Resource} from '../../../common/Resource';
import {IActionCard} from '../ICard';
import {PlayerInput} from '../../PlayerInput';
import {Space} from '../../boards/Space';
import {BoardType} from '../../boards/BoardType';
import {questionmark, cities, oceans} from '../render/DynamicVictoryPoints';

export class AmusementPark extends PostludeCard {
  constructor() {
    super({
      name: CardName.AMUSEMENT_PARK,
      type: CardType.AUTOMATED,
      tags: [Tag.EARTH, Tag.BUILDING],
      cost: 8,
      upgradeType: 'GREENERY_UPGRADE',
      victoryPoints: 'special',
      metadata: {
        cardNumber: 'PL19',
        description: 'Place the Park on your Greenery adjacent to a City.',
        renderData: CardRenderer.builder((b) => {
          b.effect('Placement bonus for placing adjacent to this Park is doubled.', (eb) => {
            eb.adjacencyBonus().startEffect.text('2X', {isBold: true});
          }).br;
          b.postludeTile(CardName.AMUSEMENT_PARK).colon().greeneryUpgrade({withO2: false}).asterix().br;
          b.vpText('1 VP per adjacent City.');
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
    return PostludeExpansion.adjacentCities(player.game.board, space);
  }
}

export class AnimalFarm extends PostludeCard implements IActionCard {
  constructor() {
    super({
      name: CardName.ANIMAL_FARM,
      type: CardType.ACTIVE,
      tags: [Tag.ANIMAL],
      cost: 5,
      upgradeType: 'GREENERY_UPGRADE',
      resourceType: CardResource.ANIMAL,
      victoryPoints: {resourcesHere: true, each: 1, per: 2},
      metadata: {
        cardNumber: 'PL20',
        description: 'Place the Farm on your Greenery adjacent to 2 Cities.',
        renderData: CardRenderer.builder((b) => {
          b.action('Add 1 Animal here per adjacent Greenery of yours.', (eb) => {
            eb.empty().startAction.resource(CardResource.ANIMAL, 1).slash().greenery({withO2: false});
          }).br;
          b.postludeTile(CardName.ANIMAL_FARM).colon().greeneryUpgrade({withO2: false}).asterix().br;
          b.vpText('1 VP per 2 Animals on this card.');
        }),
      },
    });
  }

  public canAct(player: IPlayer): boolean {
    const space = this.getSpace(player);
    return space !== undefined && PostludeExpansion.ownAdjacentGreeneries(player.game.board, space, player) > 0;
  }

  public action(player: IPlayer): PlayerInput | undefined {
    const space = this.getSpace(player);
    if (space === undefined) {
      return undefined;
    }
    const count = PostludeExpansion.ownAdjacentGreeneries(player.game.board, space, player);
    this.resourceCount += count;
    player.game.log('${0} added ${1} Animal(s) to ${2}', (b) =>
      b.player(player).number(count).card(this),
    );
    return undefined;
  }
}

export class CultivationBioDome extends PostludeCard implements IActionCard {
  constructor() {
    super({
      name: CardName.CULTIVATION_BIO_DOME,
      type: CardType.ACTIVE,
      tags: [Tag.PLANT],
      cost: 16,
      upgradeType: 'GREENERY_UPGRADE',
      victoryPoints: 'special',
      metadata: {
        cardNumber: 'PL21',
        description: 'Place the Bio-dome on your Greenery by an Ocean tile.',
        renderData: CardRenderer.builder((b) => {
          b.action('Gain 1 Plant for each adjacent Ocean.', (eb) => {
            eb.empty().startAction.plants(1).slash().oceanTile();
          }).br;
          b.postludeTile(CardName.CULTIVATION_BIO_DOME).colon().greeneryUpgrade({withO2: false}).asterix().br;
          b.vpText('1 VP per adjacent Ocean.');
        }),
        victoryPoints: oceans(1, 1),
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
    player.plants += count;
    player.game.log('${0} gained ${1} Plant(s) with ${2}', (b) =>
      b.player(player).number(count).card(this),
    );
    return undefined;
  }

  public override getVictoryPoints(player: IPlayer): number {
    const space = this.getSpace(player);
    if (space === undefined) {
      return 0;
    }
    return PostludeExpansion.adjacentOceans(player.game.board, space);
  }
}

export class PhotobionicPowerStation extends PostludeCard implements IActionCard {
  constructor() {
    super({
      name: CardName.PHOTOBIONIC_POWER_STATION,
      type: CardType.ACTIVE,
      tags: [Tag.PLANT, Tag.POWER],
      cost: 9,
      upgradeType: 'GREENERY_UPGRADE',
      victoryPoints: 'special',
      metadata: {
        cardNumber: 'PL22',
        description: 'Place the Station on your Greenery adjacent to two Cities.',
        renderData: CardRenderer.builder((b) => {
          b.action('Gain 1 Energy for each adjacent Greenery of yours.', (eb) => {
            eb.empty().startAction.energy(1).slash().greenery({withO2: false});
          }).br;
          b.postludeTile(CardName.PHOTOBIONIC_POWER_STATION).colon().greeneryUpgrade({withO2: false}).asterix().br;
          b.vpText('1 VP per adjacent Greenery.');
        }),
        victoryPoints: questionmark(1, 1),
      },
    });
  }

  public canAct(player: IPlayer): boolean {
    const space = this.getSpace(player);
    return space !== undefined && PostludeExpansion.ownAdjacentGreeneries(player.game.board, space, player) > 0;
  }

  public action(player: IPlayer): PlayerInput | undefined {
    const space = this.getSpace(player);
    if (space === undefined) {
      return undefined;
    }
    const count = PostludeExpansion.ownAdjacentGreeneries(player.game.board, space, player);
    player.energy += count;
    player.game.log('${0} gained ${1} Energy with ${2}', (b) =>
      b.player(player).number(count).card(this),
    );
    return undefined;
  }

  public override getVictoryPoints(player: IPlayer): number {
    const space = this.getSpace(player);
    if (space === undefined) {
      return 0;
    }
    return PostludeExpansion.adjacentGreeneries(player.game.board, space);
  }
}

export class ProbioticsManufactory extends PostludeCard implements IActionCard {
  constructor() {
    super({
      name: CardName.PROBIOTICS_MANUFACTORY,
      type: CardType.ACTIVE,
      tags: [Tag.MICROBE, Tag.BUILDING],
      cost: 4,
      upgradeType: 'GREENERY_UPGRADE',
      resourceType: CardResource.PROBIOTICS,
      victoryPoints: {resourcesHere: true, each: 1, per: 2},
      metadata: {
        cardNumber: 'PL23',
        description: 'Place the Manufactory on your Greenery by an Ocean tile.',
        renderData: CardRenderer.builder((b) => {
          b.action(undefined, (eb) => {
            eb.resource(CardResource.MICROBE, 1).startAction.resource(CardResource.PROBIOTICS, 1).slash().oceanTile();
          }).br;
          b.or().br;
          b.action('Spend 1 Microbe to add 1 Probiotic per adjacent Ocean; OR sell Probiotics at Gen M€ each.', (eb) => {
            eb.resource(CardResource.PROBIOTICS, 1).startAction.megacredits(1).slash().text('GEN');
          }).br;
          b.postludeTile(CardName.PROBIOTICS_MANUFACTORY).colon().greeneryUpgrade({withO2: false}).asterix().br;
          b.vpText('1 VP per 2 Probiotics on this card.');
        }),
      },
    });
  }

  public canAct(player: IPlayer): boolean {
    const space = this.getSpace(player);
    const oceans = space ? PostludeExpansion.adjacentOceans(player.game.board, space) : 0;
    const hasMicrobes = player.tableau.some(
      (c) => c.resourceType === CardResource.MICROBE && c.resourceCount >= 1,
    );
    const canProduce = oceans > 0 && hasMicrobes;
    const canSell = this.resourceCount >= 1;
    return canProduce || canSell;
  }

  public action(player: IPlayer): PlayerInput | undefined {
    const space = this.getSpace(player);
    const oceans = space ? PostludeExpansion.adjacentOceans(player.game.board, space) : 0;
    const microbeCards = player.tableau.filter(
      (c) => c.resourceType === CardResource.MICROBE && c.resourceCount >= 1,
    );
    const canProduce = oceans > 0 && microbeCards.length > 0;
    const canSell = this.resourceCount >= 1;
    const options: Array<PlayerInput> = [];

    if (canProduce) {
      options.push(
        new SelectOption(`Spend 1 Microbe to add ${oceans} Probiotic(s)`).andThen(() => {
          if (microbeCards.length === 1) {
            microbeCards[0].resourceCount -= 1;
            this.resourceCount += oceans;
            player.game.log('${0} spent 1 Microbe from ${1} to add ${2} Probiotic(s) to ${3}', (b) =>
              b.player(player).card(microbeCards[0]).number(oceans).card(this),
            );
            return undefined;
          }
          return new SelectCard('Select card to remove 1 Microbe from', 'Select', microbeCards).andThen(([card]) => {
            card.resourceCount -= 1;
            this.resourceCount += oceans;
            player.game.log('${0} spent 1 Microbe from ${1} to add ${2} Probiotic(s) to ${3}', (b) =>
              b.player(player).card(card).number(oceans).card(this),
            );
            return undefined;
          });
        }),
      );
    }

    if (canSell) {
      const price = player.game.generation;
      options.push(
        new SelectAmount(
          `Sell Probiotics for ${price} M€ each (Generation ${price})`,
          'Sell',
          1,
          this.resourceCount,
        ).andThen((amount) => {
          this.resourceCount -= amount;
          const total = amount * price;
          player.megaCredits += total;
          player.game.log('${0} sold ${1} Probiotic(s) for ${2} M€ via ${3}', (b) =>
            b.player(player).number(amount).number(total).card(this),
          );
          return undefined;
        }),
      );
    }

    return new OrOptions(...options);
  }
}

export class SoilEnrichmentLab extends PostludeCard {
  constructor() {
    super({
      name: CardName.SOIL_ENRICHMENT_LAB,
      type: CardType.AUTOMATED,
      tags: [Tag.SCIENCE, Tag.PLANT],
      cost: 10,
      upgradeType: 'GREENERY_UPGRADE',
      victoryPoints: 'special',
      metadata: {
        cardNumber: 'PL24',
        description: 'Place the lab on your Greenery adjacent to a City.',
        renderData: CardRenderer.builder((b) => {
          b.effect('Placing Greenery adjacent to this Lab costs 1 Plant less.', (eb) => {
            eb.greenery().asterix().startEffect.minus().plants(1);
          }).br;
          b.postludeTile(CardName.SOIL_ENRICHMENT_LAB).colon().greeneryUpgrade({withO2: false}).asterix().br;
          b.vpText('1 VP per adjacent Greenery of yours.');
        }),
        victoryPoints: questionmark(1, 1),
      },
    });
  }

  public override getVictoryPoints(player: IPlayer): number {
    const space = this.getSpace(player);
    if (space === undefined) {
      return 0;
    }
    return PostludeExpansion.ownAdjacentGreeneries(player.game.board, space, player);
  }
}

export class UniversalBioStore extends PostludeCard implements IActionCard {
  constructor() {
    super({
      name: CardName.UNIVERSAL_BIO_STORE,
      type: CardType.ACTIVE,
      tags: [Tag.ANIMAL, Tag.MICROBE, Tag.PLANT],
      cost: 6,
      upgradeType: 'GREENERY_UPGRADE',
      resourceType: CardResource.RESOURCE_CUBE,
      victoryPoints: 'special',
      metadata: {
        cardNumber: 'PL25',
        description: 'Place the Bio-Store on your Greenery.',
        renderData: CardRenderer.builder((b) => {
          b.action(undefined, (eb) => {
            eb.empty().startAction.megacredits(1).slash().tag(Tag.PLANT).tag(Tag.MICROBE).tag(Tag.ANIMAL);
          }).br;
          b.or().br;
          b.action('Add 1 M€ here per Bio tag in play; OR take M€ from this card.', (eb) => {
            eb.resource(CardResource.RESOURCE_CUBE, 1).startAction.megacredits(1);
          }).br;
          b.postludeTile(CardName.UNIVERSAL_BIO_STORE).colon().greeneryUpgrade({withO2: false}).br;
          b.vpText('1 VP per adjacent tile of yours.');
        }),
        victoryPoints: questionmark(1, 1),
      },
    });
  }

  public canAct(player: IPlayer): boolean {
    const bioTags = player.game.players.reduce(
      (sum, p) =>
        sum +
        p.tags.count(Tag.PLANT, 'raw') +
        p.tags.count(Tag.MICROBE, 'raw') +
        p.tags.count(Tag.ANIMAL, 'raw'),
      0,
    );
    return bioTags > 0 || this.resourceCount > 0;
  }

  public action(player: IPlayer): PlayerInput | undefined {
    const bioTags = player.game.players.reduce(
      (sum, p) =>
        sum +
        p.tags.count(Tag.PLANT, 'raw') +
        p.tags.count(Tag.MICROBE, 'raw') +
        p.tags.count(Tag.ANIMAL, 'raw'),
      0,
    );
    const options: Array<PlayerInput> = [];

    if (bioTags > 0) {
      options.push(
        new SelectOption(`Add ${bioTags} M€ to this card (1 per bio tag in play)`).andThen(() => {
          this.resourceCount += bioTags;
          player.game.log('${0} added ${1} M€ to Universal Bio-Store', (b) =>
            b.player(player).number(bioTags),
          );
          return undefined;
        }),
      );
    }

    if (this.resourceCount > 0) {
      if (this.resourceCount === 1) {
        options.push(
          new SelectOption('Take 1 M€ from this card').andThen(() => {
            this.resourceCount -= 1;
            player.megaCredits += 1;
            player.game.log('${0} took 1 M€ from Universal Bio-Store', (b) =>
              b.player(player),
            );
            return undefined;
          }),
        );
      } else {
        options.push(
          new SelectAmount(
            `Take M€ from this card (up to ${this.resourceCount})`,
            'Take',
            1,
            this.resourceCount,
          ).andThen((amount) => {
            this.resourceCount -= amount;
            player.megaCredits += amount;
            player.game.log('${0} took ${1} M€ from Universal Bio-Store', (b) =>
              b.player(player).number(amount),
            );
            return undefined;
          }),
        );
      }
    }

    return new OrOptions(...options);
  }

  public override getVictoryPoints(player: IPlayer): number {
    const space = this.getSpace(player);
    if (space === undefined) {
      return 0;
    }
    return PostludeExpansion.ownAdjacentTiles(player.game.board, space, player);
  }
}

export class WasteProcessingCentre extends PostludeCard implements IActionCard {
  constructor() {
    super({
      name: CardName.WASTE_PROCESSING_CENTRE,
      type: CardType.ACTIVE,
      tags: [Tag.POWER, Tag.BUILDING],
      cost: 12,
      upgradeType: 'GREENERY_UPGRADE',
      victoryPoints: 'special',
      metadata: {
        cardNumber: 'PL26',
        description: 'Place the Centre on your Greenery at the periphery of Map.',
        renderData: CardRenderer.builder((b) => {
          b.action('Increase Heat production 1 step for each adjacent City.', (eb) => {
            eb.empty().startAction.production((pb) => pb.heat(1)).slash().city();
          }).br;
          b.postludeTile(CardName.WASTE_PROCESSING_CENTRE).colon().greeneryUpgrade({withO2: false}).asterix().br;
          b.vpText('1 VP per adjacent City.');
        }),
        victoryPoints: cities(1, 1, true, true),
      },
    });
  }

  public canAct(player: IPlayer): boolean {
    const space = this.getSpace(player);
    return space !== undefined && PostludeExpansion.adjacentCities(player.game.board, space) > 0;
  }

  public action(player: IPlayer): PlayerInput | undefined {
    const space = this.getSpace(player);
    if (space === undefined) {
      return undefined;
    }
    const count = PostludeExpansion.adjacentCities(player.game.board, space);
    player.production.add(Resource.HEAT, count, {log: true});
    player.game.log('${0} increased Heat production by ${1} via Waste Processing Centre', (b) =>
      b.player(player).number(count),
    );
    return undefined;
  }

  public override getVictoryPoints(player: IPlayer): number {
    const space = this.getSpace(player);
    if (space === undefined) {
      return 0;
    }
    return PostludeExpansion.adjacentCities(player.game.board, space);
  }
}

export class NationalGreenPark extends PostludeCard {
  constructor() {
    super({
      name: CardName.NATIONAL_GREEN_PARK,
      type: CardType.ACTIVE,
      tags: [Tag.PLANT],
      cost: 8,
      upgradeType: 'GREENERY_UPGRADE',
      victoryPoints: 'special',
      metadata: {
        cardNumber: 'PL27',
        description: 'Place the Park on your Greenery not adjacent to Ocean.',
        renderData: CardRenderer.builder((b) => {
          b.effect('Draw a card with a Bio tag whenever an adjacent Greenery is placed.', (eb) => {
            eb.greenery({withO2: false}).asterix().startEffect.cards(1).tag(Tag.PLANT).tag(Tag.MICROBE).tag(Tag.ANIMAL);
          }).br;
          b.postludeTile(CardName.NATIONAL_GREEN_PARK).colon().greeneryUpgrade({withO2: false}).asterix().br;
          b.vpText('1 VP per adjacent Greenery.');
        }),
        victoryPoints: questionmark(1, 1),
      },
    });
  }

  public onTilePlaced(cardOwner: IPlayer, _activePlayer: IPlayer, space: Space, _boardType: BoardType): void {
    const host = this.getSpace(cardOwner);
    if (host === undefined) {
      return;
    }
    if (Board.isGreenerySpace(space) && cardOwner.game.board.getAdjacentSpaces(host).some((s) => s.id === space.id)) {
      cardOwner.drawCard(1, {
        include: (card) =>
          card.tags.includes(Tag.PLANT) ||
          card.tags.includes(Tag.MICROBE) ||
          card.tags.includes(Tag.ANIMAL),
      });
      cardOwner.game.log('${0} drew a bio card from National Green Park', (b) =>
        b.player(cardOwner),
      );
    }
  }

  public override getVictoryPoints(player: IPlayer): number {
    const space = this.getSpace(player);
    if (space === undefined) {
      return 0;
    }
    return PostludeExpansion.adjacentGreeneries(player.game.board, space);
  }
}
