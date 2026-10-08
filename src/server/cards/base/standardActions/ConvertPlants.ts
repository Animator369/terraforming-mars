import {StandardActionCard} from '../../StandardActionCard';
import {CardName} from '../../../../common/cards/CardName';
import {CardRenderer} from '../../render/CardRenderer';
import {IPlayer} from '../../../IPlayer';
import {MAX_OXYGEN_LEVEL} from '../../../../common/constants';
import {SelectSpace} from '../../../inputs/SelectSpace';
import {Units} from '../../../../common/Units';
import {message} from '../../../logs/MessageBuilder';
import {Space} from '../../../boards/Space';


export class ConvertPlants extends StandardActionCard {
  constructor() {
    super({
      name: CardName.CONVERT_PLANTS,
      metadata: {
        cardNumber: 'SA2',
        renderData: CardRenderer.builder((b) =>
          b.standardProject('Spend 8 plants to place a greenery tile and raise oxygen 1 step.', (eb) => {
            eb.plants(8).startAction.greenery();
          }),
        ),
      },
    });
  }

  private static getGreeneryCost(player: IPlayer, space?: Space): number {
    if (space !== undefined && player.game.board.getAdjacentSpaces(space).some(
      (adj) => adj.upgradeTile?.cardId === CardName.SOIL_ENRICHMENT_LAB && adj.upgradeTile.owner === player,
    )) {
      return Math.max(1, player.plantsNeededForGreenery - 1);
    }
    return player.plantsNeededForGreenery;
  }

  public canAct(player: IPlayer): boolean {
    const availableSpaces = player.game.board.getAvailableSpacesForGreenery(player);
    if (availableSpaces.length === 0) {
      return false;
    }
    const minCost = availableSpaces.some((s) => ConvertPlants.getGreeneryCost(player, s) < player.plantsNeededForGreenery) ?
      player.plantsNeededForGreenery - 1 : player.plantsNeededForGreenery;

    if (player.plants < minCost) {
      return false;
    }
    if (player.game.getOxygenLevel() === MAX_OXYGEN_LEVEL) {
      // The level is maximized, and that means you don't have to try to figure out if the
      // player can afford the reds tax when increasing the oxygen level.
      return true;
    }
    return player.canAfford({
      cost: 0,
      tr: {oxygen: 1},
      reserveUnits: Units.of({plants: minCost}),
    });
  }

  public action(player: IPlayer) {
    const spaces = player.game.board.getAvailableSpacesForGreenery(player);
    const validSpaces = spaces.filter((s) => player.plants >= ConvertPlants.getGreeneryCost(player, s));
    return new SelectSpace(
      message('Convert plants into greenery'),
      validSpaces)
      .andThen((space) => {
        this.actionUsed(player);
        const cost = ConvertPlants.getGreeneryCost(player, space);
        player.game.addGreenery(player, space);
        player.plants -= cost;
        return undefined;
      });
  }
}
