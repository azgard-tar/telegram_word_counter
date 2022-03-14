const chatsData = [];
const REGEX = /[\n0-9\[\]\(\)\"%\+\-:?,\.\/a-z|«»]/g;
const WORDS_IGNORE_LIST = ['object', ''];
const COUNT_OF_WORDS_RATING_POSITIONS = 10;