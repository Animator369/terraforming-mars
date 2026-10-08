import {IPlayer} from '../../../IPlayer';
import {CardName} from '../../../../common/cards/CardName';
import {CardRenderer} from '../../render/CardRenderer';
import {StandardProjectCard} from '../../StandardProjectCard';
import {PlaceCityTile} from '../../../deferredActions/PlaceCityTile';
import {Resource} from '../../../../common/Resource';

import {PostludeExpansion} from '../../../postlude/PostludeExpansion';

export class CityStandardProject extends StandardProjectCard {
  constructor() {
    super({
      name: CardName.CITY_STANDARD_PROJECT,
      cost: 25,
      metadata: {
        cardNumber: 'SP4',
        renderData: CardRenderer.builder((b) =>
          b.standardProject('Spend 25 M€ to place a city tile and increase your M€ production 1 step.', (eb) => {
            eb.megacredits(25).startAction.city().production((pb) => {
              pb.megacredits(1);
            });
          }),
        ),
      },
    });
  }

  public override canPayWith(player: IPlayer) {
    const res: {steel?: boolean, titanium?: boolean} = {};
    if (player.tableau.get(CardName.PREFABRICATION_OF_HUMAN_HABITATS) !== undefined) {
      res.steel = true;
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
    if (player.game.board.getAvailableSpacesForCity(player, this.canPlayOptions(player)).length === 0) {
      return false;
    }
    return super.canAct(player);
  }

  actionEssence(player: IPlayer): void {
    player.game.defer(new PlaceCityTile(player));
    player.production.add(Resource.MEGACREDITS, 1);
  }
}
