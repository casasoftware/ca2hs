const Placeholder = Object.freeze(class {

  static get(obj, path, def) {

    /**
     * If the path is a string, convert it to an array
     * @param  {String|Array} path The path
     * @return {Array}             The path array
     */
    var stringToPath = function (path) {

      // If the path isn't a string, return it
      if (typeof path !== 'string') return path;

      // Create new array
      var output = [];

      // Split to an array with dot notation
      path.split('.').forEach(function (item) {

        // Split to an array with bracket notation
        item.split(/\[([^}]+)\]/g).forEach(function (key) {

          // Push to the new array
          if (key.length > 0) {
            output.push(key);
          }

        });

      });

      return output;

    };

    // Get the path as an array
    path = stringToPath(path);

    // Cache the current object
    var current = obj;

    // For each item in the path, dig into the object
    for (var i = 0; i < path.length; i++) {

      // If the item isn't found, return the default (or null)
      if (!current[path[i]]) return def;

      // Otherwise, update the current  value
      current = current[path[i]];

    }

    return current;

  }
  /*!
  * Replaces placeholders with real content
  * Requires get() - https://vanillajstoolkit.com/helpers/get/
  * (c) 2019 Chris Ferdinandi, MIT License, https://gomakethings.com
  * @param {String} template The template string
  * @param {String} local    A local placeholder to use, if any
  */
  static replace(template, data) {
    'use strict';

    // Check if the template is a string or a function
    template = typeof (template) === 'function' ? template() : template;
    if (['string', 'number'].indexOf(typeof template) === -1) throw 'PlaceholdersJS: please provide a valid template';

    // If no data, return template as-is
    if (!data) return template;

    // Replace our curly braces with data
    template = template.replace(/\{\{([^}]+)\}\}/g, function (match) {

      // Remove the wrapping curly braces
      match = match.slice(2, -2);

      // Get the value
      var val = Placeholder.get(data, match.trim());

      // Replace
      if (!val) return '{{' + match + '}}';
      return val;

    });

    return template;
  }
});

// Reference: https://developer.mozilla.org/en-US/docs/Web/Manifest
class ManifestHandler {

  #manifestEl;
  #manifestDataPromise;


  constructor() {
    // Context
    this.replace = this.replace.bind(this);
    // Init
    this.#manifestEl = document.querySelector('[rel=manifest]');
    this.#manifestDataPromise = this.#retrieveData();
  }

