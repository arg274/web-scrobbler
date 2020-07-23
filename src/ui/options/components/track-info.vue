<template functional>
	<div class="mb-2">
		<div class="artist-track">{{ props.artist }} — {{ props.track }}</div>
		<div class="album" v-if="props.album">
			{{ parent.L('albumTooltip', props.album) }}
		</div>
	</div>
</template>

<script>
export default {
	props: {
		artist: String,
		track: String,
		album: String,
	},
};
</script>

<style>
.album {
	font-size: 85%;
}
</style>
