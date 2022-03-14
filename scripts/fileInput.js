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