  #clean(data = {}){
    for(let k in data) !data[k] && delete data[k];
    return data;
  }

  #retrieveData(){
    return this.#manifestEl ? fetch(this.#manifestEl.href)
                              .then(rsp => rsp.text())
                              .then(txt => JSON.parse(txt))
                            :
                              Promise.resolve({});
  }

  async getData() {
    return await (this.#manifestDataPromise ?? this.#retrieveData());
  }

  async replace(data = {}) {
    const oldManifestData = await this.getData();
    const newManifestData = this.#clean(data);
    const manifestData = { ...oldManifestData, ...newManifestData };
    // Modify current manifest
    if (!this.#manifestEl) {
      this.#manifestEl = document.createElement('link');
      this.#manifestEl.setAttribute('rel', 'manifest');
      document.head.appendChild(this.#manifestEl);
    }

    const stringManifest = JSON.stringify(manifestData);
    const blob = new Blob([stringManifest], { type: 'application/json' });
    const manifestURL = URL.createObjectURL(blob);
    this.#manifestEl.setAttribute('href', manifestURL);
    //
    this.#manifestDataPromise = null;
    //
    alert('Changes to manifest applied successfully');
  }
};

const PopupHandler = Object.freeze(class {
  static #MANIFEST_POPUP_TPL = `
        <div class="a2hs-modal" id="ca2hs" style="color: black; position: fixed; width: 100vw; height: 100vh; opacity: 1; visibility: visible; transition: all 0.3s ease; top: 0; left: 0; display: flex; align-items: center; justify-content: center; z-index: 9999;">
            <div class="a2hs-modal-bg a2hs-modal-exit" style="position: absolute; background: teal; width: 100%; height: 100%;"></div>
            <div class="a2hs-modal-container" style="border-radius: 10px; background: #fff; position: relative; padding: 30px;">
                <h1>Install this site as an app:</h1>
                <form class="a2hs-modal-form" style="display: grid; grid-template-columns: 75px auto; grid-column-gap: 25px;">
                  <label for="ca2hs-id">ID</label>
                  <input type="text" id="ca2hs-id" name="id">
                  <label for="ca2hs-name">Name</label>
                  <input type="text" id="ca2hs-name" name="name" required>
                  <label for="ca2hs-url">Start Url</label>
                  <input type="text" id="ca2hs-url" name="start_url" required>
                  <label for="ca2hs-shortname">Short name</label>
                  <input type="text" id="ca2hs-shortname" name="short_name">
                  <label for="ca2hs-description">Description</label>
                  <input type="text" id="ca2hs-description" name="description">
                  <label for="ca2hs-display">Display</label>
                  <select id="ca2hs-display" name="display">
                    <option value="" selected>---</option>
                    <option value="fullscreen">Fullscreen</option>
                    <option value="standalone">Standalone</option>
                    <option value="minimal-ui">Mininal UI</option>
                    <option value="browser">Browser</option>
                  </select>
                  <label for="ca2hs-orientation">Orientation</label>
                  <select id="ca2hs-orientation" name="orientation">
                    <option value="" selected>---</option>  
                    <option value="any">Any</option>
                    <option value="natural">Natural</option>
                    <option value="landscape">Landscape</option>
                    <option value="landscape-primary">Landscape primary</option>
                    <option value="landscape-secondary">Landscape secondary</option>
                    <option value="portrait">Portrait</option>
                    <option value="portrait-primary">Portrait primary</option>
                    <option value="portrait-secondary">Portrait secondary</option>
                  </select>
                  <label for="ca2hs-dir">Direction</label>
                  <select id="ca2hs-dir" name="direction">
                    <option value="" selected>---</option>
                    <option value="ltr">Left to right</option>
                    <option value="rtl">Right to left</option>
                    <option value="auto">Auto</option>
                  </select>
                  <label for="ca2hs-lang">Language</label>
                  <input type="text" id="ca2hs-lang" name="lang">

                  <input type='submit' value='Apply'>
                </form>
                <button class="a2hs-modal-close a2hs-modal-exit" style="position: absolute; right: 15px; top: 15px; outline: none; appearance: none; color: red; background: none; border: 0px; font-weight: bold; cursor: pointer;">X</button>
            </div>
        </div>`;

  static close(){
    if(typeof(ca2hs) !== 'undefined') ca2hs.style.display = 'none';
  }

  static openManifestWizard(callback = console.log) {
    if(typeof(ca2hs) === 'undefined')
      // FIXME:
      document.body.innerHTML += PopupHandler.#MANIFEST_POPUP_TPL;
    else
      ca2hs.style.display = 'flex';
    
    const exits = ca2hs.querySelectorAll('.a2hs-modal-exit');
    exits.forEach(function (exit) {
      exit.addEventListener('click', function () {
        event.preventDefault();
        // FIXME: Remove/hide modal from DOM
        PopupHandler.close();
      });
    });

    const forms = ca2hs.querySelectorAll('.a2hs-modal-form');
    forms.forEach(function (form) {
      form.addEventListener('submit', function (e) {
        e.preventDefault();
        const formData = new FormData(e.target);
        const dataJson = Object.fromEntries(formData);
        callback(dataJson);
        PopupHandler.close();
      });
    });
  }
});


//   /** CONSTANTS */
//   // https://json.schemastore.org/web-manifest.json
//   schema: {
//     "title": "JSON schema for Web Application manifest files",
//     "$schema": "http://json-schema.org/draft-04/schema#",
//     "id": "https://json.schemastore.org/web-manifest.json",

//     "type": "object",

//     "properties": {
//       "background_color": {
//         "description": "The background_color member describes the expected background color of the web application.",
//         "type": "string"
//       },
//       "dir": {
//         "description": "The base direction of the manifest.",
//         "enum": ["ltr", "rtl", "auto"],
//         "default": "auto"
//       },
//       "display": {
//         "description": "The item represents the developer's preferred display mode for the web application.",
//         "enum": ["fullscreen", "standalone", "minimal-ui", "browser"],
//         "default": "browser"
//       },
//       "icons": {
//         "description": "The icons member is an array of icon objects that can serve as iconic representations of the web application in various contexts.",
//         "type": "array",
//         "items": {
//           "$ref": "#/definitions/manifest_image_resource"
//         }
//       },
//       "lang": {
//         "description": "The primary language for the values of the manifest.",
//         "type": "string"
//       },
//       "name": {
//         "description": "The name of the web application.",
//         "type": "string"
//       },
//       "orientation": {
//         "description": "The orientation member is a string that serves as the default orientation for all  top-level browsing contexts of the web application.",
//         "enum": ["any", "natural", "landscape", "portrait", "portrait-primary", "portrait-secondary", "landscape-primary", "landscape-secondary"]
//       },
//       "prefer_related_applications": {
//         "description": "Boolean value that is used as a hint for the user agent to say that related applications should be preferred over the web application.",
//         "type": "boolean"
//       },
//       "related_applications": {
//         "description": "Array of application accessible to the underlying application platform that has a relationship with the web application.",
//         "type": "array",
//         "items": {
//           "$ref": "#/definitions/external_application_resource"
//         }
//       },
//       "scope": {
//         "description": "A string that represents the navigation scope of this web application's application context.",
//         "type": "string"
//       },
//       "short_name": {
//         "description": "A string that represents a short version of the name of the web application.",
//         "type": "string"
//       },
//       "shortcuts": {
//         "description": "Array of shortcut items that provide access to key tasks within a web application.",
//         "type": "array",
//         "items": {
//           "$ref": "#/definitions/shortcut_item"
//         }
//       },
//       "start_url": {
//         "description": "Represents the URL that the developer would prefer the user agent load when the user launches the web application.",
//         "type": "string"
//       },
//       "theme_color": {
//         "description": "The theme_color member serves as the default theme color for an application context.",
//         "type": "string"
//       },
//       "id": {
//         "description": "A string that represents the id of the web application.",
//         "type": "string"
//       }
//     },
//     "definitions": {
//       "manifest_image_resource": {
//         "type": "object",
//         "properties": {
//           "sizes": {
//             "description": "The sizes member is a string consisting of an unordered set of unique space-separated tokens which are ASCII case-insensitive that represents the dimensions of an image for visual media.",
//             "oneOf": [
//               {
//                 "type": "string",
//                 "pattern": "^[0-9 x]+$"
//               },
//               {
//                 "enum": ["any"]
//               }
//             ]
//           },
//           "src": {
//             "description": "The src member of an image is a URL from which a user agent can fetch the icon's data.",
//             "type": "string"
//           },
//           "type": {
//             "description": "The type member of an image is a hint as to the media type of the image.",
//             "type": "string",
//             "pattern": "^[\\sa-z0-9\\-+;\\.=\\/]+$"
//           },
//           "purpose": {
//             "type": "string",
//             "enum": [
//               "monochrome",
//               "maskable",
//               "any",
//               "monochrome maskable",
//               "monochrome any",
//               "maskable monochrome",
//               "maskable any",
//               "any monochrome",
//               "any maskable",
//               "monochrome maskable any",
//               "monochrome any maskable",
//               "maskable monochrome any",
//               "maskable any monochrome",
//               "any monochrome maskable",
//               "any maskable monochrome"
//             ],
//             "default": "any"
//           }
//         },
//         "required": ["src"]
//       },
//       "external_application_resource": {
//         "type": "object",
//         "properties": {
//           "platform": {
//             "description": "The platform it is associated to.",
//             "enum": ["chrome_web_store", "play", "itunes", "windows"]
//           },
//           "url": {
//             "description": "The URL where the application can be found.",
//             "type": "string",
//             "format": "uri"
//           },
//           "id": {
//             "description": "Information additional to the URL or instead of the URL, depending on the platform.",
//             "type": "string"
//           },
//           "min_version": {
//             "description": "Information about the minimum version of an application related to this web app.",
//             "type": "string"
//           },
//           "fingerprints": {
//             "description": "An array of fingerprint objects used for verifying the application.",
//             "type": "array",
//             "items": {
//               "type": "object",
//               "properties": {
//                 "type": {
//                   "type": "string"
//                 },
//                 "value": {
//                   "type": "string"
//                 }
//               }
//             }
//           }
//         },
//         "required": ["platform"]
//       },
//       "shortcut_item": {
//         "type": "object",
//         "description": "A shortcut item represents a link to a key task or page within a web app. A user agent can use these values to assemble a context menu to be displayed by the operating system when a user engages with the web app's icon.",
//         "properties": {
//           "name": {
//             "description": "The name member of a shortcut item is a string that represents the name of the shortcut as it is usually displayed to the user in a context menu.",
//             "type": "string"
//           },
//           "short_name": {
//             "description": "The short_name member of a shortcut item is a string that represents a short version of the name of the shortcut. It is intended to be used where there is insufficient space to display the full name of the shortcut.",
//             "type": "string"
//           },
//           "description": {
//             "description": "The description member of a shortcut item is a string that allows the developer to describe the purpose of the shortcut.",
//             "type": "string"
//           },
//           "url": {
//             "description": "The url member of a shortcut item is a URL within scope of a processed manifest that opens when the associated shortcut is activated.",
//             "type": "string"
//           },
//           "icons": {
//             "description": "The icons member of a shortcut item serves as iconic representations of the shortcut in various contexts.",
//             "type": "array",
//             "items": {
//               "$ref": "#/definitions/manifest_image_resource"
//             }
//           }
//         },
//         "required": ["name", "url"]
//       }
//     }
//   },
// }
