(function() {
  const queries = new URLSearchParams(document.location.search.substring(1));
  const developerRig = queries.get('developer_rig');
  return developerRig === 'local';
})() && (function(ext) {
  const twitch = window.Twitch = window.Twitch || {};
  twitch.ext = Object.assign(twitch.ext || {}, ext);
})(function() {
  const ext = (window.Twitch && window.Twitch.ext) || {};
  const { onAuthorized } = ext;
  const listeners = {};
  let webSocket, authData, authCallback, followCallback;

  window.addEventListener('DOMContentLoaded', (_event) => {
    webSocket = new WebSocket('wss://localhost.rig.twitch.tv:3003');
    webSocket.addEventListener('message', function(event) {
      if (authData) {
        try {
          let message = JSON.parse(event.data);
          if (message.type === 'MESSAGE') {
            const [channelId, clientId, target] = message.data.topic.split('.').pop().split('-');
            if (authData.channelId === channelId && authData.clientId === clientId) {
              const targetListeners = listeners[target];
              if (targetListeners) {
                message = JSON.parse(message.data.message);
                targetListeners.forEach((fn) => invokeTargetListener(fn, target, message.content_type, message.content[0]));
              }
            }
          }
        } catch (ex) {
          console.error(`Cannot parse event data "${event.data}"`);
        }
      }
    });
    window.addEventListener('message', (event) => {
      if ((event.data && event.data.action) === 'developer-rig-authorized') {
        authData = Object.assign({}, event.data.response);
      }
    });
  });

  return {
    version: '0.0.0',
    onAuthorized: (fn) => {
      onAuthorized(fn);
      authCallback = fn;
      if (!authData) {
        window.parent.postMessage({ action: 'developer-rig-authorize' }, '*');
      }
    },
    send: (target, contentType, message) => {
      if (authData && authData.channelId) {
        window.parent.parent.postMessage({ action: 'developer-rig-pubsub', channelId: authData.channelId, target, contentType, message }, '*');
      } else {
        console.warn('Cannot send; no authorization data');
      }
    },
    listen: (target, callback) => {
      let targetListeners = listeners[target];
      if (!targetListeners) {
        listeners[target] = [callback];
      } else if (!~targetListeners.indexOf(callback)) {
        targetListeners.push(callback);
      }
    },
    unlisten: (target, callback) => {
      let targetListeners = listeners[target];
      if (!targetListeners) {
        return;
      }
      let index = targetListeners.indexOf(callback);
      if (~index) {
        if (targetListeners.length === 1) {
          delete listeners[target];
        } else {
          targetListeners.splice(index, 1);
        }
      }
    },
    actions: {
      followChannel: (channelName) => {
        if (typeof followCallback === 'function') {
          setTimeout(() => followCallback(true, channelName), 11);
        }
      },
      minimize: () => {
      },
      onFollow: (callback) => {
        followCallback = callback;
      },
      requestIdShare: () => {
        if (typeof authCallback === 'function') {
          setTimeout(() => {
            authData.userId = '111111111';
            authCallback(authData);
          }, 11);
        }
      },
    },
  };

  function invokeTargetListener(fn, target, contentType, content) {
    try {
      fn(target, contentType, content);
    } catch (ex) {
      console.error(`Invocation of target listener failed with target "${target}" and content type "${contentType}":`, ex.message);
    }
  }
}());
