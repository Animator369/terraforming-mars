import {PostludeCard} from './PostludeCard';
import {CardType} from '../../../common/cards/CardType';
import {CardName} from '../../../common/cards/CardName';
import {Tag} from '../../../common/cards/Tag';
import {IPlayer} from '../../IPlayer';
import {CardRenderer} from '../render/CardRenderer';
import {SpaceBonus} from '../../../common/boards/SpaceBonus';
import {CardResource} from '../../../common/CardResource';
import {Resource} from '../../../common/Resource';
import {AddResourcesToCard} from '../../deferredActions/AddResourcesToCard';
import {Space} from '../../boards/Space';
import {OrOptions} from '../../inputs/OrOptions';
import {SelectOption} from '../../inputs/SelectOption';
import {DeferredAction} from '../../deferredActions/DeferredAction';
import {Priority} from '../../deferredActions/Priority';
import {PlayerInput} from '../../PlayerInput';
import {Units} from '../../../common/Units';
import {all} from '../Options';

export class GainDifferentStandardResourcesDeferred extends DeferredAction {
  constructor(player: IPlayer, public count: number = 4) {
    super(player, Priority.GAIN_RESOURCE_OR_PRODUCTION);
  }

  public execute(): PlayerInput | undefined {
    const promptNext = (remaining: number, available: Array<Resource>): PlayerInput | undefined => {
      if (remaining <= 0) {
        return undefined;
      }
      return new OrOptions(
        ...available.map((res) =>
          new SelectOption(`Gain 1 ${res}`).andThen(() => {
            this.player.stock.add(res, 1, {log: true});
            return promptNext(
              remaining - 1,
              available.filter((r) => r !== res),
            );
          }),
        ),
      );
    };

    return promptNext(this.count, [
      Resource.MEGACREDITS,
      Resource.STEEL,
      Resource.TITANIUM,
      Resource.PLANTS,
      Resource.ENERGY,
      Resource.HEAT,
    ]);
  }
}

export class AquaticLifeLaboratory extends PostludeCard {
  constructor() {
    super({
      name: CardName.AQUATIC_LIFE_LABORATORY,
      type: CardType.AUTOMATED,
      tags: [Tag.SCIENCE],
      cost: 9,
      upgradeType: 'OCEAN_UPGRADE',
      additionalPlacementBonus: [SpaceBonus.SCIENCE],
      metadata: {
        cardNumber: 'PL28',
        description: 'Place this Laboratory on an Ocean tile. Gain 3 Science resources to a card. Neighbor placement bonus: 1 Science resource.',
        renderData: CardRenderer.builder((b) => {
          b.resource(CardResource.SCIENCE, 3).br;
          b.postludeTile(CardName.AQUATIC_LIFE_LABORATORY).colon().oceanUpgrade().colon().resource(CardResource.SCIENCE, 1);
        }),
      },
    });
  }

  public override onUpgradePlaced(player: IPlayer, _space: Space): void {
    player.game.defer(new AddResourcesToCard(player, CardResource.SCIENCE, {count: 3}));
  }
}

export class CloudGenerator extends PostludeCard {
  constructor() {
    super({
      name: CardName.CLOUD_GENERATOR,
      type: CardType.AUTOMATED,
      tags: [Tag.VENUS],
      cost: 5,
      upgradeType: 'OCEAN_UPGRADE',
      additionalPlacementBonus: [SpaceBonus.FLOATER],
      metadata: {
        cardNumber: 'PL29',
        description: 'Place this Generator on an Ocean tile. Gain 2 Floaters per Venus tag in play, including this, to a card. Neighbor placement bonus: 1 Floater.',
        renderData: CardRenderer.builder((b) => {
          b.resource(CardResource.FLOATER, 2).slash().tag(Tag.VENUS, {all}).br;
          b.postludeTile(CardName.CLOUD_GENERATOR).colon().oceanUpgrade().colon().resource(CardResource.FLOATER, 1);
        }),
      },
    });
  }

  public override onUpgradePlaced(player: IPlayer, _space: Space): void {
    const venusTags = player.game.players.reduce((sum, p) => sum + p.tags.count(Tag.VENUS, 'raw'), 0);
    if (venusTags > 0) {
      player.game.defer(new AddResourcesToCard(player, CardResource.FLOATER, {count: venusTags * 2}));
    }
  }
}

export class DeepSeaMiningRig extends PostludeCard {
  constructor() {
    super({
      name: CardName.DEEP_SEA_MINING_RIG,
      type: CardType.AUTOMATED,
      tags: [Tag.BUILDING],
      cost: 12,
      upgradeType: 'OCEAN_UPGRADE',
      additionalPlacementBonus: [SpaceBonus.STEEL],
      metadata: {
        cardNumber: 'PL30',
        description: 'Place this Rig on an Ocean tile. Increase Steel production 2 steps. Neighbor placement bonus: 1 Steel.',
        renderData: CardRenderer.builder((b) => {
          b.production((pb) => pb.steel(2)).br;
          b.postludeTile(CardName.DEEP_SEA_MINING_RIG).colon().oceanUpgrade().colon().steel(1);
        }),
      },
    });
  }

