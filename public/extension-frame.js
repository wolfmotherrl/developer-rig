(function() {
  const container = {};
  let loggingUnknownActions = false;
  const actions = {
    'extension-frame-init': (event) => {
      const ExtensionFrame = window['extension-coordinator'].ExtensionFrame;
      container.parameters = event.data.parameters;
      container.channelId = event.data.channelId;
      container.parameters.parentElement = document.getElementById('extension-frame');
      container.parameters.dobbin = { trackEvent: () => { } };
      container._ = new ExtensionFrame(container.parameters);
    },
    'developer-rig-authorize': (event) => {
      event.source.postMessage({
        action: "developer-rig-authorized",
        response: {
          channelId: container.channelId,
          clientId: container.parameters.extension.clientId,
          token: container.parameters.extension.token,
          userId: JSON.parse(atob(container.parameters.extension.token.split('.')[1])).opaque_user_id,
        },
      }, event.origin);
    },
    'developer-rig-pubsub': (event) => {
      const { channelId, target, contentType, message } = event.data;
      const url = `${window.origin}/extensions/message/${channelId}`;
      fetch(url, {
        body: JSON.stringify({ targets: [target], content_type: contentType, message }),
        headers: {
          'Accept': 'application/json',
          'Client-ID': container.parameters.extension.clientId,
          'Content-Type': 'application/json',
        },
        method: 'POST',
      }).catch(reason => console.error(url, reason));
    },
    'twitch-ext-loaded': (event) => {
      const ext = document.getElementById('extension-frame').getElementsByTagName('iframe')[0].contentWindow;
      ext.postMessage(event.data, '*');
    },
    'twitch-ext-rig-log': (event) => {
      window.parent.postMessage(event.data, '*');
    },
    'supervisor-ready': (event) => { },
  };

  window.addEventListener('message', (event) => {
    if (event.data && event.data.action) {
      const fn = actions[event.data.action];
      if (fn) {
        fn(event);
      } else if (loggingUnknownActions) {
        console.error(`Unexpected extension frame event action "${event.data.action}"`);
      }
    }
  });
}());
