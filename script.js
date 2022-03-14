//const data = require('./result.json');
const REGEX = /[\n0-9\[\]\(\)\"%\+\-:?,\.\/a-z|«»]/g;
const WORDS_IGNORE_LIST = ['object', ''];
const COUNT_OF_WORDS_RATING_POSITIONS = 10;
const chatsData = [];

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

function getTableHeader(index, headers) {
  if(!Array.isArray(headers) || !headers.length) {
    console.error('Parameter "headers" must be array of strings');
    return;
  }
  if(typeof index !== 'number') {
    console.error('Parameter "index" must be number');
    return;
  }

  const headerColors = ['', 'green', 'blue'];
  const colorIndex = Math.floor(Math.abs(index % headerColors.length));
  let htmlHeader = `<div class="row header ${headerColors[colorIndex]}">`;
  for(let header of headers) {
    htmlHeader += `<div class="cell">${header}</div>`;
  }
  htmlHeader += '</div>'
  return htmlHeader;
}

function getTableRows(chatMemberWordsRating, headers) {
  if(!Array.isArray(chatMemberWordsRating) || !chatMemberWordsRating.length) {
    console.error('Parameter "headers" must be array');
    return;
  }

  let tableRows = '';

  for(let wordFromRating of chatMemberWordsRating) {
    tableRows += '<div class="row">';
    for(let [index, value] of wordFromRating.entries()) {
      tableRows += `
        <div class="cell" data-title="${headers[index]}">
          ${value}
        </div>
      `;
    }
    tableRows += '</div>';
  }

  return tableRows;
}

function getTabs(chatMemberName, chatMemberWordsRating, index, tableHeaders) {
  const tableRows = getTableRows(chatMemberWordsRating, tableHeaders);
  const tableHeader = getTableHeader(index, tableHeaders)
  const tabs = `
    <input type="radio" name="tabs" id="tab${index}" ${!index && 'checked="checked"'}>
    <label for="tab${index}">${chatMemberName}</label>
    <div class="tab">
      <div class="table">
        ${tableHeader}
        ${tableRows}
      </div>
    </div>
  `;
  return tabs;
}

function initTabs() {
  const tableColumnsHeaders = ['Слово', 'Количество использований'];
  const wrapper = document.getElementById('wrapper');
  wrapper.innerHTML = '';
  if(chatsData.length) {
    const chatMembersTextMessages = parseChats(chatsData);
    const chatMembersWordRating = getChatMembersRating(chatMembersTextMessages);
  
    let index = 0;
    let htmlTabs = '<div class="tabs">';
    for(let chatMemberName in chatMembersWordRating) {
      htmlTabs += getTabs(
        chatMemberName, 
        chatMembersWordRating[chatMemberName], 
        index, 
        tableColumnsHeaders
      );
      index++;
    }
    htmlTabs += '</div>';
    wrapper.innerHTML = htmlTabs;
  }
}

function initHelpMenu() {
  const acc = document.getElementsByClassName("accordion");
  let i;

  for (i = 0; i < acc.length; i++) {
      acc[i].addEventListener("click", function() {
          this.classList.toggle("active");

          let panel = this.nextElementSibling;
          if (panel.style.display === "block") {
              panel.style.display = "none";
          } else {
              panel.style.display = "block";
          }
      });
  }
}

function onRemoveChatClick(event) {
  const removedItem = event.target.closest('.chats_item');
  if(removedItem) {
    const removedIndex = chatsData.findIndex(el => el.name === removedItem.id);
    chatsData.splice(removedIndex, 1);
    initTabs();
    removedItem.remove();
  }
}

function getChatItem(chatName) {
  const chatsItem = document.createElement('div');
  chatsItem.className = 'chats_item';
  chatsItem.id = chatName;

  const chatsItemWrapper = document.createElement('div');
  chatsItemWrapper.className = 'chats_item_wrapper';

  const chatsItemText = document.createTextNode(chatName);
  const chatsItemButton = document.createElement('button');
  chatsItemButton.className = 'chats_item_button';
  chatsItemButton.innerText = ' — ';
  chatsItemButton.addEventListener('click', onRemoveChatClick);

  chatsItemWrapper.appendChild(chatsItemText);
  chatsItemWrapper.appendChild(chatsItemButton);
  chatsItem.appendChild(chatsItemWrapper);

  return chatsItem;
}

function initChatsList(newChats) {
  const chats = document.getElementById('chats');

  for(let chat of newChats) {
    chats.appendChild(getChatItem(chat.name));
  }
}

function onChange(event) {
  const reader = new FileReader();
  reader.onload = (event) => {
    const obj = JSON.parse(event.target.result);
    chatsData.push(obj);
    initTabs();
    initChatsList([obj]);
  };
  reader.readAsText(event.target.files[0]);
}


document.getElementById('file').addEventListener('change', onChange);
initHelpMenu();