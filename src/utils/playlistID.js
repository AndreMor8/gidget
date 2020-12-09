import URL from 'url';
const PLAYLIST_REGEX = /^(PL|UU|LL|RD)[a-zA-Z0-9-_]{16,41}$/;
const ALBUM_REGEX = /^OLAK5uy_[a-zA-Z0-9-_]{33}$/;
const CHANNEL_REGEX = /^UC[a-zA-Z0-9-_]{22,32}$/;
export const getPlaylistID = linkOrId => {
    // Validate inputs
    if (typeof linkOrId !== 'string' || !linkOrId) {
        throw new Error('The linkOrId has to be a string');
    }
    // Clean id provided
    if (PLAYLIST_REGEX.test(linkOrId) || ALBUM_REGEX.test(linkOrId)) {
        return linkOrId;
    }
    if (CHANNEL_REGEX.test(linkOrId)) {
        return `UU${linkOrId.substr(2)}`;
    }
    // Playlist link provided
    const parsed = URL.parse(linkOrId, true);
    if (Object.prototype.hasOwnProperty.call(parsed.query, 'list')) {
        if (PLAYLIST_REGEX.test(parsed.query.list) || ALBUM_REGEX.test(parsed.query.list)) {
            return parsed.query.list;
        }
        throw new Error('invalid or unknown list query in url');
    }
    throw new Error(`Unable to find a id in "${linkOrId}"`);
};

export const validateID = linkOrId => {
    // Validate inputs
    if (typeof linkOrId !== 'string' || !linkOrId) {
        return false;
    }
    // Clean id provided
    if (PLAYLIST_REGEX.test(linkOrId) || ALBUM_REGEX.test(linkOrId)) {
        return true;
    }
    if (CHANNEL_REGEX.test(linkOrId)) {
        return true;
    }
    // Playlist link provided
    const parsed = URL.parse(linkOrId, true);
    if (Object.prototype.hasOwnProperty.call(parsed.query, 'list')) {
        if (PLAYLIST_REGEX.test(parsed.query.list) || ALBUM_REGEX.test(parsed.query.list)) {
            return true;
        }
        return false;
    }
    return false;
};