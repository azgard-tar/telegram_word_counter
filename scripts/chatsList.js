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