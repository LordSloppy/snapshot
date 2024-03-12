import { BOOST_WHITELIST_SETTINGS } from '@/helpers/boost';
import { BoostSubgraph } from '@/helpers/boost/types';
import { Proposal } from '@/helpers/interfaces';
import { TWO_WEEKS } from '@/helpers/constants';

export function useBoost() {
  const { env } = useApp();

  function isWhitelisted(spaceId: string) {
    return !!BOOST_WHITELIST_SETTINGS[env][spaceId];
  }

  function bribeDisabled(spaceId: string) {
    return BOOST_WHITELIST_SETTINGS[env][spaceId]?.bribeDisabled;
  }

  function sanitizeBoosts(
    boosts: BoostSubgraph[],
    proposals: Proposal[],
    spaceId: string
  ) {
    return boosts.filter(boost => {
      if (
        bribeDisabled(spaceId) &&
        boost.strategy.eligibility.type === 'bribe'
      ) {
        return false;
      }
      if (
        Number(boost.start) !==
        proposals.find(p => p.id === boost.strategy.proposal)?.end
      ) {
        return false;
      }
      if (Number(boost.end) - Number(boost.start) !== TWO_WEEKS) {
        return false;
      }
      return true;
    });
  }

  return {
    isWhitelisted,
    bribeDisabled,
    sanitizeBoosts
  };
}
