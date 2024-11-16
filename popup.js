document.addEventListener('DOMContentLoaded', function() {
    loadSavedUrls();
  
    // 設定保存ボタンのイベントリスナー
    document.getElementById('saveSettings').addEventListener('click', function() {
      const newSetting = {
        name: document.getElementById('name').value || '無名の設定',
        url: document.getElementById('url').value,
        width: document.getElementById('width').value,
        height: document.getElementById('height').value
      };
  
      // 既存の設定を取得して新しい設定を追加
      chrome.storage.sync.get(['urlSettings'], function(data) {
        const settings = data.urlSettings || [];
        settings.push(newSetting);
        chrome.storage.sync.set({ urlSettings: settings }, function() {
          alert('設定を保存しました！');
          loadSavedUrls(); // リストを更新
          clearInputs(); // 入力フィールドをクリア
        });
      });
    });
  
    // モーダルを開くボタンのイベントリスナー
    document.getElementById('openModal').addEventListener('click', async function() {
      await openModalWithCurrentSettings();
    });
});
  
  // 保存されたURL設定をロードして表示
  function loadSavedUrls() {
    const urlList = document.getElementById('urlList');
    urlList.innerHTML = '';
  
    chrome.storage.sync.get(['urlSettings'], function(data) {
      const settings = data.urlSettings || [];
      settings.forEach((setting, index) => {
        const item = document.createElement('div');
        item.className = 'url-item';
        
        // ボタンを個別に作成し、addEventListenerを使用
        const loadBtn = document.createElement('button');
        loadBtn.textContent = '読み込み';
        loadBtn.addEventListener('click', () => loadSetting(index));
  
        const deleteBtn = document.createElement('button');
        deleteBtn.textContent = '削除';
        deleteBtn.addEventListener('click', () => deleteSetting(index));
  
        const openBtn = document.createElement('button');
        openBtn.textContent = '開く';
        openBtn.addEventListener('click', () => openSetting(index));
  
        item.innerHTML = `<span>${setting.name}</span>`;
        item.appendChild(loadBtn);
        item.appendChild(deleteBtn);
        item.appendChild(openBtn);
        
        urlList.appendChild(item);
      });
    });
  }
  
  // 特定の設定を入力フィールドに読み込む
  function loadSetting(index) {
    chrome.storage.sync.get(['urlSettings'], function(data) {
      const setting = data.urlSettings[index];
      document.getElementById('name').value = setting.name;
      document.getElementById('url').value = setting.url;
      document.getElementById('width').value = setting.width;
      document.getElementById('height').value = setting.height;
    });
  }
  
  // 設定を削除
  function deleteSetting(index) {
    chrome.storage.sync.get(['urlSettings'], function(data) {
      const settings = data.urlSettings || [];
      settings.splice(index, 1);
      chrome.storage.sync.set({ urlSettings: settings }, function() {
        loadSavedUrls();
      });
    });
  }
  
  // 特定の設定でモーダルを開く
  function openSetting(index) {
    chrome.storage.sync.get(['urlSettings'], function(data) {
      const setting = data.urlSettings[index];
      openModal(setting);
    });
  }
  
  
  async function openModal(settings) {
    try {
      // アクティブなタブを取得
      const [tab] = await chrome.tabs.query({active: true, currentWindow: true});
      
      // コンテンツスクリプトを注入
      await chrome.scripting.executeScript({
        target: {tabId: tab.id},
        files: ['content.js']
      });
  
      // メッセージを送信
      await chrome.tabs.sendMessage(tab.id, {
        action: 'openModal',
        settings: settings
      });
    } catch (error) {
      console.error('モーダルを開く際にエラーが発生しました:', error);
      alert('モーダルを開けませんでした。ページをリロードして再試行してください。');
    }
  }

  // 現在の入力値でモーダルを開く関数
async function openModalWithCurrentSettings() {
    const settings = {
      url: document.getElementById('url').value,
      width: document.getElementById('width').value,
      height: document.getElementById('height').value
    };
    await openModal(settings);
  }
  
  // 入力フィールドをクリア
  function clearInputs() {
    document.getElementById('name').value = '';
    document.getElementById('url').value = '';
    document.getElementById('width').value = '600';
    document.getElementById('height').value = '400';
  }