import * as validUrl from 'valid-url';

function getHostname(url) {
  let hostname = null;

  if (validUrl.isWebUri(url)) {
    hostname = new URL(url).hostname;
  }

  return hostname;
}

export { getHostname };