  public productionBox(): Units {
    return Units.of({steel: 2});
  }

  public override onUpgradePlaced(player: IPlayer, _space: Space): void {
    player.production.add(Resource.STEEL, 2, {log: true});
  }
}

export class FloatingMetropolis extends PostludeCard {
  constructor() {
    super({
      name: CardName.FLOATING_METROPOLIS,
      type: CardType.AUTOMATED,
      tags: [Tag.CITY],
      cost: 9,
      upgradeType: 'OCEAN_UPGRADE',
      additionalPlacementBonus: [SpaceBonus.HEAT],
      metadata: {
        cardNumber: 'PL31',
        description: 'Place this Metropolis on an Ocean tile. Increase Heat production 2 steps. Neighbor placement bonus: 1 Heat.',
        renderData: CardRenderer.builder((b) => {
          b.production((pb) => pb.heat(2)).br;
          b.postludeTile(CardName.FLOATING_METROPOLIS).colon().oceanUpgrade().colon().heat(1);
        }),
      },
    });
  }

  public productionBox(): Units {
    return Units.of({heat: 2});
  }

  public override onUpgradePlaced(player: IPlayer, _space: Space): void {
    player.production.add(Resource.HEAT, 2, {log: true});
  }
}

export class HydraulicPowerPlant extends PostludeCard {
  constructor() {
    super({
      name: CardName.HYDRAULIC_POWER_PLANT,
      type: CardType.AUTOMATED,
      tags: [Tag.POWER],
      cost: 12,
      upgradeType: 'OCEAN_UPGRADE',
      additionalPlacementBonus: [SpaceBonus.ENERGY],
      metadata: {
        cardNumber: 'PL32',
        description: 'Place this Power Plant on an Ocean tile. Increase Energy production 2 steps. Neighbor placement bonus: 1 Energy.',
        renderData: CardRenderer.builder((b) => {
          b.production((pb) => pb.energy(2)).br;
          b.postludeTile(CardName.HYDRAULIC_POWER_PLANT).colon().oceanUpgrade().colon().energy(1);
        }),
      },
    });
  }

  public productionBox(): Units {
    return Units.of({energy: 2});
  }

  public override onUpgradePlaced(player: IPlayer, _space: Space): void {
    player.production.add(Resource.ENERGY, 2, {log: true});
  }
}

export class MarineAquarium extends PostludeCard {
  constructor() {
    super({
      name: CardName.MARINE_AQUARIUM,
      type: CardType.AUTOMATED,
      tags: [Tag.ANIMAL],
      cost: 13,
      upgradeType: 'OCEAN_UPGRADE',
      additionalPlacementBonus: [SpaceBonus.ANIMAL],
      metadata: {
        cardNumber: 'PL33',
        description: 'Place this Aquarium on an Ocean tile. Gain 2 Animals per Animal tag, including this, in play to a card. Neighbor placement bonus: 1 Animal.',
        renderData: CardRenderer.builder((b) => {
          b.resource(CardResource.ANIMAL, 2).slash().tag(Tag.ANIMAL, {all}).br;
          b.postludeTile(CardName.MARINE_AQUARIUM).colon().oceanUpgrade().colon().resource(CardResource.ANIMAL, 1);
        }),
      },
    });
  }

  public override onUpgradePlaced(player: IPlayer, _space: Space): void {
    const animalTags = player.game.players.reduce((sum, p) => sum + p.tags.count(Tag.ANIMAL, 'raw'), 0);
    if (animalTags > 0) {
      player.game.defer(new AddResourcesToCard(player, CardResource.ANIMAL, {count: animalTags * 2}));
    }
  }
}

export class MobileLaunchStation extends PostludeCard {
  constructor() {
    super({
      name: CardName.MOBILE_LAUNCH_STATION,
      type: CardType.AUTOMATED,
      tags: [Tag.SPACE],
      cost: 10,
      upgradeType: 'OCEAN_UPGRADE',
      additionalPlacementBonus: [SpaceBonus.TITANIUM],
      metadata: {
        cardNumber: 'PL34',
        description: 'Place this Station on an Ocean tile. Gain 2 Titanium per Space tag, including this, in play. Neighbor placement bonus: 1 Titanium.',
        renderData: CardRenderer.builder((b) => {
          b.titanium(2).slash().tag(Tag.SPACE, {all}).br;
          b.postludeTile(CardName.MOBILE_LAUNCH_STATION).colon().oceanUpgrade().colon().titanium(1);
        }),
      },
    });
  }

