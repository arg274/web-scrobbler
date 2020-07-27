import md5 from 'blueimp-md5';

import Song from '@/background/object/song';
import CustomStorage from '@/background/storage/custom-storage';
import { EditedSongInfo } from '@/background/object/song';

type SavedEditsStorage = Record<string, EditedSongInfo>;

/**
 * A model to load/save song info to a storage.
 */
export default abstract class SavedEditsModel extends CustomStorage {
	/**
	 * Public functions.
	 */

	/**
	 * Apply edited song info to a given song object.
	 *
	 * @param {Object} song Song instance
	 *
	 * @return {Boolean} True if data is loaded; false otherwise
	 */
	async loadSongInfo(song: Song): Promise<EditedSongInfo> {
		let songId = SavedEditsModel.getSongId(song);
		const storageData = (await this.getData()) as SavedEditsStorage;

		if (!(songId in storageData)) {
			songId = SavedEditsModel.makeSongId(song, [
				'artist',
				'track',
				'album',
			]);
		}

		if (!(songId in storageData)) {
			songId = SavedEditsModel.makeSongId(song, ['artist', 'track']);
		}

		if (songId in storageData) {
			return storageData[songId];
		}

		return null;
	}

	/**
	 * Save custom song info to the storage.
	 *
	 * @param {Object} song Song instance
	 * @param {Object} dataToSave User data
	 */
	async saveSongInfo(song: Song, dataToSave: EditedSongInfo): Promise<void> {
		const songId = SavedEditsModel.getSongId(song);
		const storageData = await this.getData();

		storageData[songId] = dataToSave;
		await this.saveData(storageData);
	}

	/**
	 * Remove song info from the storage.
	 *
	 * @param {Object} song Song object
	 */
	async removeSongInfo(song: Song): Promise<void> {
		const songId = SavedEditsModel.getSongId(song);
		const storageData = await this.getData();

		delete storageData[songId];
		await this.saveData(storageData);
	}

	/**
	 * Static functions.
	 */

	/**
	 * Get a song ID. If a song internal unique ID is missing,
	 * generate a new unique ID.
	 *
	 * @param {Object} song Song instance
	 *
	 * @return {String} Song unique ID
	 */
	static getSongId(song: Song): string {
		const uniqueId = song.getUniqueId();
		if (uniqueId) {
			return uniqueId;
		}

		return SavedEditsModel.makeSongId(song, Song.BASE_FIELDS);
	}

	/**
	 * Create an unique ID for a song based on song properties.
	 *
	 * @param {Object} song Song instance
	 * @param {Array} properties Array of properties
	 *
	 * @return {String} Generated unique ID
	 */
	static makeSongId(song: Song, properties: string[]): string {
		let inputStr = '';

		for (const field of properties) {
			if (song.parsed[field]) {
				inputStr += song.parsed[field];
			}
		}
		if (inputStr) {
			return md5(inputStr);
		}

		throw new Error('Empty song');
	}
}
