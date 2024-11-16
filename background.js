// メッセージリスナーの設定
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    console.log('受信したメッセージ:', message);
    
    // メッセージの種類に応じて処理を行う
    switch (message.type) {
      case 'openModal':
        // モーダルを開く処理
        break;
      // 他のメッセージタイプの処理をここに追加
    }
    
    return true; // 非同期レスポンスの場合は必要
  });
  
  // コマンドリスナーの設定（ショートカットキー用）
  chrome.commands.onCommand.addListener((command) => {
    if (command === 'open-modal') {
      // モーダルを開く処理
    }
  });