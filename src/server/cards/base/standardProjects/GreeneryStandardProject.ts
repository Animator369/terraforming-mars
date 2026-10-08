import {IPlayer} from '../../../IPlayer';
import {CardName} from '../../../../common/cards/CardName';
import {CardRenderer} from '../../render/CardRenderer';
import {StandardProjectCard} from '../../StandardProjectCard';
import {PlaceGreeneryTile} from '../../../deferredActions/PlaceGreeneryTile';

import {PostludeExpansion} from '../../../postlude/PostludeExpansion';

export class GreeneryStandardProject extends StandardProjectCard {
  constructor() {
    super({
      name: CardName.GREENERY_STANDARD_PROJECT,
      cost: 23,
      tr: {oxygen: 1},
      metadata: {
        cardNumber: 'SP6',
        renderData: CardRenderer.builder((b) =>
          b.standardProject('Spend 23 M€ to place a greenery tile and raise oxygen 1 step.', (eb) => {
            eb.megacredits(23).startAction.greenery();
          }),
        ),
      },
    });
  }

  public override canPayWith(player: IPlayer) {
    const res: {seeds?: boolean, steel?: boolean, titanium?: boolean} = {};
    if (player.tableau.has(CardName.SOYLENT_SEEDLING_SYSTEMS)) {
      res.seeds = true;
    }
    const postlude = PostludeExpansion.getPostludePaymentOptions(player, this);
    if (postlude?.steel) {
      res.steel = true;
    }
    if (postlude?.titanium) {
      res.titanium = true;
    }
    return res;
  }

  public override canAct(player: IPlayer): boolean {
    // This is pricey because it forces calling canPlayOptions twice.
    if (player.game.board.getAvailableSpacesForGreenery(player, this.canPlayOptions(player)).length === 0) {
      return false;
    }
    return super.canAct(player);
  }

  actionEssence(player: IPlayer): void {
    player.game.defer(new PlaceGreeneryTile(player));
  }
}
