var myDynamicManifest = {
    "name": "Your Great Site",
    "short_name": "Site",
    "description": "Something dynamic",
    "start_url": "/",
    "background_color": "#000000",
    "theme_color": "#0f4a73",
    "icons": [{
      "src": "whatever.png",
      "sizes": "256x256",
      "type": "image/png"
    }]
  };
const stringManifest = JSON.stringify(myDynamicManifest);
const blob = new Blob([stringManifest], {type: 'application/json'});
const manifestURL = URL.createObjectURL(blob);
document.querySelector('#my-manifest-placeholder').setAttribute('href', manifestURL);