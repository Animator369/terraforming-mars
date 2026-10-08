import {shallowMount} from '@vue/test-utils';
import {expect} from 'chai';
import {globalConfig} from '../getLocalVue';
import CardRenderItemComponent from '@/client/components/card/CardRenderItemComponent.vue';
import {CardRenderItemType} from '@/common/cards/render/CardRenderItemType';
import {CardName} from '@/common/cards/CardName';

describe('CardRenderItemComponent', () => {
  it('mounts without errors', () => {
    const wrapper = shallowMount(CardRenderItemComponent, {
      ...globalConfig,
      props: {
        item: {
          is: 'item',
          type: CardRenderItemType.MEGACREDITS,
          amount: 3,
        },
      },
    });
    expect(wrapper.exists()).to.be.true;
  });

  it('renders city upgrade tile with upgrade-tile class', () => {
    const wrapper = shallowMount(CardRenderItemComponent, {
      ...globalConfig,
      props: {
        item: {
          is: 'item',
          type: CardRenderItemType.CITY_UPGRADE,
          amount: 1,
        },
      },
    });
    expect(wrapper.classes()).to.include('card-item-container');
    const tileDiv = wrapper.find('.city-upgrade-tile');
    expect(tileDiv.exists()).to.be.true;
    expect(tileDiv.classes()).to.include('upgrade-tile');
    expect(tileDiv.classes()).to.include('city-tile');
  });

  it('renders postlude tile with card artwork backgroundImage', () => {
    const wrapper = shallowMount(CardRenderItemComponent, {
      ...globalConfig,
      props: {
        item: {
          is: 'item',
          type: CardRenderItemType.POSTLUDE_TILE,
          amount: 1,
          postludeCard: CardName.AMUSEMENT_PARK,
        },
      },
    });
    const tileDiv = wrapper.find('.postlude-tile');
    expect(tileDiv.exists()).to.be.true;
    expect(tileDiv.attributes('style')).to.include('amusement-park.webp');
  });
});
