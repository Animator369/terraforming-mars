import {DeferredAction} from '../deferredActions/DeferredAction';
import {Priority} from '../deferredActions/Priority';
import {IPlayer} from '../IPlayer';
import {Space} from '../boards/Space';
import {SelectSpace} from '../inputs/SelectSpace';
import {CardName} from '../../common/cards/CardName';
import {UpgradeType} from '../../common/postlude/PostludeTypes';
import {SpaceBonus} from '../../common/boards/SpaceBonus';
import {PostludeExpansion} from './PostludeExpansion';
import {Message} from '../../common/logs/Message';

export class PlaceUpgrade extends DeferredAction<Space> {
  constructor(
    player: IPlayer,
    public cardName: CardName,
    public upgradeType: UpgradeType,
    public additionalPlacementBonus?: Array<SpaceBonus>,
    public title?: string | Message,
  ) {
    super(player, Priority.DEFAULT);
  }

  public execute() {
    const spaces = PostludeExpansion.getAvailableSpaces(this.player, this.cardName);
    const title = this.title ?? `Select space to place upgrade for ${this.cardName}`;
    return new SelectSpace(title, spaces).andThen((space) => {
      PostludeExpansion.placeUpgrade(
        this.player,
        space,
        this.cardName,
        this.upgradeType,
        this.additionalPlacementBonus,
      );
      this.cb(space);
      return undefined;
    });
  }
}
