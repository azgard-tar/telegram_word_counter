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