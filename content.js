let modal = null;

// メッセージリスナーの設定
chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
  if (request.action === 'openModal') {
    if (modal) {
      modal.remove();
    }
    createModal(request.settings);
  }
});

// ショートカットキーのリスナー
chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
  if (request.action === 'shortcutTriggered') {
    // 最後に使用した設定でモーダルを開く
    chrome.storage.sync.get(['lastUsedSettings'], function(data) {
      if (data.lastUsedSettings) {
        createModal(data.lastUsedSettings);
      }
    });
  }
});

function createModal(settings) {
  // モーダルコンテナを作成
  modal = document.createElement('div');
  modal.className = 'quick-modal-container';
  
  // モーダルコンテンツを作成
  const modalContent = document.createElement('div');
  modalContent.className = 'quick-modal-content';
  modalContent.style.width = settings.width + 'px';
  modalContent.style.height = settings.height + 'px';

  // 閉じるボタンを作成
  const closeBtn = document.createElement('button');
  closeBtn.className = 'quick-modal-close';
  closeBtn.innerHTML = '×';
  closeBtn.onclick = function() {
    modal.remove();
    modal = null;
  };

  // リサイズハンドルを作成
  const resizeHandle = document.createElement('div');
  resizeHandle.className = 'quick-modal-resize-handle';

  // iframeを作成
  const iframe = document.createElement('iframe');
  iframe.src = settings.url;
  iframe.style.width = '100%';
  iframe.style.height = '100%';
  iframe.style.border = 'none';

  // モーダルを組み立て
  modalContent.appendChild(closeBtn);
  modalContent.appendChild(resizeHandle);
  modalContent.appendChild(iframe);
  modal.appendChild(modalContent);
  document.body.appendChild(modal);

  // 最後に使用した設定を保存
  chrome.storage.sync.set({ lastUsedSettings: settings });

  // ドラッグ機能の実装
  let isDragging = false;
  let currentX;
  let currentY;
  let initialX;
  let initialY;
  let xOffset = 0;
  let yOffset = 0;

  modalContent.addEventListener('mousedown', dragStart);
  document.addEventListener('mousemove', drag);
  document.addEventListener('mouseup', dragEnd);

  function dragStart(e) {
    if (e.target === closeBtn || e.target === iframe || e.target === resizeHandle) return;
    initialX = e.clientX - xOffset;
    initialY = e.clientY - yOffset;
    isDragging = true;
  }

  function drag(e) {
    if (isDragging) {
      e.preventDefault();
      currentX = e.clientX - initialX;
      currentY = e.clientY - initialY;
      xOffset = currentX;
      yOffset = currentY;
      setTranslate(currentX, currentY, modalContent);
    }
  }

  function dragEnd(e) {
    isDragging = false;
  }

  function setTranslate(xPos, yPos, el) {
    el.style.transform = `translate(${xPos}px, ${yPos}px)`;
  }

  // リサイズ機能の実装
  let isResizing = false;
  let originalWidth;
  let originalHeight;
  let originalMouseX;
  let originalMouseY;

  resizeHandle.addEventListener('mousedown', function(e) {
    isResizing = true;
    originalWidth = modalContent.offsetWidth;
    originalHeight = modalContent.offsetHeight;
    originalMouseX = e.pageX;
    originalMouseY = e.pageY;
    e.preventDefault();
  });

  document.addEventListener('mousemove', function(e) {
    if (isResizing) {
      const width = originalWidth + (e.pageX - originalMouseX);
      const height = originalHeight + (e.pageY - originalMouseY);
      
      const modalRect = modalContent.getBoundingClientRect();
      const maxWidth = window.innerWidth - modalRect.left - 20;
      const maxHeight = window.innerHeight - modalRect.top - 20;
      const newWidth = Math.min(Math.max(200, width), maxWidth);
      const newHeight = Math.min(Math.max(200, height), maxHeight);
      
      modalContent.style.width = newWidth + 'px';
      modalContent.style.height = newHeight + 'px';
    }
  });

  document.addEventListener('mouseup', function(e) {
    isResizing = false;
  });
}