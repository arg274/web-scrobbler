import Options from '@/background/storage/options';
import ScrobbleManager from '@/background/scrobbler/scrobble-manager';
import Song from '@/background/object/song';

import { ScrobblerSongInfo } from '@/background/scrobbler/base-scrobbler';
import { SongDiff } from '@/background/pipeline/pipeline';

/**
 * Load song info using ScrobblerService object.
 *
 * @param {Song} song Song instance
 *
 * @return {Promise<SongDiff>} Loaded song info
 */
export async function loadSongInfoFromScrobblers(
	song: Song
): Promise<SongDiff> {
	if (song.isEmpty()) {
		return {};
	}

	const songInfoArr = await ScrobbleManager.getSongInfo(song.getInfo());
	const scrobblerSongInfo = getInfo(songInfoArr);
	const isValid = scrobblerSongInfo !== null;

	const forceRecognize = Options.getOption<boolean>(Options.FORCE_RECOGNIZE);

	const result: SongDiff = {
		processed: {},
		metadata: {},
		flags: {
			isValid: isValid || forceRecognize,
		},
	};

	if (isValid) {
		// TODO Rewrite using loops

		const { songInfo, metadata } = scrobblerSongInfo;

		if (!song.flags.isCorrectedByUser) {
			result.processed.duration = songInfo.duration;
			result.processed.artist = songInfo.artist;
			result.processed.track = songInfo.track;

			if (!song.getAlbum()) {
				result.processed.album = songInfo.album;
			}
		}

		result.metadata.trackArtUrl = metadata.trackArtUrl;
		result.metadata.artistUrl = metadata.artistUrl;
		result.metadata.trackUrl = metadata.trackUrl;
		result.metadata.albumUrl = metadata.albumUrl;
		result.metadata.userPlayCount = metadata.userPlayCount;
		result.metadata.albumMbId = metadata.albumMbId;

		for (const { metadata } of songInfoArr) {
			song.setLoveStatus(metadata.userloved);
		}
	}

	return result;
}

/**
 * Get song info from array contains the highest keys count.
 *
 * @param {ScrobblerSongInfo[]} songInfoArr Array of song info objects
 *
 * @return {ScrobblerSongInfo} Song info object
 */
function getInfo(songInfoArr: ScrobblerSongInfo[]): ScrobblerSongInfo {
	return songInfoArr.reduce((prev, current) => {
		if (!current) {
			return prev;
		}
		if (!prev) {
			return current;
		}
		if (getNonEmptyKeyCount(current) > getNonEmptyKeyCount(prev)) {
			return current;
		}

		return prev;
	}, null);
}

/**
 * Return number of non-empty object keys.
 *
 * @param {ScrobblerSongInfo} obj Object instance
 *
 * @return {mumber} Number of non-empty object keys
 */
function getNonEmptyKeyCount(obj: ScrobblerSongInfo): number {
	let keyCount = 0;
	for (const key in obj) {
		if (obj[key]) {
			++keyCount;
		}
	}

	return keyCount;
}