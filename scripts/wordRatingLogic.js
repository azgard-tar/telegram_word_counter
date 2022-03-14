function parseChatObject(messages) {
  if(Array.isArray(messages) && messages.length) {
    const chatTextMessages = {};
    for( let message of messages ) {
      if(chatTextMessages[message.from]) {
        chatTextMessages[message.from].push(message.text);
      } else if(message.from) {
        chatTextMessages[message.from] = [message.text];
      }
    }
    return chatTextMessages;
  } else {
    throw new Error('Invalid input data: messages should be array of message objects(from .json output of telegram)');
  }
}

function parseChats(chats) {
  const messages = [];
  for(let chat of chats) {
    if(chat.messages && Array.isArray(chat.messages)) {
      messages.push(...chat.messages);
    }
  }
  return parseChatObject(messages);
}

function removeSpecialSymbolsFromString(string) {
  return string.replace(REGEX,'');
}

function convertTextsToPreparedString(texts) {
  return removeSpecialSymbolsFromString(texts.join(' ').toLowerCase());
}

function convertTextsToPreparedWords(texts) {
  return convertTextsToPreparedString(texts)
          .split(' ')
          .sort()
          .filter(el => WORDS_IGNORE_LIST.indexOf(el) === -1);
}

function getRatingOfWords(texts) {
  const words = convertTextsToPreparedWords(texts);
  const wordsRating = [];
  let currentWord = words[0];
  let currentCount = 0;

  words.forEach(word => {
    if(word === currentWord) {
      currentCount++;
    } else {
      wordsRating.push([currentWord, currentCount]);
      currentWord = word;
      currentCount = 1;
    }
  });

  return wordsRating.sort((a,b) => b[1] - a[1])
}

function getChatMembersRating(chatMembersMessages) {
  const chatMembersWordsRating = {};
  for(let member in chatMembersMessages) {
    let memberWordsRating = getRatingOfWords(chatMembersMessages[member]);
    memberWordsRating = memberWordsRating.splice(0, COUNT_OF_WORDS_RATING_POSITIONS);
    chatMembersWordsRating[member] = memberWordsRating;
  }

  return chatMembersWordsRating;
}