  public override onUpgradePlaced(player: IPlayer, _space: Space): void {
    const spaceTags = player.game.players.reduce((sum, p) => sum + p.tags.count(Tag.SPACE, 'raw'), 0);
    player.titanium += spaceTags * 2;
    player.game.log('${0} gained ${1} Titanium from Mobile Launch Station', (b) =>
      b.player(player).number(spaceTags * 2),
    );
  }
}

export class OceanGreenFarm extends PostludeCard {
  constructor() {
    super({
      name: CardName.OCEAN_GREEN_FARM,
      type: CardType.AUTOMATED,
      tags: [Tag.PLANT],
      cost: 17,
      upgradeType: 'OCEAN_UPGRADE',
      additionalPlacementBonus: [SpaceBonus.PLANT],
      metadata: {
        cardNumber: 'PL35',
        description: 'Place this Farm on an Ocean tile. Increase Plant production 2 steps. Neighbor placement bonus: 1 Plant.',
        renderData: CardRenderer.builder((b) => {
          b.production((pb) => pb.plants(2)).br;
          b.postludeTile(CardName.OCEAN_GREEN_FARM).colon().oceanUpgrade().colon().plants(1);
        }),
      },
    });
  }

  public productionBox(): Units {
    return Units.of({plants: 2});
  }

  public override onUpgradePlaced(player: IPlayer, _space: Space): void {
    player.production.add(Resource.PLANTS, 2, {log: true});
  }
}

export class OreRefinery extends PostludeCard {
  constructor() {
    super({
      name: CardName.ORE_REFINERY,
      type: CardType.AUTOMATED,
      tags: [Tag.INFRASTRUCTURE],
      cost: 5,
      upgradeType: 'OCEAN_UPGRADE',
      resourceType: CardResource.ORE,
      additionalPlacementBonus: [SpaceBonus.ORE],
      metadata: {
        cardNumber: 'PL36',
        description: 'Place this Ore Refinery on an Ocean tile. Gain 2 Ore resources per Infrastructure tag, including this, in play. Neighbor placement bonus: 1 Ore.',
        renderData: CardRenderer.builder((b) => {
          b.resource(CardResource.ORE, 2).slash().tag(Tag.INFRASTRUCTURE, {all}).br;
          b.postludeTile(CardName.ORE_REFINERY).colon().oceanUpgrade().colon().resource(CardResource.ORE, 1);
        }),
      },
    });
  }

  public override onUpgradePlaced(player: IPlayer, _space: Space): void {
    const infraTags = player.game.players.reduce((sum, p) => sum + p.tags.count(Tag.INFRASTRUCTURE, 'raw'), 0);
    player.game.defer(new AddResourcesToCard(player, CardResource.ORE, {count: infraTags * 2}));
  }
}

export class ResearchWatchtower extends PostludeCard {
  constructor() {
    super({
      name: CardName.RESEARCH_WATCHTOWER,
      type: CardType.AUTOMATED,
      tags: [Tag.SCIENCE],
      cost: 12,
      upgradeType: 'OCEAN_UPGRADE',
      additionalPlacementBonus: [SpaceBonus.DRAW_CARD],
      metadata: {
        cardNumber: 'PL37',
        description: 'Place this Watchtower on an Ocean tile. Draw 3 cards. Neighbor placement bonus: 1 card.',
        renderData: CardRenderer.builder((b) => {
          b.cards(3).br;
          b.postludeTile(CardName.RESEARCH_WATCHTOWER).colon().oceanUpgrade().colon().cards(1);
        }),
      },
    });
  }

  public override onUpgradePlaced(player: IPlayer, _space: Space): void {
    player.drawCard(3);
  }
}

export class SeaOrbiter extends PostludeCard {
  constructor() {
    super({
      name: CardName.SEA_ORBITER,
      type: CardType.AUTOMATED,
      tags: [Tag.MARS],
      cost: 5,
      upgradeType: 'OCEAN_UPGRADE',
      resourceType: CardResource.DATA,
      additionalPlacementBonus: [SpaceBonus.DATA],
      metadata: {
        cardNumber: 'PL38',
        description: 'Place this Orbiter on an Ocean tile. Gain 2 Data resources per Mars tag, including this, in play. Neighbor placement bonus: 1 Data.',
        renderData: CardRenderer.builder((b) => {
          b.resource(CardResource.DATA, 2).slash().tag(Tag.MARS, {all}).br;
          b.postludeTile(CardName.SEA_ORBITER).colon().oceanUpgrade().colon().resource(CardResource.DATA, 1);
        }),
      },
    });
  }

