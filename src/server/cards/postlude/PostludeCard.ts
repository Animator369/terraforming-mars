import {Card, StaticCardProperties} from '../Card';
import {IProjectCard} from '../IProjectCard';
import {IPlayer} from '../../IPlayer';
import {PostludeExpansion} from '../../postlude/PostludeExpansion';
import {UpgradeType} from '../../../common/postlude/PostludeTypes';
import {SpaceBonus} from '../../../common/boards/SpaceBonus';
import {SelectSpace} from '../../inputs/SelectSpace';
import {Space} from '../../boards/Space';

export interface PostludeCardProperties extends StaticCardProperties {
  upgradeType: UpgradeType;
  additionalPlacementBonus?: Array<SpaceBonus>;
}

export abstract class PostludeCard extends Card implements IProjectCard {
  public readonly upgradeType: UpgradeType;
  public readonly additionalPlacementBonus?: Array<SpaceBonus>;

  constructor(properties: PostludeCardProperties) {
    super(properties);
    this.upgradeType = properties.upgradeType;
    this.additionalPlacementBonus = properties.additionalPlacementBonus;
  }

  public override bespokeCanPlay(player: IPlayer): boolean {
    return PostludeExpansion.getAvailableSpaces(player, this.name).length > 0;
  }

  public override bespokePlay(player: IPlayer): SelectSpace {
    const spaces = PostludeExpansion.getAvailableSpaces(player, this.name);
    return new SelectSpace(`Select space for ${this.name}`, spaces).andThen((space) => {
      PostludeExpansion.placeUpgrade(
        player,
        space,
        this.name,
        this.upgradeType,
        this.additionalPlacementBonus,
      );
      this.onUpgradePlaced(player, space);
      return undefined;
    });
  }

  public onUpgradePlaced(_player: IPlayer, _space: Space): void {}

  public getSpace(player: IPlayer): Space | undefined {
    return PostludeExpansion.getSpaceForUpgrade(player.game, this.name);
  }
}
