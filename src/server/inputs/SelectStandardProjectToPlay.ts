import {Payment} from '../../common/inputs/Payment';
import {IStandardProjectCard} from '../cards/IStandardProjectCard';
import {CardAction, IPlayer} from '../IPlayer';
import {SelectProjectCardToPlayResponse} from '../../common/inputs/InputResponse';
import {CardName} from '../../common/cards/CardName';
import {InputError} from './InputError';
import {PaymentOptions} from '../../common/inputs/Payment';
import {Message} from '../../common/logs/Message';
import {PlayCardMetadata, SelectCardToPlay} from './SelectCardToPlay';
import {PostludeExpansion} from '../postlude/PostludeExpansion';

export class SelectStandardProjectToPlay extends SelectCardToPlay<IStandardProjectCard> {
  constructor(
    player: IPlayer,
    cards: Array<IStandardProjectCard>,
    config?: {
      action?: CardAction,
      enabled?: ReadonlyArray<boolean>,
      title?: string | Message,
      buttonLabel?: string,
      adjustedCost?: (card: IStandardProjectCard) => number,
    }) {
    super(player, cards, config);
    this.buttonLabel = config?.buttonLabel ?? 'Play Standard Project';
  }

  public validate(card: IStandardProjectCard, input: SelectProjectCardToPlayResponse, details: PlayCardMetadata) {
    // The client greys out projects whose canAct is false (via the `enabled` array), but the
    // server must enforce it too: process() never consults `enabled`, and projects whose
    // requirement isn't just the M€ cost (e.g. Collusion spending corruption) would otherwise
    // execute regardless. See https://github.com/terraforming-mars/terraforming-mars/issues/8238.
    //
    // This only matters for menus that offer non-actable projects (the standard projects menu and
    // Established Methods). A discounted play (overriddenCost set, e.g. Standard Technology) is
    // already handed a canAct-filtered list, so re-checking here is redundant and, worse, would
    // re-evaluate affordability at the full undiscounted cost and reject a play the player can
    // afford at the discount. See https://github.com/terraforming-mars/terraforming-mars/issues/8247.
    if (details.overriddenCost === undefined && !card.canAct(this.player)) {
      throw new InputError('You cannot play this standard project');
    }
    const canPayWith = card.canPayWith(this.player);
    const paymentOptions: Partial<PaymentOptions> = {
      heat: this.player.canUseHeatAsMegaCredits,
      steel: canPayWith.steel,
      titanium: canPayWith.titanium,
      lunaTradeFederationTitanium: this.player.canUseTitaniumAsMegacredits,
      seeds: canPayWith.seeds,
      auroraiData: this.player.tableau.has(CardName.AURORAI),
      spireScience: this.player.tableau.has(CardName.SPIRE),
      kuiperAsteroids: canPayWith.kuiperAsteroids ? this.player.tableau.has(CardName.KUIPER_COOPERATIVE) : false,
    };

    const reserveUnits = details.reserveUnits;

    if (!this.player.canSpend(input.payment, reserveUnits)) {
      throw new InputError('You do not have that many resources');
    }

    const isCityPrefab = card.name === CardName.CITY_STANDARD_PROJECT && this.player.tableau.has(CardName.PREFABRICATION_OF_HUMAN_HABITATS);
    const steelFromUpgrade = input.payment.steel > 0 && !isCityPrefab;
    const titaniumFromUpgrade = input.payment.titanium > 0;
    if (steelFromUpgrade && titaniumFromUpgrade) {
      const postludeOptions = PostludeExpansion.getPostludePaymentOptions(this.player, card);
      if (postludeOptions?.exclusiveSteelTitanium) {
        throw new InputError('Cannot pay with both Steel and Titanium: Machinery Factory and Metallurgy Workshop share no available adjacent spaces for this tile.');
      }
    }

    const amountPaid = this.player.payingAmount(input.payment, paymentOptions);
    const requiredCost = details.overriddenCost ?? card.getAdjustedCost(this.player);
    if (amountPaid < requiredCost) {
      throw new InputError('Did not spend enough to pay for standard project');
    }
    return undefined;
  }

  // Public for tests
  public payAndPlay(card: IStandardProjectCard, payment: Payment) {
    const isCityPrefab = card.name === CardName.CITY_STANDARD_PROJECT && this.player.tableau.has(CardName.PREFABRICATION_OF_HUMAN_HABITATS);
    const steelFromUpgrade = payment.steel > 0 && !isCityPrefab;
    const titaniumFromUpgrade = payment.titanium > 0;
    const postludeOptions = PostludeExpansion.getPostludePaymentOptions(this.player, card);

    if (steelFromUpgrade && titaniumFromUpgrade && postludeOptions?.commonSpaces) {
      this.player.postludePlacementConstraint = {
        spaces: postludeOptions.commonSpaces,
        label: 'Machinery Factory & Metallurgy Workshop',
      };
    } else if (steelFromUpgrade && postludeOptions?.steelSpaces) {
      this.player.postludePlacementConstraint = {
        spaces: postludeOptions.steelSpaces,
        label: 'Machinery Factory',
      };
    } else if (titaniumFromUpgrade && postludeOptions?.titaniumSpaces) {
      this.player.postludePlacementConstraint = {
        spaces: postludeOptions.titaniumSpaces,
        label: 'Metallurgy Workshop',
      };
    }

    card.payAndExecute(this.player, payment);
    this.cb(card);
  }
}