  public override onUpgradePlaced(player: IPlayer, _space: Space): void {
    const marsTags = player.game.players.reduce((sum, p) => sum + p.tags.count(Tag.MARS, 'raw'), 0);
    player.game.defer(new AddResourcesToCard(player, CardResource.DATA, {count: marsTags * 2}));
  }
}

export class SkyElevator extends PostludeCard {
  constructor() {
    super({
      name: CardName.SKY_ELEVATOR,
      type: CardType.AUTOMATED,
      tags: [Tag.EARTH],
      cost: 8,
      upgradeType: 'OCEAN_UPGRADE',
      additionalPlacementBonus: [SpaceBonus.STANDARD_RESOURCE],
      metadata: {
        cardNumber: 'PL39',
        description: 'Place the Elevator on an Ocean tile. Gain 4 different wild standard resources of your choice. Neighbor placement bonus: 1 standard resource.',
        renderData: CardRenderer.builder((b) => {
          b.wild(4).br;
          b.postludeTile(CardName.SKY_ELEVATOR).colon().oceanUpgrade().colon().wild(1);
        }),
      },
    });
  }

  public override onUpgradePlaced(player: IPlayer, _space: Space): void {
    player.game.defer(new GainDifferentStandardResourcesDeferred(player, 4));
  }
}

export class SportDivingSchool extends PostludeCard {
  constructor() {
    super({
      name: CardName.SPORT_DIVING_SCHOOL,
      type: CardType.AUTOMATED,
      cost: 9,
      upgradeType: 'OCEAN_UPGRADE',
      additionalPlacementBonus: [SpaceBonus.MEGACREDITS, SpaceBonus.MEGACREDITS],
      metadata: {
        cardNumber: 'PL40',
        description: 'Place the School on an Ocean tile. Increase M€ production 3 steps. Neighbor placement bonus: 2 M€.',
        renderData: CardRenderer.builder((b) => {
          b.production((pb) => pb.megacredits(3)).br;
          b.postludeTile(CardName.SPORT_DIVING_SCHOOL).colon().oceanUpgrade().colon().megacredits(2);
        }),
      },
    });
  }

  public productionBox(): Units {
    return Units.of({megacredits: 3});
  }

  public override onUpgradePlaced(player: IPlayer, _space: Space): void {
    player.production.add(Resource.MEGACREDITS, 3, {log: true});
  }
}

export class UnderwaterResort extends PostludeCard {
  constructor() {
    super({
      name: CardName.UNDERWATER_RESORT,
      type: CardType.AUTOMATED,
      tags: [Tag.EARTH],
      cost: 10,
      upgradeType: 'OCEAN_UPGRADE',
      additionalPlacementBonus: [SpaceBonus.MEGACREDITS, SpaceBonus.MEGACREDITS],
      metadata: {
        cardNumber: 'PL41',
        description: 'Place this Resort on an Ocean tile. Increase M€ production 3 steps. Neighbor placement bonus: 2 M€.',
        renderData: CardRenderer.builder((b) => {
          b.production((pb) => pb.megacredits(3)).br;
          b.postludeTile(CardName.UNDERWATER_RESORT).colon().oceanUpgrade().colon().megacredits(2);
        }),
      },
    });
  }

  public productionBox(): Units {
    return Units.of({megacredits: 3});
  }

  public override onUpgradePlaced(player: IPlayer, _space: Space): void {
    player.production.add(Resource.MEGACREDITS, 3, {log: true});
  }
}

export class WaterRecycleComplex extends PostludeCard {
  constructor() {
    super({
      name: CardName.WATER_RECYCLE_COMPLEX,
      type: CardType.AUTOMATED,
      tags: [Tag.MICROBE],
      cost: 7,
      upgradeType: 'OCEAN_UPGRADE',
      additionalPlacementBonus: [SpaceBonus.MICROBE],
      metadata: {
        cardNumber: 'PL42',
        description: 'Place this Complex on an Ocean tile. Gain 2 Microbes per Microbe tag, including this, in play to a card. Neighbor placement bonus: 1 Microbe.',
        renderData: CardRenderer.builder((b) => {
          b.resource(CardResource.MICROBE, 2).slash().tag(Tag.MICROBE, {all}).br;
          b.postludeTile(CardName.WATER_RECYCLE_COMPLEX).colon().oceanUpgrade().colon().resource(CardResource.MICROBE, 1);
        }),
      },
    });
  }

  public override onUpgradePlaced(player: IPlayer, _space: Space): void {
    const microbeTags = player.game.players.reduce((sum, p) => sum + p.tags.count(Tag.MICROBE, 'raw'), 0);
    if (microbeTags > 0) {
      player.game.defer(new AddResourcesToCard(player, CardResource.MICROBE, {count: microbeTags * 2}));
    }
  }
}
