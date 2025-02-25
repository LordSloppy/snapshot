<script setup lang="ts">
import {
  BoostClaimSubgraph,
  BoostRewardGuard,
  BoostSubgraph
} from '@/helpers/boost/types';
import { clone } from '@snapshot-labs/snapshot.js/src/utils';

const props = defineProps<{
  open: boolean;
  boosts: BoostSubgraph[];
  claimableBoosts: BoostSubgraph[];
  claims: BoostClaimSubgraph[];
  rewards: BoostRewardGuard[];
  loadingClaim: boolean;
}>();

defineEmits(['close', 'claimAll', 'claim']);

const allOnSameNetwork = computed(() => {
  const chainIds = new Set(props.boosts.map(boost => boost.chainId));
  return chainIds.size === 1;
});

const boostsSorted = computed(() => {
  return clone(props.boosts)
    .sort((a, b) => {
      const rewardA = props.rewards.find(reward => reward.boost_id === a.id);
      const rewardB = props.rewards.find(reward => reward.boost_id === b.id);
      return (Number(rewardB?.reward) || 0) - (Number(rewardA?.reward) || 0);
    })
    .sort((a, b) => {
      const claimedA = props.claims.some(
        claim => claim.boost.id === a.id && claim.chainId === a.chainId
      )
        ? 1
        : 0;
      const claimedB = props.claims.some(
        claim => claim.boost.id === b.id && claim.chainId === b.chainId
      )
        ? 1
        : 0;
      return claimedA - claimedB;
    })
    .filter(boost =>
      props.rewards.some(
        reward =>
          reward.boost_id === boost.id && reward.chain_id === boost.chainId
      )
    );
});
</script>

<template>
  <TuneModal :open="open" @close="$emit('close')">
    <div class="px-[64px] py-[32px] text-center">
      <TuneModalIndicator variant="gift" />
      <TuneModalTitle as="h4" class="mt-3 leading-none">
        Claim your rewards
      </TuneModalTitle>
      <TuneModalDescription class="text-md leading-none mt-1">
        You can now claim your rewards!
      </TuneModalDescription>
    </div>
    <div
      class="px-3 space-y-2 max-h-[calc(100vh-130px)] md:max-h-[200px] overflow-y-auto"
    >
      <div v-for="boost in boostsSorted" :key="boost.id">
        <SpaceProposalBoostClaimModalItem
          :boost="boost"
          :rewards="rewards"
          :claims="claims"
          :loading="loadingClaim"
          @claim="$emit('claim', boost)"
        />
      </div>
    </div>
    <div class="m-3">
      <TuneButton
        v-if="allOnSameNetwork && claimableBoosts.length > 1"
        class="w-full"
        :loading="loadingClaim"
        @click="$emit('claimAll')"
      >
        Claim all
      </TuneButton>
    </div>
  </TuneModal>
</template>
