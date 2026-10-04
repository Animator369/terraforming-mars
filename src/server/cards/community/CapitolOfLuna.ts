import {ICard} from '../ICard';
import {PreludeCard} from '../prelude/PreludeCard';
import {CardName} from '../../../common/cards/CardName';
import {Tag} from '../../../common/cards/Tag';
import { Player } from '@/server/Player';
import { IProjectCard } from '@/server/cards/IProjectCard';
import {CardRenderer} from '../render/CardRenderer';

export class CapitolOfLuna extends PreludeCard {
  private discountUsed: boolean = false;

  constructor() {
    super({
      name: CardName.CAPITOL_OF_LUNA,
      tags: [Tag.EARTH],
	  victoryPoints: {tag: Tag.EARTH, per: 2},
      behavior: {
        production: {megacredits: 1},
      },
      metadata: {
        cardNumber: 'Y311',
        renderData: CardRenderer.builder((b) => {
          b.production((pb) => pb.megacredits(1));
          b.cards(1).br;
		  b.cards(1, {secondaryTag: Tag.EARTH}).colon().megacredits(-4);
        }),
        description: 'Increase your MC production 1 step. Draw a card. The first card you play with an Earth tag, costs 4 MC less.',
      },
    });
  }

	// Эффект розыгрыша: добираем карту (производство начисляется через behavior)
  public override play(player: Player) {
    player.drawCard(1);
    return undefined;
  }

  // Скидка 4 МК на первую карту с тегом Земли (в PreludeCard этот метод есть, поэтому override нужен)
  public override getCardDiscount(_player: Player, card: IProjectCard): number {
    if (!this.discountUsed && card.tags.includes(Tag.EARTH)) {
      return 4;
    }
    return 0;
  }

  // ВНИМАНИЕ: без ключевого слова 'override'! В базовом классе метода нет,
  // но Player.ts вызывает его опционально через effectCard.onCardPlayed?.(...)
  public onCardPlayed(_player: Player, card: ICard): void {
    if (!this.discountUsed && card.tags?.includes(Tag.EARTH) && card.name !== this.name) {
      this.discountUsed = true;
    }
  }

  // 1 ПО за каждые 2 тега Земли
  public override getVictoryPoints(player: Player): number {
    return Math.floor(player.tags.count(Tag.EARTH) / 2);
  }
}